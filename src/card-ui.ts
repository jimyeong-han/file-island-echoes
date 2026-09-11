import { CARDS, CHARACTERS, FORMS } from './data';
import { cardStats } from './engine';
import { icon } from './icons';
import type { Run, CardId } from './types';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function cardBack(){return `<div class="card-back" aria-hidden="true"><div>${icon('device')}</div><img src="${import.meta.env.BASE_URL}assets/ui/card-back.svg" alt="" draggable="false"/></div>`;}
export function cardFace(id:CardId,action:string,r:Run,disabled=false){
 if(action.startsWith('reward:')&&FORMS[r.form].stage>0&&id===FORMS[r.form].basic)id=FORMS[r.form].upgraded;
 const c=cardStats(r,id),mark=id==='zero'?'corruption':c.rarity==='evolved'?'evolution':c.damage?'attack':c.block?'guard':c.heal?'heal':c.draw?'draw':'support';
 const family=id==='zero'?'risk':c.rarity==='evolved'?'evolved':c.kind;
 const role=({attack:'공격',guard:'방어',support:'지원',evolved:'진화 기술',risk:'위험'})[family];
 const owner=c.owner?CHARACTERS[c.owner].name:'공용';
 return `<button class="game-card ${c.kind} family-${family}" data-action="${action}" data-card-id="${id}" ${disabled?'disabled':''} aria-label="${esc(c.name)}, 에너지 ${c.cost}. ${esc(c.text)}${disabled?' 에너지 부족':''}"><div class="card-front"><div class="card-top"><span class="cost" aria-label="비용 ${c.cost}">${c.cost}</span><small>${icon(mark)} ${role}</small></div><strong class="card-name">${esc(c.name)}</strong><div class="card-art"><span class="tech-orbit"></span>${icon(mark)}<b>${c.damage||c.block||c.heal||c.draw||''}</b><span class="tech-circuit"></span></div><p>${esc(c.text)}</p><div class="card-keywords">${(c.keywords||[]).map(k=>`<span>${esc(k)}</span>`).join('')}${c.exhaust&&!c.keywords?.includes('소멸')?'<span>소멸</span>':''}</div><div class="card-bottom"><span>${owner}${c.stage?' · '+(c.stage===1?'성숙기':'완전체'):''}</span><span>${disabled?'비용 부족':c.all?'모든 적':c.damage||c.weak||c.mark||c.burn||c.root||c.shock||c.expose||c.dispel?'대상 지정':'파트너'}</span></div></div>${cardBack()}</button>`;
}
