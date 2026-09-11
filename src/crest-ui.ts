import {CHARACTERS} from './data';
import {crestReady} from './engine';
import {icon} from './icons';
import type {CharacterId,Run,AbilityState} from './types';

// Display limits mirror the existing engine caps; these are not new resources.
export const CREST_RESOURCES:Partial<Record<CharacterId,{key:keyof AbilityState;label:string;max:number}>>={
 matt:{key:'combo',label:'연계',max:4},mimi:{key:'growth',label:'개화',max:6},
 joe:{key:'stock',label:'비축',max:3},tk:{key:'hope',label:'희망',max:3},kari:{key:'light',label:'빛',max:6},
};
export function crestProgress(r:Run){
 const b=r.battle!,s=b.ability;
 if(s.crestUsed)return '사용 완료';
 if(s.sealed)return `봉인 ${s.sealed}턴`;
 if(crestReady(r))return '사용 가능';
 switch(r.characterId){
  case 'tai':return `공격 ${s.attacks}/2`;
  case 'matt':return s.combo<2?'연계 2 필요':'손패 필요';
  case 'sora':return '방어 8 또는 체력 70%↓';
  case 'koushiro':return b.turn<2?'2턴부터':s.supports<1?`지원 ${s.supports}/1`:'뽑기 카드 필요';
  case 'mimi':return '개화 2 또는 해로운 효과';
  case 'joe':return '비축 2 필요';
  case 'tk':return '희망 2 필요';
  case 'kari':return '빛 2 또는 오염 2';
 }
}
export function resourceChip(r:Run){
 const resource=CREST_RESOURCES[r.characterId];if(!resource)return '';
 return `<span class="crest-resource" aria-label="${resource.label} ${r.battle!.ability[resource.key]} / ${resource.max}">${resource.label} <b>${r.battle!.ability[resource.key]}/${resource.max}</b></span>`;
}
export function crestHUD(r:Run){
 const c=CHARACTERS[r.characterId];
 return `<section class="crest-hud" style="--character-accent:${c.color}" aria-label="문장 능력"><span class="crest-symbol" aria-hidden="true">${icon(c.icon)}</span><strong class="crest-title">${c.crest} · ${c.ability.name}</strong><span class="crest-progress" id="crest-progress">${crestProgress(r)}</span><button data-action="crest" class="crest-button" aria-label="${c.ability.name} 사용" aria-describedby="crest-progress" ${crestReady(r)?'':'disabled'}>사용</button></section>`;
}
