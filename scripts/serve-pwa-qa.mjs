import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const port=Number(process.argv[2]||3012),root=resolve(process.argv[3]||'dist');
const {base}=JSON.parse(readFileSync(resolve(root,'pwa-build.json'),'utf8'));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ogg':'audio/ogg','.mp3':'audio/mpeg'};
createServer((req,res)=>{
 res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive, nosnippet');
 let path=new URL(req.url,'http://localhost').pathname;
 const fixtures=['/slots.html','/slots.js','/evolution.html','/evolution.js'];
 if(path==='/qa.html'||fixtures.includes(path)){
  const file=path==='/qa.html'?'qa/pwa.html':'test-results'+path;
  res.setHeader('Content-Type',types[extname(file)]);res.end(readFileSync(file,'utf8').replaceAll('/file-island-echoes/',base));return;
 }
 if(!path.startsWith(base)){res.writeHead(404).end();return;}
 try{path=decodeURIComponent(path.slice(base.length))||'index.html';}catch{res.writeHead(400).end();return;}
 const file=resolve(root,path);
 if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(readFileSync(file));
}).listen(port,'127.0.0.1',()=>console.log('Disposable '+base+' PWA QA: http://127.0.0.1:'+port+'/qa.html'));
