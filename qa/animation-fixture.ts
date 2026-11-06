// Appended only to the disposable local visual fixture, never the shipped app.
import {hasPose,poseFrame,setPose,BODY_ORIGINS,bodyOrigin} from '../src/battle-poses';
const motionPanel=document.createElement('section');motionPanel.style.cssText='background:#13232e;color:white;padding:8px;display:flex;gap:6px;flex-wrap:wrap';qaControls.append(motionPanel);
motionPanel.innerHTML='<select aria-label="QA motion phase"><option>prepare</option><option>travel</option><option>impact</option><option>recover</option></select><button id="qa-motion-frame">동작 프레임 확인</button><button id="qa-enemy-frame">적 동작 프레임</button><button id="qa-pose-fallback">포즈 대체 표시</button><button id="qa-motion-play">동작 재생</button><button id="qa-motion-check">v0.15.1 동작 검사</button><pre id="qa-motion-result" role="status"></pre>';
const motionResult=motionPanel.querySelector<HTMLPreElement>('#qa-motion-result')!;
const selectedPhase=()=>motionPanel.querySelector<HTMLSelectElement>('select')!.value as import('../src/battle-poses').PosePhase;
const holdMotionFrame=(plan:AttackPlan,phase:import('../src/battle-poses').PosePhase)=>{
 combatEffects.stop();setPose(root.querySelector(actorSelector(plan.from)+' > .sprite'),poseFrame(phase,plan.spec.kind,plan.key));
 if(phase==='impact'||phase==='recover')for(const c of plan.contacts)setPose(root.querySelector(actorSelector(c.actor)+' > .sprite'),c.reaction==='null'?0:phase==='recover'?5:c.reaction==='guard'?1:4);
 if(phase==='prepare'||phase==='recover')return;
 const field=root.querySelector<HTMLElement>('.battlefield')!,box=field.getBoundingClientRect();
 const point=(actor:import('../src/combat-effects').Actor,source=false)=>{const el=root.querySelector<HTMLElement>(actorSelector(actor)+' > .sprite')!,r=el.getBoundingClientRect(),p=source?bodyOrigin(el.dataset.pose!,plan.spec.kind,actor!=='player',r.width,r.height,plan.key):{x:r.width*.5,y:r.height*.48};return {x:r.left+p.x-box.left,y:r.top+p.y-box.top};};
 field.insertAdjacentHTML('beforeend',`<svg class="combat-fx" aria-hidden="true" viewBox="0 0 ${box.width} ${box.height}">${effectSvg(plan,point(plan.from,true),plan.contacts.map(c=>point(c.actor)),phase,.55,false)}</svg>`);
};
motionPanel.querySelector('#qa-motion-frame')!.addEventListener('click',()=>{
 const before=structuredClone(fxSetup(fxSelect.value)),after=structuredClone(before);playCard(after,0);
 const plan=cardAttackPlan(before,after,fxSelect.value)!,phase=selectedPhase();presented=phase==='impact'||phase==='recover'?after:before;render();holdMotionFrame(plan,phase);
 focusBattle();motionResult.textContent=`${before.form} · ${phase} · frame ${poseFrame(phase,plan.spec.kind)} · 신규 포즈 ${hasPose(before.form)}`;
});
motionPanel.querySelector('#qa-motion-play')!.addEventListener('click',async()=>{fxSetup(fxSelect.value);await animateCard(0);motionResult.textContent=JSON.stringify({muted:save.settings.muted,level:gameAudio.mixer.status.level,busy:motion.busy,remainingEffects:root.querySelectorAll('.combat-fx').length});});
motionPanel.querySelector('#qa-enemy-frame')!.addEventListener('click',()=>{
 const r=fxSetup('flame'),id=(document.querySelector('#qa-enemy') as HTMLSelectElement).value,step=Number((document.querySelector('#qa-step') as HTMLInputElement).value);
 r.battle!.enemies=[makeEnemy(id)];r.battle!.enemies[0].step=step;r.hp=r.maxHp=300;const before=structuredClone(r),frames:TurnFrame[]=[];endTurn(r,frames);
 const frame=frames.find(f=>f.action&&['attack','drain'].includes(f.action.type));if(!frame){motionResult.textContent='Choose an attack slot';return;}
 const plan=enemyAttackPlan(before,frame)!,phase=selectedPhase();presented=phase==='impact'||phase==='recover'?frame.run:before;render();holdMotionFrame(plan,phase);
 focusBattle();motionResult.textContent=`${id}:${step} · ${phase} · frame ${poseFrame(phase,plan.spec.kind,plan.key)}`;
});
motionPanel.querySelector('#qa-pose-fallback')!.addEventListener('click',()=>{fxSetup('flame');root.querySelector('.player .pose-art image')!.setAttribute('href',import.meta.env.BASE_URL+'qa-intentionally-missing-pose.webp');motionResult.textContent='Expected missing atlas: original artwork must remain visible';});
motionPanel.querySelector('#qa-motion-check')!.addEventListener('click',async()=>{
 const button=motionPanel.querySelector<HTMLButtonElement>('#qa-motion-check')!;button.disabled=true;
 const gaps:number[]=[];let raf=0,last=performance.now();const tick=(now:number)=>{gaps.push(now-last);last=now;raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
 let cases=0;const started=performance.now();
 try{
  fxAssert(Object.keys(FORMS).every(id=>hasPose(id)&&BODY_ORIGINS[id==='gatomon-resonance'?'gatomon':id]),'partner coverage');
  fxAssert(Object.keys(ENEMIES).every(id=>hasPose(id)&&BODY_ORIGINS[id]),'enemy coverage');
  for(const id of Object.keys(CARD_EFFECT_ROWS)){
   const before=structuredClone(fxSetup(id));const seen=new Set<string>();const t=setInterval(()=>{const el=root.querySelector('.player>.battle-pose');if(el)seen.add(el.getAttribute('data-frame')||'');},8);
   await animateCard(0);clearInterval(t);const expected=structuredClone(before);playCard(expected,0);
   fxAssert(JSON.stringify(activeRun(save))===JSON.stringify(expected),'card rules '+id);
   fxAssert(reduced()||seen.has('1')&&(seen.has('2')||seen.has('3'))&&seen.has('5'),'body frames '+id);
   fxAssert(!motion.busy&&!root.querySelector('.combat-fx'),'cleanup '+id);cases++;
   motionResult.textContent=`Cards ${cases}/39 PASS`;
  }
  let enemyCount=0;
  for(const [id,enemy] of Object.entries(ENEMIES))for(const [step,intent] of enemy.pattern.entries())if(['attack','drain'].includes(intent.type)){
   const r=fxSetup('flame');r.battle!.enemies=[makeEnemy(id)];r.battle!.enemies[0].step=step;r.hp=r.maxHp=300;render();
   const before=structuredClone(r),expected=structuredClone(r);endTurn(expected);await animateTurn();
   fxAssert(JSON.stringify(activeRun(save))===JSON.stringify(expected),'enemy rules '+id+step);enemyCount++;
   motionResult.textContent=`39 cards PASS · enemies ${enemyCount}/39 PASS`;
  }
  // Two inputs in the same event loop may commit only one card/turn.
  let r=fxSetup('cat'),expected=structuredClone(r);playCard(expected,0);await Promise.all([animateCard(0),animateCard(0)]);fxAssert(JSON.stringify(r)===JSON.stringify(expected),'double card');
  r=fxSetup('flame');expected=structuredClone(r);endTurn(expected);await Promise.all([animateTurn(),animateTurn()]);fxAssert(JSON.stringify(r)===JSON.stringify(expected),'double turn');
  for(const delay of [25,180,420]){r=fxSetup('flame');expected=structuredClone(r);playCard(expected,0);const task=animateCard(0);await fxPause(delay);motion.finish();await task;fxAssert(!motion.busy&&!root.querySelector('.combat-fx,.card-flight'),'cancel '+delay);fxAssert(JSON.stringify(r)===JSON.stringify(expected),'cancel state');}
  fxSetup('flame');activeRun(save)!.battle!.enemies[0].block=999;render();await animateCard(0);
  r=fxSetup('flame');r.battle!.enemies=[makeEnemy('kuwaga'),makeEnemy('mojyamon')];r.hp=r.maxHp=300;render();expected=structuredClone(r);endTurn(expected);
  let impacts=0,lastNode:Element|null=null;const hits=setInterval(()=>{const node=root.querySelector('.combat-fx[data-phase="impact"]');if(node&&node!==lastNode){impacts++;lastNode=node;}},8);
  await animateTurn();clearInterval(hits);fxAssert(JSON.stringify(r)===JSON.stringify(expected),'two multi-hit enemies');fxAssert(impacts===(reduced()?2:4),'visible hit count '+impacts);fxAssert(!motion.busy,'turn watchdog');
  const sorted=gaps.filter(n=>n>0).sort((a,b)=>a-b),p95=sorted[Math.floor(sorted.length*.95)]||0;
  motionResult.textContent=`PASS · 39 cards / ${enemyCount} enemy attacks / 48 bodies\nDouble input / cancellation / full guard / ${impacts} multi-hit contacts PASS\nrAF p95 ${p95.toFixed(1)}ms · max ${Math.max(...gaps).toFixed(1)}ms · >50ms ${gaps.filter(n=>n>50).length}/${gaps.length}\n${reduced()?'reduced':'normal'} · ${save.settings.muted?'muted':'audio on'} · ${Math.round(performance.now()-started)}ms`;
 }catch(e){motionResult.textContent='FAIL '+String(e);}finally{cancelAnimationFrame(raf);button.disabled=false;}
});
