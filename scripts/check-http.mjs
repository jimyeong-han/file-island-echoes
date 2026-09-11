import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const base = new URL(process.argv[2] || 'http://127.0.0.1:3001/file-island-echoes/');
assert(base.pathname.endsWith('/file-island-echoes/'), 'Use the project base URL with a trailing slash');
const manifest = JSON.parse(readFileSync('src/asset-manifest.json', 'utf8'));
const audioManifest=JSON.parse(readFileSync('src/audio-manifest.json','utf8'));
const built = readFileSync('dist/index.html', 'utf8');
const refs = [...built.matchAll(/(?:src|href)="([^"]+)"/g)].map(x => x[1]);
const fonts=readdirSync('public/assets/fonts').filter(p=>p.endsWith('.woff2')).map(p=>'assets/fonts/'+p);
const paths = [...fonts,...Object.values(audioManifest).flatMap(c=>c.files.map(p=>'assets/audio/'+p)), '', 'index.html', 'robots.txt', 'assets/ui/card-back.svg', ...refs, ...[
  ...Object.values(manifest.characters), ...manifest.backgrounds, ...Object.values(manifest.portraits),
].map(p => 'assets/' + p)];
await Promise.all(paths.map(async path => {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  if(path.endsWith('.ogg'))assert.match(response.headers.get('content-type')||'',/audio\/ogg|application\/ogg/);
  if(path.endsWith('.mp3'))assert.match(response.headers.get('content-type')||'',/audio\/(?:mpeg|mp3)/);
  if(path.endsWith('.woff2'))assert.match(response.headers.get('content-type')||'',/font\/woff2|application\/(?:font-woff|octet-stream)/);
  if (path.endsWith('.webp')) assert.match(response.headers.get('content-type') || '', /image\/webp/);
  if (!path || path === 'index.html') {
    const html = await response.text();
    for (const ref of refs) assert(html.includes(ref), `Site still serves an older build: ${ref}`);
    assert(html.includes('noindex, nofollow, noarchive, nosnippet'));
  } else await response.arrayBuffer();
}));
console.log(`HTTP checks passed: ${paths.length} URLs; current build, project base, noindex and WebP content types.`);
