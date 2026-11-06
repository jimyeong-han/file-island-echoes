import {CHARACTERS,FORMS} from './data';
import {sprite} from './art';
import {icon} from './icons';
import type {Run} from './types';
import type {EvolutionPhase} from './evolution-sequence';
export function evolutionScreen(r:Run){
  const c=CHARACTERS[r.characterId],from=FORMS[r.evolvedFrom||c.forms[0]],to=FORMS[r.form];
  const mode=r.form==='skull'?'forced':r.form==='gatomon-resonance'?'resonance':'normal';
  return `<main class="center-screen evolution-screen evo-sequence" data-mode="${mode}" data-phase="complete" style="--evo-accent:${mode==='forced'?'#e69bc7':mode==='resonance'?'#ffe9a1':c.color}">
    <div class="evo-heading"><div><p class="eyebrow">${mode==='forced'?'강제 진화':mode==='resonance'?'빛의 공명':'파트너 진화'}</p><p class="evo-crest">${icon(c.icon)} ${c.name} · ${c.crest}</p></div><button class="quiet evo-skip" data-action="evolution-skip">연출 건너뛰기</button></div>
    <div class="evo-stage" aria-label="${from.name}에서 ${to.name}${mode==='resonance'?'의 빛의 공명으로 강화':'으로 진화'}">
      <div class="evo-grid" aria-hidden="true"></div><div class="evo-orbit orbit-one" aria-hidden="true"></div><div class="evo-orbit orbit-two" aria-hidden="true"></div>
      <div class="evo-device" aria-hidden="true">${icon('device')}<span>${icon(c.icon)}</span></div>
      <svg class="evo-signal" viewBox="0 0 600 350" preserveAspectRatio="none" aria-hidden="true"><path d="M300 70 V110 L246 140 V190 L300 215"/><path d="M300 70 V110 L354 140 V190 L300 215"/><circle cx="300" cy="215" r="8"/></svg>
      <div class="evo-old">${sprite(r.evolvedFrom||c.forms[0]).replace('loading="lazy"','loading="eager"')}</div><div class="evo-new">${sprite(r.form).replace('loading="lazy"','loading="eager"')}</div>
      <div class="evo-shell" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i style="--i:${i};left:${8+i*19%84}%;top:${8+i*27%78}%;width:${5+i%3*3}px"></i>`).join('')}</div>
      <div class="evo-crest-seal" aria-hidden="true">${icon(c.icon)}</div>
      <p class="evo-caption" role="status" aria-live="polite">${mode==='resonance'?'같은 모습, 더 깊어진 빛':to.name+' · 진화 완료'}</p>
    </div>
    <div class="evo-lineage"><span>${from.name}</span><span aria-hidden="true">${mode==='resonance'?'＋':'→'}</span><strong>${to.name}</strong></div>
    <div class="evo-result"><h1 tabindex="-1">${to.name}</h1><span class="form-tag">${to.tag}</span>${mode==='resonance'?'<p class="evo-resonance-note">새로운 종으로 진화하는 대신, 가트몬의 빛을 강화합니다.</p>':''}<p class="evolution-effect">${to.description}</p></div>
    <button class="primary large" data-action="evolution-done">함께 앞으로 →</button>
  </main>`;
}
export function evolutionFrame(root:ParentNode,phase:EvolutionPhase){
  const scene=root.querySelector<HTMLElement>('.evo-sequence');if(!scene)return;
  scene.dataset.phase=phase;
  const skip=scene.querySelector<HTMLButtonElement>('[data-action="evolution-skip"]')!;
  skip.disabled=phase==='complete';
  const text:Record<EvolutionPhase,string>={device:'디지바이스가 빛납니다',signal:'마음이 파트너에게 전해집니다',data:scene.dataset.mode==='resonance'?'가트몬의 빛을 모읍니다':'파트너의 데이터가 이어집니다',reveal:scene.dataset.mode==='resonance'?'빛의 공명':'새로운 힘, 같은 마음',complete:scene.dataset.mode==='resonance'?'같은 모습, 더 깊어진 빛':'진화 완료'};
  scene.querySelector('.evo-caption')!.textContent=text[phase];
}
