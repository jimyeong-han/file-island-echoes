import {freshSave,exportSave,prepareImport} from '../src/save-files';
import {newRun,enterNode,playCard} from '../src/engine';
import {saveRun,SAVE_KEY,loadSave} from '../src/storage';
import {CHARACTER_IDS} from '../src/types';
const stable=(v:any):string=>JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b))):x);
const result=document.querySelector('pre')!;let snapshot='';
const show=()=>{const save=loadSave().save;result.textContent=JSON.stringify(save,null,2);};
document.querySelector('#inspect')!.addEventListener('click',show);
document.querySelector('#capture')!.addEventListener('click',()=>{snapshot=JSON.stringify(loadSave().save.runs);result.textContent='Captured all slots';});
document.querySelector('#compare')!.addEventListener('click',()=>{result.textContent=JSON.stringify({unchanged:snapshot===JSON.stringify(loadSave().save.runs),count:Object.keys(loadSave().save.runs).length});});
document.querySelector('#seed')!.addEventListener('click',()=>{const s=freshSave();for(const [i,id]of CHARACTER_IDS.entries()){const r=newRun(100+i,id);r.started=1000+i;r.screen='map';enterNode(r,'0a');playCard(r,0);saveRun(s,r,2000+i);}s.settings.reducedMotion=true;localStorage.setItem(SAVE_KEY,JSON.stringify(s));show();});
document.querySelector('#backup')!.addEventListener('click',()=>{const s=loadSave().save,f=exportSave(s);result.textContent=JSON.stringify({roundtrip:stable(prepareImport(f.text).save)===stable(s),bytes:new TextEncoder().encode(f.text).length,count:Object.keys(s.runs).length});});

for(const [width,height,zoom] of [[1280,900,1],[320,740,1],[390,844,1],[412,915,1],[320,740,2]]){const button=document.createElement('button');button.textContent=`Show ${width}x${height} slots ${zoom}x text`;button.onclick=()=>{document.querySelector('iframe')?.remove();const frame=document.createElement('iframe');frame.title='Responsive game';frame.style.cssText=`width:${width}px;height:${height}px;border:0`;frame.src='/file-island-echoes/';frame.onload=()=>{const doc=frame.contentDocument!;if(zoom===2)doc.documentElement.style.fontSize='32px';(doc.querySelector('[data-action="slots"]') as HTMLButtonElement)?.click();setTimeout(()=>{result.textContent=JSON.stringify({viewport:frame.contentWindow!.innerWidth,scroll:doc.documentElement.scrollWidth,zoom,slots:Array.from(doc.querySelectorAll('.slot-button')).map(e=>({width:e.clientWidth,scroll:e.scrollWidth,height:e.clientHeight})),dialog:doc.querySelector('dialog')?.getBoundingClientRect().toJSON()},null,2);frame.scrollIntoView();},100);};document.body.append(frame);};document.body.insertBefore(button,result);}
