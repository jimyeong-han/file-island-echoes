import {ENEMIES} from '../src/data';
// Opt-in DOM checks on the disposable visual fixture page, never in production.
const nav=document.querySelector('#qa-show')!.parentElement!;
const start=document.createElement('button');start.textContent='Run combat checks';start.id='qa-combat-checks';nav.append(start);
const output=document.createElement('pre');output.id='qa-combat-results';output.setAttribute('role','status');output.style.cssText='max-height:130px;overflow:auto;max-width:100%;font:12px monospace;white-space:pre-wrap';nav.append(output);
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const click=(selector:string)=>{const e=document.querySelector<HTMLButtonElement>(selector);if(!e||e.disabled)throw Error('Unavailable: '+selector);e.click();};
const waitReady=async()=>{for(let i=0;i<100;i++){if(document.querySelector('#app')?.getAttribute('data-combat-busy')==='false')return;await sleep(40);}throw Error('Input remains locked');};
const assert=(ok:unknown,message:string)=>{if(!ok)throw Error(message);};
const energy=()=>Number(document.querySelector('.energy-orb')?.firstChild?.textContent?.trim());
const turn=()=>Number(document.querySelector('.turn-info b')?.textContent);
const fixture=async(character:string,state='battle')=>{
 (document.querySelector('#qa-character') as HTMLSelectElement).value=character;
 (document.querySelector('#qa-state') as HTMLSelectElement).value=state;
 click('#qa-show');await waitReady();
};
const health=()=>[...document.querySelectorAll<HTMLMeterElement>('.partner-health meter')].map(m=>m.value);
start.onclick=async()=>{
 start.disabled=true;output.textContent='Running…';let lines:string[]=[];
 try{
  for(const id of ['tai','matt','sora','koushiro','mimi','joe','tk','kari']){
   await fixture(id);assert(document.querySelectorAll('.hand>.game-card').length===5,id+' first hand');
   const before=energy();click('[data-action="card:0"]');
   assert(document.querySelector('#app')?.getAttribute('data-combat-busy')==='true','card not locked');
   document.querySelector<HTMLButtonElement>('[data-action="end"]')!.click();await waitReady();
   assert(turn()===1,'end accepted during card motion');assert(energy()===before-1,id+' duplicate or missing card');
   assert(document.querySelectorAll('.card-flight').length===0,'flight leaked');
   for(let n=0;n<3;n++){const prior=turn();click('[data-action="end"]');document.querySelector<HTMLButtonElement>('[data-action="end"]')!.click();await waitReady();assert(turn()===prior+1,id+' duplicate end');assert(document.querySelectorAll('.hand>.game-card').length===5,id+' turn draw');assert(new Set(health()).size===1,id+' health mismatch');}
   lines.push(id+': first draw, one-tap card, 3 turns, double input, health PASS');output.textContent=lines.join('\n');
  }
  await fixture('kari','two-enemies');click('[data-action="end"]');let labels:string[]=[];
  for(let i=0;i<170;i++){const s=document.querySelector('.motion-status')?.textContent||'';if(s&&!labels.includes(s))labels.push(s);await sleep(10);}await waitReady();
  assert([...document.querySelectorAll('.enemy:not(.defeated)')].every(e=>getComputedStyle(e).opacity==='1'),'enemy opacity');
  assert(labels.findIndex(s=>s.includes('쿠가몬'))<labels.findIndex(s=>s.includes('쉘몬'))&&labels.some(s=>s.includes('쉘몬')),'enemy order');lines.push('Two enemies: '+labels.join(' → '));
  click('.battle-log summary');const nums=[...document.querySelectorAll<HTMLLIElement>('.battle-log li')].map(e=>e.value);assert(nums.every((v,i)=>i===0||v===nums[i-1]+1),'log order');
  await fixture('tai','status-death');click('[data-action="end"]');await waitReady();assert(document.querySelector('.result-screen.defeat'),'status death hung');
  await fixture('kari','near-win');click('[data-action="card:0"]');await waitReady();assert(document.querySelector('.reward-screen'),'card victory hung');
  await fixture('tai');click('[data-action="card:0"]');click('.top-actions [data-action="help"]');assert(document.querySelector('#app')?.getAttribute('data-combat-busy')==='false','modal failed to cancel');assert(!document.querySelector('.card-flight'),'modal flight leaked');click('[data-action="close"]');
  lines.push('Log ordering, status death, victory and modal cancellation PASS');output.textContent=lines.join('\n')+'\nALL PASS';
 }catch(e){output.textContent=lines.join('\n')+'\nFAIL: '+String(e);}finally{start.disabled=false;}
};
const patterns=document.createElement('button');patterns.textContent='Check enemy motions';nav.append(patterns);
patterns.onclick=async()=>{
 patterns.disabled=true;output.textContent='Checking enemy motions…';const lines:string[]=[],seen=new Set<string>();
 try{for(const [id,e] of Object.entries(ENEMIES))for(const [step,action] of e.pattern.entries()){
  if(seen.has(action.type))continue;seen.add(action.type);
  (document.querySelector('#qa-enemy') as HTMLSelectElement).value=id;(document.querySelector('#qa-step') as HTMLInputElement).value=String(step);
  await fixture('kari','enemy-pattern');click('[data-action="end"]');let visible=false;
  for(let i=0;i<16;i++){await sleep(40);if(document.querySelector('.acting-enemy.intent-'+action.type))visible=true;}
  await waitReady();assert(visible,'missing motion: '+action.type);assert(turn()===2,'turn failed: '+action.type);assert(new Set(health()).size===1,'health desync');
  lines.push(action.type+' · '+action.label+' PASS');output.textContent=lines.join('\n');
 }output.textContent=lines.join('\n')+'\nALL ENEMY MOTIONS PASS';}catch(e){output.textContent+='\nFAIL '+String(e);}finally{patterns.disabled=false;}
};
const faces=document.createElement('button');faces.textContent='Check card faces';nav.append(faces);
faces.onclick=async()=>{
 faces.disabled=true;
 try{
  await fixture('tai');click('[data-action="end"]');
  let sawBack=false,sawFront=false,leaked=false;
  for(let i=0;i<35;i++){
   await sleep(40);const c=document.querySelector('.hand .is-dealing');if(!c)continue;
   const front=getComputedStyle(c.querySelector('.card-front')!).visibility==='visible',back=getComputedStyle(c.querySelector('.card-back')!).visibility==='visible';
   if(back)sawBack=true;if(front)sawFront=true;if(front&&back)leaked=true;
  }
  await waitReady();assert(sawBack&&sawFront&&!leaked,'front/back overlap or absent flip');
  document.querySelector('#qa-faces')?.remove();const sheet=document.createElement('section');sheet.id='qa-faces';sheet.style.cssText='display:flex;gap:24px;flex-wrap:wrap;padding:30px;justify-content:center;background:#102730';
  for(const [label,time] of [['뒷면 · 배분 중 (120ms)',120],['앞면 · 뒤집힘 완료 (460ms)',460]] as const){
   const cell=document.createElement('div'),title=document.createElement('h2');title.textContent=label;title.style.fontSize='16px';cell.append(title);
   const c=document.querySelector('.hand .game-card')!.cloneNode(true) as HTMLElement;c.removeAttribute('data-action');c.setAttribute('aria-hidden','true');c.inert=true;c.classList.add('is-dealing');c.style.cssText='--deal-delay:0ms;min-height:330px;';cell.append(c);sheet.append(cell);
  }
  document.body.insertBefore(sheet,nav);await sleep(30);
  [...sheet.querySelectorAll('.game-card')].forEach((c,i)=>c.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=i?460:120;}));
  sheet.scrollIntoView({block:'center'});output.textContent='BACK → FRONT PASS: dedicated SVG back; no simultaneous front/back exposure. Paused samples shown below.';
 }catch(e){output.textContent='FAIL '+String(e);}finally{faces.disabled=false;}
};
const endings=document.createElement('button');endings.textContent='Check evolution and results';nav.append(endings);
endings.onclick=async()=>{
 endings.disabled=true;const lines:string[]=[];output.textContent='Checking…';
 try{
  for(const id of ['tai','matt','sora','koushiro','mimi','joe','tk','kari']){
   for(const state of ['evolution','evolution-final']){await fixture(id,state);assert(document.querySelector('.evolution-screen'),'missing evolution '+id);click('[data-action="evolution-done"]');assert(document.querySelector('.route-map'),'evolution exit '+id);}
   await fixture(id,'boss-win');click('[data-action="card:0"]');await waitReady();assert(document.querySelector('.result-screen.victory'),'boss victory '+id);
   await fixture(id,'status-death');click('[data-action="end"]');await waitReady();assert(document.querySelector('.result-screen.defeat'),'defeat '+id);
   lines.push(id+': both evolutions, boss victory, defeat PASS');output.textContent=lines.join('\n');
  }output.textContent+='\nALL EVOLUTION/RESULT PASS';
 }catch(e){output.textContent+='\nFAIL '+String(e);}finally{endings.disabled=false;}
};
const logs=document.createElement('button');logs.textContent='Check log scroll';nav.append(logs);
logs.onclick=async()=>{
 try{
  await fixture('tai','history');click('.battle-log summary');let list=document.querySelector<HTMLElement>('.battle-log ol')!;list.scrollTop=0;
  click('[data-action="card:0"]');await waitReady();list=document.querySelector<HTMLElement>('.battle-log ol')!;
  assert(list.scrollTop===0,'reader scroll stolen');list.scrollTop=list.scrollHeight;click('[data-action="end"]');await waitReady();list=document.querySelector<HTMLElement>('.battle-log ol')!;
  assert(list.scrollHeight-list.clientHeight-list.scrollTop<20,'bottom follower failed');output.textContent='LOG SCROLL PASS: past position preserved; bottom follows new events';
 }catch(e){output.textContent='FAIL '+String(e);}
};
