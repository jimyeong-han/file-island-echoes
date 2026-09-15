import type {Run} from './types';
import {CARDS} from './data';
export function eventResult(before:Run,after:Run){
 const fields=[['hp','체력'],['bond','유대'],['burden','부담'],['corruption','오염'],['evoEnergy','진화 에너지'],['supplies','보급품']] as const;
 const changes=fields.flatMap(([key,label])=>{const n=after[key]-before[key];return n?[`${label} ${n>0?'+':''}${n}`]:[];});
 for(const id of after.deck.slice(before.deck.length))changes.push(`${CARDS[id].name} 획득`);
 if(after.outcome==='defeat')changes.push('탐험 종료');return changes.join(' · ')||'파트너와 이야기를 나눴습니다.';
}
