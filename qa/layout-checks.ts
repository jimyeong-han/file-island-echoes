// Explicit, local-only DOM regression checks. Fixtures do not touch production saves.
const panel=document.querySelector('#qa-show')!.parentElement!;
const button=document.createElement('button');button.textContent='Check v0.8.1 layout';panel.append(button);
const output=document.createElement('pre');output.id='qa-layout-results';output.style.cssText='white-space:pre-wrap;max-height:100px;overflow:auto';panel.append(output);
const pause=(ms=60)=>new Promise(r=>setTimeout(r,ms));
const click=(s:string)=>{const e=document.querySelector<HTMLButtonElement>(s);if(!e||e.disabled)throw Error('Unavailable '+s);e.focus();e.click();};
const check=(v:unknown,s:string)=>{if(!v)throw Error(s);};
const ready=async()=>{for(let i=0;i<100;i++){if(document.querySelector('#app')?.getAttribute('data-combat-busy')==='false')return;await pause(40);}throw Error('locked');};
const fixture=async(state:string)=>{(document.querySelector('#qa-state') as HTMLSelectElement).value=state;click('#qa-show');await ready();};
const dialogCheck=()=>{
 const close=document.querySelector('.close-button')!,title=document.querySelector('#dialog-title')!,body=document.querySelector('.dialog-body')!;
 const c=close.getBoundingClientRect(),t=title.getBoundingClientRect(),b=body.getBoundingClientRect();
 check(c.width===44&&c.height===44,'close size');check(t.right<=c.left&&t.bottom<=b.top,'title overlap');
 check(!document.elementFromPoint(t.left+2,t.top+2)?.closest('.close-button'),'close intercepts title');
 body.scrollTop=body.scrollHeight;check(close.getBoundingClientRect().top===c.top,'close scrolls away');body.scrollTop=0;
 check(document.activeElement===close,'initial close focus');
};
button.onclick=async()=>{
 button.disabled=true;const lines:string[]=[];output.textContent='Checking…';
 try{
  await fixture('two-enemies');
  check(!document.querySelector('.compact-health,.combat-anchor,.target-label'),'duplicate rows');
  check(document.querySelectorAll('.partner-health meter').length===1,'partner meter count');
  check(document.querySelectorAll('[data-action="ability"]').length===1,'analysis count');
  const parts=[...document.querySelector('.battle-heading')!.children];check(parts[0].classList.contains('battle-title')&&parts[1].getAttribute('data-action')==='ability'&&parts[2].classList.contains('turn-info'),'header order');
  for(const fighter of document.querySelectorAll('.battlefield .fighter')){const nodes=[...fighter.children];const name=nodes.indexOf(fighter.querySelector('.fighter-name')!),image=nodes.indexOf(fighter.querySelector('.sprite')!),hp=nodes.indexOf(fighter.querySelector('.partner-health,.enemy-health')!);check(image<name&&name<hp,'name not between sprite and HP');check(nodes.indexOf(fighter.querySelector('.status-tags')!)<nodes.indexOf(fighter.querySelector('.sprite')!),'effects below sprite');}
  const rects=()=>{const f=document.querySelector('.battlefield')!.getBoundingClientRect();return [...document.querySelectorAll('.enemy>.sprite,.battlefield')].map(e=>{const r=e.getBoundingClientRect();return [r.x-f.x,r.y-f.y,r.width,r.height];});};
  const initial=rects();
  for(let i=0;i<6;i++){click('[data-action="target:'+(i%2)+'"]');check(JSON.stringify(rects())===JSON.stringify(initial),'target shifts');check(document.querySelectorAll('.enemy[aria-pressed="true"]:not(.defeated)').length===1,'selection count');}
  const hp=Number(document.querySelectorAll('.enemy-health meter')[1].getAttribute('value'));
  const attack=[...document.querySelectorAll<HTMLButtonElement>('.hand button')].find(e=>!e.disabled&&/피해 \d/.test(e.getAttribute('aria-label')||''));
  if(attack){attack.click();await ready();check(Number(document.querySelectorAll('.enemy-health meter')[1].getAttribute('value'))<hp,'damage wrong target');}
  lines.push('Header order, single HP, fixed target geometry/selection and card target PASS');
  for(const action of ['help','settings','archive','deck','ability','retire']){
   click('[data-action="'+action+'"]');dialogCheck();click('.close-button');check((document.activeElement as HTMLElement)?.dataset.action===action,'focus return '+action);lines.push(action+' dialog PASS');
  }
  click('[data-action="settings"]');click('[data-action="data"]');dialogCheck();click('[data-action="save-reset"]');dialogCheck();click('.close-button');check((document.activeElement as HTMLElement)?.dataset.action==='settings','nested focus');lines.push('Save/reset dialogs PASS (no deletion)');
  await fixture('map');click('[data-action="preview:greymon"]');dialogCheck();click('.close-button');lines.push('Evolution preview PASS');
  click('[data-action="home"]');click('[data-action="new"]');dialogCheck();click('.close-button');lines.push('New exploration confirmation PASS');
  output.textContent=lines.join('\n')+'\nALL LAYOUT CHECKS PASS';
 }catch(e){output.textContent=lines.join('\n')+'\nFAIL '+String(e);}finally{button.disabled=false;}
};
