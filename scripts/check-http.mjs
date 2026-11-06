import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root=process.argv[3]||'dist';
const config=JSON.parse(readFileSync(root+'/deployment.json','utf8'));
const base = new URL(process.argv[2] || 'http://127.0.0.1:3001'+config.base);
assert.equal(base.pathname,config.base,'Use the built target base URL with a trailing slash');
const manifest = JSON.parse(readFileSync('src/asset-manifest.json', 'utf8'));
const audioManifest=JSON.parse(readFileSync('src/audio-manifest.json','utf8'));
const built = readFileSync(root+'/index.html', 'utf8');
const refs = [...built.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)].map(x => x[1]);
const fonts=readdirSync('public/assets/fonts').filter(p=>p.endsWith('.woff2')).map(p=>'assets/fonts/'+p);
const pwaIcons=JSON.parse(readFileSync(root+'/manifest.webmanifest','utf8')).icons.map(i=>i.src);
const chunks=readdirSync(root+'/assets').filter(p=>/\.(js|css)$/.test(p)).map(p=>'assets/'+p);
const paths = ['sw.js','pwa-build.json','deployment.json',...chunks,...pwaIcons,...fonts,...Object.values(audioManifest).flatMap(c=>c.files.map(p=>'assets/audio/'+p)), '', 'index.html', 'robots.txt', 'assets/ui/card-back.svg', ...refs, ...[
  ...Object.values(manifest.characters), ...manifest.backgrounds, ...Object.values(manifest.portraits),
].map(p => 'assets/' + p)];
await Promise.all(paths.map(async path => {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  if(config.target==='vercel')assert.match(response.headers.get('x-robots-tag')||'',/noindex.*nofollow.*noarchive.*nosnippet/,'Vercel crawler header');
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
