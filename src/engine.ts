import { BOSS_RAGE, RECOVERY, CARDS, ENEMIES, EVOLUTIONS, FORMS, MAP, REWARD_POOL, START_DECK, STORIES } from './data';
import type { CardId, Form, Intent, Run } from './types';

export function newRun(seed=Date.now()>>>0):Run { return {seed:seed||1,screen:'map',row:0,path:[],node:null,hp:64,maxHp:64,form:'agumon',evoEnergy:0,bond:1,burden:0,corruption:0,supplies:2,deck:[...START_DECK],battle:null,rewards:[],won:false,battles:0,started:Date.now()}; }
export function random(r:Run) { r.seed=(Math.imul(1664525,r.seed)+1013904223)>>>0; return r.seed/4294967296; }
export function shuffle<T>(r:Run,a:T[]):T[] { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(random(r)*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
export function nodeOf(r:Run) { return MAP.flat().find(n=>n.id===r.node); }
function log(r:Run,msg:string) {if(r.battle) r.battle.log=[msg,...r.battle.log].slice(0,7);}
function heal(r:Run,n:number) {r.hp=Math.min(r.maxHp,Math.max(0,r.hp+n));}
export function draw(r:Run,n:number) {const b=r.battle;if(!b)return;for(let i=0;i<n;i++){if(!b.draw.length){b.draw=shuffle(r,b.discard);b.discard=[];} const c=b.draw.pop();if(c)b.hand.push(c);}}
export function turnThreat(r:Run) {
 const b=r.battle;
 if(!b)return {incoming:0,recoil:0,blocked:0,damage:0};
 const incoming=b.enemies.reduce((sum,e,i)=>sum+(e.hp>0&&['attack','drain'].includes(intent(r,i).type)?intent(r,i).value:0),0);
 const recoil=r.corruption+(r.form==='skull'?2:0),blocked=Math.min(incoming,b.block);
 return {incoming,recoil,blocked,damage:incoming-blocked+recoil};
}
export function bossRageBonus(turn:number) {
 return turn<BOSS_RAGE.turn?0:(1+Math.floor((turn-BOSS_RAGE.turn)/BOSS_RAGE.interval))*BOSS_RAGE.damage;
}
export function intent(r:Run,index:number):Intent {
 const e=r.battle!.enemies[index],pattern=ENEMIES[e.id].pattern;
 const action={...pattern[e.step%pattern.length]};
 const damaging=action.type==='attack'||action.type==='drain';
 const rage=e.id==='devimon'?bossRageBonus(r.battle!.turn):0;
 if(rage&&damaging){action.value+=rage;action.label='폭주 · '+action.label;}
 if(e.weak>0&&damaging)action.value=Math.floor(action.value*.6);
 return action;
}
export function enterNode(r:Run,id:string) {
 if(r.screen!=='map')return;const n=MAP[r.row]?.find(x=>x.id===id);if(!n)return;
 r.node=id;r.lastEvent=undefined;
 if(n.enemies){r.screen='battle';r.battle={enemies:n.enemies.map(id=>({id,hp:ENEMIES[id].hp,maxHp:ENEMIES[id].hp,block:0,weak:0,step:0})),hand:[],draw:shuffle(r,r.deck),discard:[],energy:3,block:0,turn:1,target:0,log:['검은 톱니바퀴의 기척… 전투 시작!']};draw(r,5);}
 else r.screen=n.type==='rest'?'rest':'event';
}
export function finishNode(r:Run) {if(r.node)r.path.push(r.node);r.row++;r.node=null;r.battle=null;r.rewards=[];r.screen='map';}
function resolve(r:Run) {
 if(r.hp<=0){r.hp=0;r.won=false;r.screen='result';return;}
 if(r.battle?.enemies.every(e=>e.hp<=0)) {r.battles++;r.evoEnergy+=nodeOf(r)?.type==='elite'?7:5;r.bond++;r.burden=Math.max(0,r.burden-1);if(nodeOf(r)?.type==='boss'){r.path.push(r.node!);r.won=true;r.screen='result';}else{r.screen='reward';r.rewards=shuffle(r,REWARD_POOL).slice(0,3);}}
}
export function cardStats(r:Run,id:CardId) {const c={...CARDS[id]};if(c.damage)c.damage+=FORMS[r.form].bonus;if(c.block&&c.kind==='guard'&&r.form==='metal')c.block+=3;return c;}
export function playCard(r:Run,index:number) {
 const b=r.battle;if(r.screen!=='battle'||!b)return false;const id=b.hand[index];if(!id)return false;const c=cardStats(r,id);if(c.cost>b.energy)return false;
 if(!b.enemies[b.target]||b.enemies[b.target].hp<=0)b.target=b.enemies.findIndex(e=>e.hp>0);
 b.energy-=c.cost;b.hand.splice(index,1); // Draw before discard: a zero-cost draw card cannot redraw itself.
 if(c.damage){b.enemies.forEach((e,i)=>{if(e.hp>0&&(c.all||i===b.target)){const blocked=Math.min(e.block,c.damage!);e.block-=blocked;e.hp=Math.max(0,e.hp-c.damage!+blocked);}});}
 if(c.weak)b.enemies[b.target].weak+=c.weak;
 if(c.block)b.block+=c.block;if(c.heal)heal(r,c.heal);if(c.energy)b.energy+=c.energy;
 if(c.cleanse)r.corruption=Math.max(0,r.corruption-c.cleanse);
 r.burden=Math.max(0,r.burden+(c.burden||0)-(c.relief||0));if(c.self)heal(r,-c.self);
 if(c.draw)draw(r,c.draw);b.discard.push(id);log(r,`${c.name}${c.damage?` · 피해 ${c.damage}`:''}${c.block?` · 방어 ${c.block}`:''}${c.heal?` · 회복 ${c.heal}`:''}`);
 resolve(r);return true;
}
export function endTurn(r:Run) {
 const b=r.battle;if(r.screen!=='battle'||!b)return;
 b.discard.push(...b.hand);b.hand=[];
 // Existing corruption ticks once; newly applied corruption begins next turn.
 if(r.corruption){heal(r,-r.corruption);log(r,`오염으로 체력 ${r.corruption} 소모`);}
 if(r.form==='skull'){heal(r,-2);log(r,'강제 진화의 반동 · 체력 2 소모');}
 if(r.hp<=0){resolve(r);return;}
 b.enemies.forEach((e,i)=>{if(e.hp<=0||r.hp<=0)return;const a=intent(r,i);e.block=0;
 if(a.type==='attack'||a.type==='drain'){const absorbed=Math.min(b.block,a.value);b.block-=absorbed;const damage=a.value-absorbed;heal(r,-damage);if(a.type==='drain')e.hp=Math.min(e.maxHp,e.hp+Math.floor(damage/2));log(r,`${ENEMIES[e.id].name} · ${a.label}: 피해 ${damage}${absorbed?` (방어 ${absorbed})`:''}`);}
 if(a.type==='defend'){e.block=a.value;log(r,`${ENEMIES[e.id].name} · 방어 ${a.value}`);}
 if(a.type==='corrupt'){r.corruption+=a.value;log(r,`${ENEMIES[e.id].name} · 오염 +${a.value}`);}
 e.weak=Math.max(0,e.weak-1);e.step++;
 });
 resolve(r);if(r.screen!=='battle')return;b.turn++;b.energy=3;b.block=0;draw(r,5);
}
export function reward(r:Run,id?:CardId) {if(r.screen!=='reward')return;if(id&&!r.rewards.includes(id))return;if(id)r.deck.push(r.form!=='agumon'&&id==='flame'?'nova':id);finishNode(r);}
export function chooseEvent(r:Run,index:number) {if(r.screen!=='event')return;const event=nodeOf(r)?.event;if(!event)return;const c=STORIES[event].choices[index];if(!c)return;
 heal(r,c.hp||0);r.evoEnergy+=c.energy||0;r.bond+=c.bond||0;r.burden=Math.max(0,r.burden+(c.burden||0));r.corruption=Math.max(0,r.corruption+(c.corruption||0));r.supplies+=c.supplies||0;if(c.card)r.deck.push(c.card);r.lastEvent=event;if(r.hp<=0){r.screen='result';r.won=false;}else finishNode(r);
}
export function rest(r:Run,kind:'rest'|'train') {if(r.screen!=='rest')return;if(kind==='rest'){heal(r,RECOVERY.rest);r.burden=Math.max(0,r.burden-4);r.corruption=Math.max(0,r.corruption-2);r.bond+=2;}else{heal(r,RECOVERY.train);r.evoEnergy+=5;r.burden+=2;}finishNode(r);}
export function useSupply(r:Run) {if(r.supplies<=0||!['map','battle','rest','event'].includes(r.screen)||r.hp===r.maxHp)return;heal(r,RECOVERY.supply);r.supplies--;log(r,`보급품 사용 · 체력 ${RECOVERY.supply} 회복`);}
export function evolutionOptions(r:Run) {return EVOLUTIONS.filter(e=>e.from===r.form).map(e=>({
 form:e.to,ready:r.evoEnergy>=e.energy&&r.bond>=e.bond&&r.burden>=e.burden,cost:e.energy,condition:e.condition,
}));}
export function evolve(r:Run,form:Form) {if(r.screen!=='map')return false;const opt=evolutionOptions(r).find(x=>x.form===form);if(!opt?.ready)return false;r.evoEnergy-=opt.cost;r.evolvedFrom=r.form;r.form=form;const delta=FORMS[form].hp-r.maxHp;r.maxHp+=delta;heal(r,delta);if(form==='greymon')r.deck=r.deck.map(c=>c==='flame'?'nova':c);else{let count=0;r.deck=r.deck.map(c=>c==='nova'&&count++<2?(form==='metal'?'missile':'zero'):c);}r.screen='evolution';return true;}
