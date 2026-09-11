export function createWorker(env, config) {
 const prefix='file-island-echoes-', shell=prefix+'shell-'+config.build, runtime=prefix+'runtime-v1';
 const base=new URL(config.base,env.location.origin), index=new URL('index.html',base).href;
 const urls=config.files.map(p=>new URL(p,base).href);
 const eligible=req=>{const u=new URL(req.url);return req.method==='GET'&&u.origin===base.origin&&u.pathname.startsWith(base.pathname)&&!req.headers.has('range');};
 async function install(){const cache=await env.caches.open(shell);try{await cache.addAll(urls);}catch(e){await env.caches.delete(shell);throw e;}}
 async function activate(){for(const name of await env.caches.keys())if(name.startsWith(prefix)&&![shell,runtime].includes(name))await env.caches.delete(name);await env.clients.claim();}
 async function fetchRequest(req){
  if(!eligible(req))return env.fetch(req);
  const core=await env.caches.open(shell);
  // Serve HTML from the same installation as its hashed JS/CSS, online or offline.
  if(req.mode==='navigate'){const page=await core.match(index);if(page)return page;return env.fetch(req);}
  const cached=await core.match(req,{ignoreSearch:true});if(cached)return cached;
  const u=new URL(req.url);if(!/\.(?:webp|png|svg|woff2|mp3|ogg|js|css)$/.test(u.pathname))return env.fetch(req);
  const key=new URL(req.url);key.searchParams.set('__asset',config.revisions?.[u.pathname]||config.build);
  const cache=await env.caches.open(runtime),hit=await cache.match(key.href);if(hit)return hit;
  try{const response=await env.fetch(req);if(response.status===200&&response.type!=='opaque'){try{await cache.put(key.href,response.clone());const keys=await cache.keys();if(keys.length>180)await cache.delete(keys[0]);}catch{/* Storage pressure must not break gameplay. */}}return response;}catch{return new Response('',{status:503,statusText:'Asset unavailable offline'});}
 }
 return {install,activate,eligible,fetchRequest,shell,runtime};
}
