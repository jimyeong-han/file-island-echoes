export function createWorker(env, config) {
 const prefix='file-island-echoes-', shell=prefix+'shell-'+config.build, runtime=prefix+'runtime-v1';
 const base=new URL(config.base,env.location.origin), index=new URL('index.html',base).href;
 const music=config.music||[],pack=prefix+'music-'+config.build;
 const keyFor=path=>{const u=new URL(path,base);u.searchParams.set('__asset',config.revisions?.[u.pathname]||config.build);return u.href;};
 const urls=config.files.filter(f=>!music.includes(f)).map(p=>new URL(p,base).href);
 const eligible=req=>{const u=new URL(req.url);return req.method==='GET'&&req.cache!=='no-store'&&u.origin===base.origin&&u.pathname.startsWith(base.pathname)&&!['sw.js','pwa-build.json'].some(p=>u.pathname===base.pathname+p)&&!req.headers.has('range');};
 async function install(){const cache=await env.caches.open(shell);try{
  await cache.addAll(urls);const target=await env.caches.open(pack),older=(await env.caches.keys()).filter(n=>n.startsWith(prefix+'music-')&&n!==pack);
  for(const path of music){const key=keyFor(path);let response;for(const name of older){response=await(await env.caches.open(name)).match(key);if(response?.status===200)break;}
   if(!response)response=await env.fetch(new Request(new URL(path,base),{cache:'reload'}));
   if(response.status!==200||response.type==='opaque')throw Error('Incomplete music pack');await target.put(key,response.clone());
  }
 }catch(e){await env.caches.delete(shell);await env.caches.delete(pack);throw e;}}
 async function musicStatus(){try{const cache=await env.caches.open(pack);let count=0;for(const path of music)if((await cache.match(keyFor(path)))?.status===200)count++;return {ready:music.length>0&&count===music.length,count,total:music.length};}catch{return {ready:false,count:0,total:music.length};}}
 async function activate(){for(const name of await env.caches.keys())if(name.startsWith(prefix)&&![shell,runtime,pack].includes(name))await env.caches.delete(name);await env.clients.claim();}
 async function fetchRequest(req){
  if(!eligible(req))return env.fetch(req);
  const core=await env.caches.open(shell);
  // Serve HTML from the same installation as its hashed JS/CSS, online or offline.
  if(req.mode==='navigate'){const page=await core.match(index);if(page)return page;return env.fetch(req);}
  const musicPath=new URL(req.url).pathname.slice(base.pathname.length);if(music.includes(musicPath)){const saved=await(await env.caches.open(pack)).match(keyFor(musicPath));if(saved)return saved;try{return await env.fetch(req);}catch{return new Response('',{status:503});}}
  const cached=await core.match(req,{ignoreSearch:true});if(cached)return cached;
  const u=new URL(req.url);if(!/\.(?:webp|png|svg|woff2|mp3|ogg|js|css)$/.test(u.pathname))return env.fetch(req);
  const key=new URL(req.url);key.searchParams.set('__asset',config.revisions?.[u.pathname]||config.build);
  const cache=await env.caches.open(runtime),hit=await cache.match(key.href);if(hit)return hit;
  try{const response=await env.fetch(req);if(response.status===200&&response.type!=='opaque'){try{await cache.put(key.href,response.clone());const keys=await cache.keys();if(keys.length>180)await cache.delete(keys[0]);}catch{/* Storage pressure must not break gameplay. */}}return response;}catch{return new Response('',{status:503,statusText:'Asset unavailable offline'});}
 }
 return {install,activate,eligible,fetchRequest,musicStatus,shell,runtime,pack};
}
