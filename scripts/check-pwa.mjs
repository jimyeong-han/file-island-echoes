import assert from 'node:assert/strict';import {readFileSync,statSync} from 'node:fs';
import {deployment} from '../config/deployment.mjs';
const target=deployment(process.argv[2]||'pages'),root=process.argv[3]||'dist';
const m=JSON.parse(readFileSync(root+'/manifest.webmanifest','utf8'));const base=new URL(target.base,'https://example.test');for(const key of ['id','scope','start_url'])assert.equal(new URL(m[key],base).href,base.href);assert.equal(m.display,'standalone');assert.equal(m.lang,'ko');
for(const size of [192,512])for(const purpose of ['any','maskable']){const icon=m.icons.find(i=>i.sizes===`${size}x${size}`&&i.purpose===purpose);assert(icon);const bytes=readFileSync(root+'/'+icon.src);assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size);}
const apple=readFileSync(root+'/assets/pwa/apple-touch-icon.png');assert.equal(apple.readUInt32BE(16),180);
const p=JSON.parse(readFileSync(root+'/pwa-build.json','utf8'));assert.equal(p.base,target.base);for(const key of ['id','scope','start_url'])assert.equal(m[key],target.base);assert(p.bytes<17*1024*1024);for(const file of p.files){assert(!file.startsWith('/')&&!file.includes('file-island-echoes/'));assert(statSync(root+'/'+file).isFile());assert(!/\.webp$/.test(file));if(/\.(mp3|ogg)$/.test(file))assert(p.music.includes(file)||JSON.parse(readFileSync('src/touch-sfx.json')).some(id=>file.endsWith('/'+id+'.mp3')||file.endsWith('/'+id+'.ogg')));}
assert(p.files.includes('art/data-silhouette.svg'),'Offline silhouette must be precached');
assert(!p.files.some(f=>f.startsWith('assets/poses/')),'Battle atlases must stay on demand');
const sw=readFileSync(root+'/sw.js','utf8');assert(sw.includes(p.build));assert(!sw.includes('localStorage'));assert(sw.includes("e.data?.type==='APPLY_UPDATE'"));console.log(`PWA checks passed: ${m.icons.length} icons, ${p.files.length} shell files, ${p.bytes} bytes`);

const audio=JSON.parse(readFileSync('src/audio-manifest.json'));const music=Object.values(audio).filter(c=>c.kind==='music').flatMap(c=>c.files.map(f=>'assets/audio/'+f));assert.deepEqual(p.music,music);assert.equal(p.music.length,28);assert(p.musicBytes<14*1024*1024);assert.equal(p.musicBytes,music.reduce((n,f)=>n+statSync(root+'/'+f).size,0));for(const f of music)assert.equal(p.files.filter(x=>x===f).length,1);
for(const id of ['music-evolution','music-evolution-dark'])for(const f of audio[id].files)assert(p.music.includes('assets/audio/'+f));
