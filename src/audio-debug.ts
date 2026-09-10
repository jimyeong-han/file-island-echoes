/** Local-only, opt-in diagnostics. Dynamically imported behind import.meta.env.DEV.
 * No telemetry, persistence, or console logging; the last 160 entries stay in this DOM. */
export function installAudioDebug() {
  const query=new URLSearchParams(location.search),delay=Math.min(1000,Math.max(0,Number(query.get('audioDelay'))||0));
  const panel=document.createElement('details');panel.id='audio-debug';
  panel.style.cssText='position:fixed;bottom:0;left:0;z-index:9999;background:#102231;color:#fff;max-height:35vh;max-width:100vw;overflow:auto;font:12px monospace';
  panel.innerHTML='<summary>Local audio timing</summary><pre></pre>';document.body.append(panel);
  const output=panel.querySelector('pre')!,rows:object[]=[],labels=new WeakMap<object,string>();let input=0;
  const log=(row:object)=>{rows.push(row);if(rows.length>160)rows.shift();output.textContent=JSON.stringify(rows,null,2);};
  for(const type of ['pointerdown','pointerup','click','keydown'])document.addEventListener(type,e=>{
    const target=(e.target as Element).closest<HTMLElement>('[data-action]');if(!target)return;
    input=performance.now();log({event:type,action:target.dataset.action,t:input});
  },true);
  const originalFetch=window.fetch.bind(window);
  window.fetch=async(...args)=>{
    if(!String(args[0]).includes('/assets/audio/'))return originalFetch(...args);
    const t=performance.now(),id=String(args[0]).split('/').at(-1)!;
    if(delay)await new Promise(r=>setTimeout(r,delay));
    const response=await originalFetch(...args),read=response.arrayBuffer.bind(response);
    response.arrayBuffer=async()=>{const data=await read();labels.set(data,id);return data;};
    log({fetch:id,ms:performance.now()-t,status:response.status});return response;
  };
  const Constructor=window.AudioContext;
  if(!Constructor)return;
  window.AudioContext=class extends Constructor {
    constructor(options?:AudioContextOptions){super(options);log({context:true,baseLatency:this.baseLatency,outputLatency:this.outputLatency,options:options||'default'});}
    decodeAudioData(data:ArrayBuffer,success?:DecodeSuccessCallback,error?:DecodeErrorCallback):Promise<AudioBuffer>{
      const t=performance.now();return super.decodeAudioData(data).then(buffer=>{labels.set(buffer,labels.get(data)||'unknown');log({decode:labels.get(buffer),ms:performance.now()-t,pcmBytes:buffer.length*buffer.numberOfChannels*4});success?.(buffer);return buffer;},e=>{error?.(e);throw e;});
    }
    createBufferSource(){const source=super.createBufferSource(),start=source.start.bind(source);
      source.start=(when=0,offset=0,duration?:number)=>{
        log({start:source.buffer?labels.get(source.buffer):null,inputMs:performance.now()-input,scheduledMs:1000*(when-this.currentTime)});
        if(duration===undefined)start(when,offset);else start(when,offset,duration);
      };return source;
    }
  };
}
