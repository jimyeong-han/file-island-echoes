// Appended to the disposable local main module; never shipped in dist.
import {CARD_EFFECT_ROWS} from '../src/effect-data';
import {effectSvg,actorSelector,sourceAnchor} from '../src/combat-effects';
const fxSelect=document.createElement('select');fxSelect.id='qa-skill';fxSelect.setAttribute('aria-label','QA skill');fxSelect.innerHTML=Object.keys(CARD_EFFECT_ROWS).map(id=>`<option value="${id}">${id}</option>`).join('');qaControls.append(fxSelect);
const fxOutput=document.createElement('pre');fxOutput.id='qa-effects-result';fxOutput.setAttribute('role','status');fxOutput.style.cssText='max-height:100px;overflow:auto;white-space:pre-wrap';qaControls.append(fxOutput);
const fxPause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const fxAssert=(ok:unknown,msg:string)=>{if(!ok)throw Error(msg);};
const fxSetup=(id:string)=>{
 motion.finish();combatEffects.stop();modal='';view='game';const c=CARDS[id],r=newRun(82,c.owner||'tai');r.screen='map';enterNode(r,'0a');r.form=Object.entries(FORMS).find(([,f])=>f.upgraded===id)?.[0]||CHARACTERS[r.characterId].forms[0];r.hp=r.maxHp=FORMS[r.form].hp;r.battle!.hand=[id];r.battle!.energy=3;r.battle!.enemies=[makeEnemy('kuwaga'),makeEnemy('devimon')];r.battle!.enemies.forEach(e=>e.hp=e.maxHp=300);saveRun(save,r);render();focusBattle();return r;
};
for(const phase of ['travel','impact'] as const){const b=document.createElement('button');b.textContent=phase==='travel'?'FX 시전 정지':'FX 적중 정지';qaControls.append(b);b.onclick=()=>{const id=fxSelect.value,before=structuredClone(fxSetup(id)),after=structuredClone(before);playCard(after,0);const plan=cardAttackPlan(before,after,id)!;presented=phase==='impact'?after:before;render();const field=root.querySelector<HTMLElement>('.battlefield')!,rect=field.getBoundingClientRect();const point=(a:import('../src/combat-effects').Actor,source=false)=>{const b=root.querySelector(actorSelector(a)+' > .sprite')!.getBoundingClientRect(),p=source?sourceAnchor(plan.spec.kind,a,b.width,b.height):{x:b.width*.5,y:b.height*.48};return {x:b.left+p.x-rect.left,y:b.top+p.y-rect.top};};field.insertAdjacentHTML('beforeend',`<svg class="combat-fx" aria-hidden="true" viewBox="0 0 ${rect.width} ${rect.height}">${effectSvg(plan,point(plan.from,true),plan.contacts.map(c=>point(c.actor)),phase,.6,reduced())}</svg>`);fxOutput.textContent=id+' '+phase+' · 실제 렌더러의 정지 프레임';};}
const fxCheck=document.createElement('button');fxCheck.textContent='v0.12 전체 검사';qaControls.append(fxCheck);
fxCheck.onclick=async()=>{
 fxCheck.disabled=true;let count=0,maxFrame=0,interval=0;const lines:string[]=[];
 const trace=()=>{const phases=new Set<string>();let prior=performance.now();interval=window.setInterval(()=>{const now=performance.now();maxFrame=Math.max(maxFrame,now-prior);prior=now;const svg=root.querySelector<SVGElement>('.combat-fx');if(svg)phases.add(svg.dataset.phase||'');},16);return phases;};
 try{
  for(const id of Object.keys(CARD_EFFECT_ROWS)){fxSetup(id);const phases=trace(),before=structuredClone(activeRun(save)!);await animateCard(0);clearInterval(interval);fxAssert(phases.has('impact')&&(reduced()||phases.has('travel')),'missing phases '+id);fxAssert(!document.querySelector('.combat-fx,.card-flight'),'leak '+id);fxAssert(!motion.busy,'lock '+id);const expected=structuredClone(before);playCard(expected,0);fxAssert(JSON.stringify(activeRun(save))===JSON.stringify(expected),'rules '+id);count++;fxOutput.textContent=`Cards ${count}/39 PASS`;
  }
  lines.push('39 attacks / 8 partners and all stages PASS');count=0;
  for(const [id,d] of Object.entries(ENEMIES))for(const [step,a] of d.pattern.entries())if(['attack','drain'].includes(a.type)){const r=fxSetup('flame');r.battle!.enemies=[makeEnemy(id)];r.battle!.enemies[0].step=step;r.hp=r.maxHp=300;render();const phases=trace();await animateTurn();clearInterval(interval);fxAssert(phases.has('impact'),'enemy '+id+':'+step);fxAssert(!document.querySelector('.combat-fx'),'enemy leak');count++;fxOutput.textContent=lines.join('\n')+`\nEnemy ${count}/39 PASS`;}
  lines.push('39 enemy attacks / small enemies and bosses PASS');
  fxSetup('missile');const action=animateCard(0);await fxPause(65);motion.finish();await action;fxAssert(!document.querySelector('.combat-fx,.card-flight')&&!motion.busy,'cancel');
  fxSetup('cat');await animateCard(0);lines.push('Cancel / re-entry PASS');
  const r=fxSetup('flame');r.battle!.enemies[0].block=999;render();let guard=false;const timer=setInterval(()=>guard ||= !!document.querySelector('.fx-guard'),16);await animateCard(0);clearInterval(timer);fxAssert(guard,'guard reaction');lines.push('Full guard PASS');
  fxOutput.textContent=lines.join('\n')+`\nALL PASS · longest DOM sampling interval ${Math.round(maxFrame)}ms`;
 }catch(e){fxOutput.textContent=lines.join('\n')+'\nFAIL '+String(e);}finally{clearInterval(interval);fxCheck.disabled=false;}
};
