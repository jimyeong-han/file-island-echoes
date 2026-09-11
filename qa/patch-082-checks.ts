// Opt-in, disposable fixtures. Only UI events, layout and rendered results are checked.
const nav=document.querySelector('#qa-show')!.parentElement!;
const button=document.createElement('button');button.textContent='Check v0.8.2 layout';nav.append(button);
const output=document.createElement('pre');output.id='qa-082-results';output.style.cssText='white-space:pre-wrap;max-height:100px;overflow:auto';nav.append(output);
const pause=(ms=100)=>new Promise(r=>setTimeout(r,ms));
const assert=(v:unknown,m:string)=>{if(!v)throw Error(m);};
const click=(s:string)=>{const e=document.querySelector<HTMLButtonElement>(s);if(!e||e.disabled)throw Error(s);e.focus();e.click();};
const ready=async()=>{for(let i=0;i<100;i++){if(document.querySelector('#app')?.getAttribute('data-combat-busy')==='false')return;await pause(40);}throw Error('locked');};
const fixture=async(state:string,id='tai')=>{(document.querySelector('#qa-state') as HTMLSelectElement).value=state;(document.querySelector('#qa-character') as HTMLSelectElement).value=id;click('#qa-show');assert(nav.dataset.renderedFixture===state,'fixture did not render: '+state);await ready();await pause();};
const size=()=>{const field=document.querySelector('.battlefield')!.getBoundingClientRect();return [...document.querySelectorAll('.player>.sprite,.enemy>.sprite')].map(e=>{const r=e.getBoundingClientRect();return [r.x-field.x,r.y-field.y,r.width,r.height,field.height];});};
button.onclick=async()=>{
 button.disabled=true;const lines:string[]=[];output.textContent='Checking…';
 try{
  for(const [state,count] of [['reward-one',1],['reward-two',2],['reward',3],['reward-long',3]] as const){
   await fixture(state);const rail=document.querySelector<HTMLElement>('.reward-cards')!,cards=[...rail.querySelectorAll<HTMLButtonElement>('.game-card')];
   assert(cards.length===count,'reward count');assert(cards.every(c=>c.offsetTop===cards[0].offsetTop&&c.offsetWidth===210),'reward wraps/stretches');
   assert(new Set(cards.map(c=>c.offsetHeight)).size===1,'reward heights');assert(document.documentElement.scrollWidth<=innerWidth,'document overflow');
   const overflow=rail.scrollWidth>rail.clientWidth;
   if(overflow){rail.dispatchEvent(new WheelEvent('wheel',{deltaY:180,bubbles:true,cancelable:true}));await pause(250);assert(rail.scrollLeft>0,'wheel scroll');}
   cards.at(-1)!.focus();let visible=false;for(let frame=0;frame<30;frame++){await pause(50);const r=rail.getBoundingClientRect(),c=cards.at(-1)!.getBoundingClientRect();if(c.left>=r.left-1&&c.right<=r.right+1){visible=true;break;}}assert(visible,'focused last card clipped');
   assert(!rail.contains(document.querySelector('[data-action="skip"]')),'skip in rail');
   lines.push(state+': one row, 210px, equal height, focus/scroll PASS');
  }
  await fixture('reward');const deck=Number(document.querySelector('[data-action="deck"]')!.textContent!.replace(/\D/g,''));click('.reward-cards .game-card');assert(Number(document.querySelector('[data-action="deck"]')!.textContent!.replace(/\D/g,''))===deck+1,'reward not added');
  await fixture('reward');click('[data-action="skip"]');assert(Number(document.querySelector('[data-action="deck"]')!.textContent!.replace(/\D/g,''))===10,'skip changed deck');
  for(const id of ['tai','matt','sora','koushiro','mimi','joe','tk','kari']){
   await fixture('hud-zero',id);const zero=size(),chip=document.querySelector('.crest-resource');
   assert(!!chip===['matt','mimi','joe','tk','kari'].includes(id),'resource ownership');
   if(chip){const guard=document.querySelector('.player .fighter-label>span:not(.crest-resource)')!;assert(chip.getBoundingClientRect().bottom<=guard.getBoundingClientRect().top,'resource below guard');}
   assert(!document.querySelector('.guide-banner'),'guide remains');assert(!document.querySelector('.crest-hud')!.textContent!.includes('중첩 없음'),'empty stack text');
   const use=document.querySelector<HTMLElement>('.crest-button')!;assert(use.scrollHeight<=use.clientHeight&&use.scrollWidth<=use.clientWidth,'crest button text clipped');
   const h=document.querySelector('.crest-hud')!.getBoundingClientRect().height;
   if(innerWidth>760&&parseFloat(getComputedStyle(document.documentElement).fontSize)===16)assert(h<=56,'desktop HUD tall');
   await fixture('hud-rich',id);assert(JSON.stringify(size())===JSON.stringify(zero),'resource changes fighter geometry');assert(document.querySelector('[data-action="crest"]')?.getAttribute('aria-describedby')==='crest-progress','disabled reason link');
   await fixture('hud-used',id);assert(document.querySelector('.crest-progress')?.textContent==='사용 완료','used status');
   await fixture('hud-sealed',id);assert(document.querySelector('.crest-progress')?.textContent==='봉인 2턴','sealed status');
   lines.push(id+': compact HUD, resource placement/stable geometry, used/sealed PASS');
  }
  await fixture('two-enemies');const before=size();
  for(let i=0;i<4;i++){click('[data-action="target:'+(i%2)+'"]');assert(JSON.stringify(size())===JSON.stringify(before),'selection shifts');assert(document.querySelectorAll('.enemy[aria-pressed="true"]').length===1,'selected count');for(const e of document.querySelectorAll('.enemy')){const field=getComputedStyle(e.querySelector('.target-field')!),selected=e.getAttribute('aria-pressed')==='true';assert((field.display!=='none')===selected,'field visibility');assert(Number(getComputedStyle(e.querySelector('.sprite')!).zIndex)>Number(getComputedStyle(e.querySelector('.fighter-base')!).zIndex),'field above sprite');}}
  const bar=document.querySelector('.topbar')!,height=bar.getBoundingClientRect().height,safe=parseFloat(getComputedStyle(bar).paddingTop);assert(Math.abs(height-safe-(innerWidth<=760?48:60))<1,'topbar height');
  const buttons=[...document.querySelectorAll('.top-actions button')],rects=buttons.map(e=>e.getBoundingClientRect());assert(rects.every(r=>r.width>=44&&r.height>=44&&r.top===rects[0].top),'menu hit area/row');
  for(let i=0;i<10;i++)click('.top-actions [data-action="sound"]');assert(JSON.stringify([...document.querySelectorAll('.top-actions button')].map(e=>[e.getBoundingClientRect().x,e.getBoundingClientRect().width]))===JSON.stringify(rects.map(r=>[r.x,r.width])),'sound shifts menu');
  click('[data-action="settings"]');assert(!document.querySelector('[data-action="guide"]'),'dead guide setting');click('.close-button');
  lines.push('Reward selection/skip, target field layers, 48/60px header and 10 sound toggles PASS');output.textContent=lines.join('\n')+'\nALL v0.8.2 CHECKS PASS';
 }catch(e){output.textContent=lines.join('\n')+'\nFAIL '+String(e);}finally{button.disabled=false;}
};
