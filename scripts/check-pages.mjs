import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { gzipSync } from 'node:zlib';

const base = '/file-island-echoes/';
const root = resolve('dist');
const html = readFileSync(join(root, 'index.html'), 'utf8');
assert.match(html, /<meta\s+name="robots"\s+content="noindex, nofollow, noarchive, nosnippet"\s*\/?\s*>/);
assert.equal(readFileSync(join(root, 'robots.txt'), 'utf8').trim(), 'User-agent: *\nDisallow: /');
assert.doesNotMatch(html, /application\/ld\+json|property=["']og:|name=["']twitter:|rel=["']canonical/i);

const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
assert(refs.some(ref => ref.endsWith('.js')), 'Built entry script is missing');
for (const ref of refs) {
  assert(ref.startsWith(base), `Resource is outside the project path: ${ref}`);
  assert(statSync(join(root, ref.slice(base.length))).isFile(), `Missing built resource: ${ref}`);
}

const manifest = JSON.parse(readFileSync('src/asset-manifest.json', 'utf8'));
const images = [...Object.values(manifest.characters), ...manifest.backgrounds, ...Object.values(manifest.portraits)];
for (const path of images) {
  assert(/^(characters|backgrounds|portraits)\/[a-z0-9-]+\.(webp|svg)$/.test(path), `Invalid asset path: ${path}`);
  assert(statSync(join(root, 'assets', path)).size > 1000, `Missing or empty art: ${path}`);
}
assert(statSync(join(root, 'assets/ui/card-back.svg')).size > 1000, 'Dedicated card back is missing');
let checked = 0, rawBytes = 0, compressedBytes = 0;
function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    assert(!entry.isSymbolicLink(), 'Pages output must not contain symlinks');
    if (entry.isDirectory()) { inspect(file); continue; }
    assert(!/^(?:\.env(?:\.|$)|sitemap)|\.(?:map|pem|key)$/i.test(entry.name), 'Unexpected deployment file');
    const bytes = readFileSync(file);
    rawBytes += bytes.length;
    const isText = ['.html','.js','.css','.svg','.txt','.json'].includes(extname(file));
    compressedBytes += isText ? gzipSync(bytes).length : bytes.length;
    if (!isText) { checked++; continue; }
    const text = bytes.toString('utf8');
    assert.doesNotMatch(text, /[A-Z]:[\\/]|\/(?:Users|home)\//, 'Personal filesystem path in output');
    assert.doesNotMatch(text, /gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9_-]{32,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'Credential-like value in output');
    assert.doesNotMatch(text, /data:image\/(?:png|webp|jpeg);base64,/, 'Raster art must be separate files');
    checked++;
  }
}
inspect(root);
const audioManifest=JSON.parse(readFileSync('src/audio-manifest.json','utf8'));
const audioBytes=Object.values(audioManifest).flatMap(c=>c.files).reduce((n,p)=>n+statSync(join(root,'assets/audio',p)).size,0);
assert(audioBytes<15*1024*1024,'Audio exceeds the separate 15 MiB budget');
assert(compressedBytes-audioBytes<10*1024*1024,'Non-audio deployment exceeds 10 MiB');
assert.doesNotMatch(readFileSync(refs.find(r=>r.endsWith('.js')).replace(base,root+'/'),'utf8'),/data:audio\/.*base64/);
console.log('Audio checks: '+Object.keys(audioManifest).length+' cues / '+audioBytes+' bytes (both codecs).');
console.log(`Pages checks passed: ${checked} files, ${images.length} manifest images; paths, crawler directives, common credential/path patterns. All files: ${rawBytes} raw bytes / ${compressedBytes} estimated transferred bytes.`);
