// Local, authored QA controls; excluded from the production entry point.
import {EVOLUTIONS} from '../src/data';
const evoSelect=document.createElement('select');evoSelect.setAttribute('aria-label','QA evolution');evoSelect.innerHTML=EVOLUTIONS.map(e=>`<option value="${e.to}">${e.from} → ${e.to}</option>`).join('');qaControls.append(evoSelect);
const evoOutput=document.createElement('pre');evoOutput.id='qa-evolution-result';evoOutput.setAttribute('role','status');evoOutput.style.cssText='max-height:100px;overflow:auto;white-space:pre-wrap';qaControls.append(evoOutput);
const evoFixture=(to:string)=>{
 evolutionSequence.finish();motion.finish();modal='';view='game';warning='';const e=EVOLUTIONS.find(e=>e.to===to)!,r=newRun(13,FORMS[e.from].owner);r.screen='map';r.evoEnergy=50;r.bond=15;
 if(FORMS[e.from].stage===1){evolve(r,e.from);r.screen='map';}r.burden=e.burden;
 saveRun(save,r);save.settings.muted=false;pendingForm=to;modal='evo';render();return r;
};
for(const [label,callback] of [
 ['진화 미리보기',()=>{evoFixture(evoSelect.value);window.scrollTo(0,0);}],
 ['진화 재생',async()=>{await gameAudio.mixer.unlock();evoFixture(evoSelect.value);root.querySelector<HTMLButtonElement>('[data-action="evolve"]')!.click();}],
 ['진화 전환 정지',()=>{const r=evoFixture(evoSelect.value);modal='';evolve(r,evoSelect.value);render();evolutionFrame(root,'data');window.scrollTo(0,0);}],
 ['진화 결과 정지',()=>{const r=evoFixture(evoSelect.value);modal='';evolve(r,evoSelect.value);render();window.scrollTo(0,0);}],
 ['QA 움직임 전환',()=>{save.settings.reducedMotion=!save.settings.reducedMotion;render();evoOutput.textContent='reduced-motion: '+reduced();}],
 ['QA 진화 저장',()=>{const r=evoFixture(evoSelect.value);modal='';evolve(r,evoSelect.value);persist(null);render();evoOutput.textContent='evolution checkpoint saved · '+r.form+' · energy '+r.evoEnergy;}],
] as const){const b=document.createElement('button');b.textContent=label;b.onclick=callback;qaControls.append(b);}
const evoCheck=document.createElement('button');evoCheck.textContent='v0.13 전체 검사';qaControls.append(evoCheck);
evoCheck.onclick=async()=>{
 evoCheck.disabled=true;const lines:string[]=[];let interval=0;
 try{
  await gameAudio.mixer.unlock();
  for(const [i,e] of EVOLUTIONS.entries()){
   const r=evoFixture(e.to),before=structuredClone(r),expected=structuredClone(r);evolve(expected,e.to);const phases=new Set<string>();
   interval=window.setInterval(()=>phases.add(root.querySelector<HTMLElement>('.evo-sequence')?.dataset.phase||''),25);
   root.querySelector<HTMLButtonElement>('[data-action="evolve"]')!.click();
   await fxPause(reduced()?220:6000);clearInterval(interval);
   fxAssert(JSON.stringify(r)===JSON.stringify(expected),'state '+e.to);
   fxAssert(root.querySelector('.evo-sequence')?.getAttribute('data-phase')==='complete','complete '+e.to);
   fxAssert(!evolutionSequence.running,'timer '+e.to);
   if(!reduced())fxAssert(['device','signal','data','reveal','complete'].every(p=>phases.has(p)),'phases '+e.to);
   const images=[...root.querySelectorAll<HTMLImageElement>('.evo-stage img')];await Promise.all(images.map(img=>img.decode().catch(()=>{})));fxAssert(images.length===2&&images.every(img=>img.complete&&img.naturalWidth>0),'images '+e.to);
   fxAssert(gameAudio.mixer.status.musicVoices===0,'music leak '+e.to);
   fxAssert(r.evoEnergy===before.evoEnergy-EVOLUTIONS.find(e=>e.to===r.form)!.energy,'cost '+e.to);
   fxAssert(JSON.stringify(loadSave().save.runs[r.characterId]!.run)===JSON.stringify(r),'saved '+e.to);
   lines.push(`${i+1}/17 ${e.from} → ${e.to} PASS`);evoOutput.textContent=lines.join('\n');
  }
  for(const delay of [0,900,1800,3400]){
   const r=evoFixture('greymon');root.querySelector<HTMLButtonElement>('[data-action="evolve"]')!.click();await fxPause(delay);evolutionSequence.finish();await fxPause(120);fxAssert(!evolutionSequence.running&&gameAudio.mixer.status.musicVoices===0,'skip '+delay);fxAssert(r.form==='greymon','skip state');
  }
  lines.push('Skip at 0 / 900 / 1800 / 3400 ms PASS');
  root.querySelector<HTMLButtonElement>('[data-action="evolution-done"]')!.click();await fxPause(1000);fxAssert(gameAudio.mixer.status.playing==='music-map','map music return');lines.push('Map music return PASS');
  const r=evoFixture('skull');root.querySelector<HTMLButtonElement>('[data-action="evolve"]')!.click();await fxPause(400);root.querySelector<HTMLButtonElement>('[data-action="home"]')!.click();await fxPause(800);fxAssert(gameAudio.mixer.status.playing==='music-title'&&!evolutionSequence.running,'leave');fxAssert(r.form==='skull','leave result');lines.push('Mid-sequence home / saved forced result PASS');
  evoOutput.textContent=lines.join('\n')+'\nALL PASS · reduced='+reduced();
 }catch(e){evoOutput.textContent=lines.join('\n')+'\nFAIL '+String(e);}finally{clearInterval(interval);evoCheck.disabled=false;}
};
