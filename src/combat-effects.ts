import {cardEffectSpec,enemyEffectSpec,enemyEffectKey} from './effect-data';
import type {EffectSpec} from './effect-data';
import {CARDS} from './data';
import type {Run} from './types';
import type {TurnFrame} from './engine';
import {bodyOrigin,poseFrame,setPose} from './battle-poses';
import type {PosePhase} from './battle-poses';

export type Actor='player'|`enemy:${number}`;
export type Contact={actor:Actor;damage:number;blocked:number;reaction:'hit'|'guard'|'null';defeated:boolean};
export type AttackPlan={key:string;from:Actor;contacts:Contact[];spec:EffectSpec;hits:number};
function contact(actor:Actor,hp:number,nextHp:number,block:number,nextBlock:number):Contact {
 const damage=Math.max(0,hp-nextHp),blocked=Math.max(0,block-nextBlock);
 return {actor,damage,blocked,reaction:damage?'hit':blocked?'guard':'null',defeated:hp>0&&nextHp<=0};
}
export function cardAttackPlan(before:Run,after:Run,id:string):AttackPlan|null {
 const b=before.battle,n=after.battle,c=CARDS[id];if(!b||!n||!c?.damage)return null;
 const target=b.enemies[b.target]?.hp>0?b.target:b.enemies.findIndex(e=>e.hp>0);
 const contacts=b.enemies.flatMap((e,i)=>{const next=n.enemies[i];return e.hp>0&&next&&(c.all||i===target)?[contact(`enemy:${i}`,e.hp,next.hp,c.dispel?0:e.block,next.block)]:[];});
 return {key:id,from:'player',contacts,spec:cardEffectSpec(id),hits:1};
}
export function enemyAttackPlan(before:Run,frame:TurnFrame):AttackPlan|null {
 const a=frame.action,e=before.battle?.enemies[frame.enemy];if(!a||!e||!['attack','drain'].includes(a.type))return null;
 // Drain may heal the attacker and counter/burn may hurt it; neither is a second attack on the player.
 return {key:enemyEffectKey(e.id,e.step),from:`enemy:${frame.enemy}`,contacts:[contact('player',before.hp,frame.run.hp,before.battle!.block,frame.run.battle!.block)],spec:enemyEffectSpec(e.id,e.step),hits:a.hits||1};
}
/** Split the already committed total for presentation only. Never re-run damage/RNG. */
export function attackBeats(plan:AttackPlan):AttackPlan[]{
 const count=Math.max(1,Math.min(8,plan.hits));
 return Array.from({length:count},(_,i)=>({...plan,hits:1,contacts:plan.contacts.map(c=>{
  const total=c.damage+c.blocked,end=Math.floor(total*(i+1)/count),start=Math.floor(total*i/count);
  const blocked=Math.max(0,Math.min(end,c.blocked)-Math.min(start,c.blocked));
  const damage=end-start-blocked;
  return {...c,damage,blocked,reaction:damage?'hit':blocked?'guard':'null',defeated:c.defeated&&i===count-1};
 })}));
}
export function contactSnapshot(before:Run,after:Run,beats:AttackPlan[],through:number):Run{
 const last=through===beats.length-1,r=structuredClone(last?after:before);
 if(!last)for(const beat of beats.slice(0,through+1))for(const c of beat.contacts){
  if(c.actor==='player'){r.hp=Math.max(0,r.hp-c.damage);r.battle!.block=Math.max(0,r.battle!.block-c.blocked);}
  else {const e=r.battle!.enemies[Number(c.actor.slice(6))];e.hp=Math.max(0,e.hp-c.damage);e.block=Math.max(0,e.block-c.blocked);}
 }
 if(before.screen==='battle')r.screen='battle';
 return r;
}
export type Point={x:number;y:number};
export const between=(a:Point,b:Point,t:number):Point=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
export const actorSelector=(actor:Actor)=>actor==='player'?'.fighter.player':`.enemy[data-action="target:${actor.slice(6)}"]`;
const line=(x:number,y:number)=>`${x.toFixed(1)},${y.toFixed(1)}`;
export function sourceAnchor(kind:EffectSpec['kind'],actor:Actor,width:number,height:number){
 const front=actor==='player'?1:-1;
 const face=['flame','water','wind'].includes(kind),low=kind==='vine',high=kind==='bolt';
 return {x:width*(.5+front*(face?.18:kind==='claw'||kind==='arrow'?.15:.06)),y:height*(face?.34:low?.7:high?.23:.49)};
}
/** Each school has its own anticipation silhouette; there is no shared cast ring. */
export function sourceGlyph(s:EffectSpec,p:number){
 const swell=Math.sin(Math.min(1,p)*Math.PI),size=.65+swell*.5;
 const branches=Array.from({length:5},(_,j)=>{const y=(j-2)*10;return `<path d="M-6 0 L${8+j*2} ${y*.3} L${2+j*2} ${y*.65} L${24+j*3} ${y}" fill="none" stroke="${j%2?s.accent:s.color}" stroke-width="${j%2?1.3:2.2}"/>`;}).join('');
 const spikes=Array.from({length:6},(_,j)=>`<path d="M${-16-j*4} ${-25+j*10} Q-8 ${-14+j*5} 8 0" fill="none" stroke="${j%2?s.color:s.accent}" stroke-width="${j%2?1:2}"/>`).join('');
 let glyph='';
 switch(s.kind){
 case 'flame':glyph=`<path d="M-20 8 Q-8 -7 -16 -17 Q2 -13 4 -32 Q21 -14 39 -3 Q19 0 22 15 Q3 32 -20 8" fill="url(#fx-volume)"/><path d="M-6 7 Q4 -4 1 -15 Q14 -8 22 -1 Q14 15 -6 7" fill="${s.accent}"/><path d="M-28 -17 L-20 -25 M-3 -35 L0 -42 M17 28 L24 33" stroke="${s.color}" stroke-width="3"/>`;break;
 case 'bolt':glyph=branches+`<path d="M-18 -11 L-29 -4 L-15 7 L-25 18 M-5 -28 L-13 -17 L1 -10" fill="none" stroke="${s.color}" stroke-width="2"/><path d="M-7 -4 L5 -12 L12 1 L2 9Z" fill="${s.accent}"/>`;break;
 case 'vine':glyph=`<path d="M-30 17 C-43 -11 -8 -36 -2 -8 C8 17 14 13 27 -3 M-18 22 Q0 -18 32 -20" fill="none" stroke="url(#fx-volume)" stroke-width="5"/><path d="M-11 -13 Q-33 -31 -27 -7 Q-23 0 -11 -13 M12 4 Q20 -19 36 -12 Q34 2 12 4" fill="${s.color}" stroke="${s.accent}" stroke-width="1"/>`;break;
 case 'water':glyph=`<path d="M-27 -5 C-11 -37 20 -15 10 3 C0 19 -22 4 -11 -5 C-2 -14 4 -3 0 1" fill="none" stroke="url(#fx-volume)" stroke-width="7"/><path d="M-28 15 Q-6 25 32 5 M-22 -21 Q5 -32 30 -15" fill="none" stroke="${s.accent}" stroke-width="2"/>`+[-1,1].map(k=>`<path d="M${k*22} -24 Q${k*18} -36 ${k*27} -32 Q${k*31} -24 ${k*22} -24" fill="${s.color}"/>`).join('');break;
 case 'claw':glyph=`<path d="M-34 -23 Q-12 -15 13 9 M-43 -9 Q-17 -8 8 15 M-35 7 Q-12 4 5 23" fill="none" stroke="${s.accent}" stroke-width="2"/><path d="M-39 -29 L-15 -15 M-49 -14 L-27 -7 M-41 8 L-23 9" stroke="${s.color}" stroke-width="5"/>`;break;
 case 'fist':glyph=spikes+`<path d="M-16 -21 Q-1 -12 2 0 Q-1 12 -16 21" fill="none" stroke="${s.accent}" stroke-width="4"/><path d="M-22 -28 L-6 -19 M-22 28 L-6 19" stroke="${s.color}" stroke-width="2"/>`;break;
 case 'arrow':glyph=`<path d="M-6 -34 Q-22 0 -6 34 L-18 0Z" fill="none" stroke="${s.color}" stroke-width="2"/><path d="M-24 0 H27 L16 -6 M27 0 L16 6" stroke="${s.accent}" stroke-width="2"/><path d="M-30 -17 L-38 -24 M-30 17 L-38 24" stroke="${s.color}" stroke-width="2"/>`;break;
 case 'missile':glyph=`<path d="M-21 -13 H5 L13 -6 V6 L5 13 H-21Z" fill="#243944" stroke="${s.accent}" stroke-width="2"/><path d="M7 -8 Q23 -17 34 -4 L21 0 L35 8 Q18 17 7 8" fill="url(#fx-volume)"/><path d="M-26 -9 Q-43 -19 -37 0 Q-46 15 -28 12" stroke="#9cb3c0" stroke-opacity=".65" stroke-width="5" fill="none"/>`;break;
 case 'shard':glyph=`<path d="M-22 10 L-13 -24 L0 -5 L13 -25 L23 11 L1 4Z" fill="url(#fx-volume)" stroke="${s.accent}" stroke-width="1"/><path d="M-31 -6 L-24 -14 M29 -14 L36 -24" stroke="${s.accent}" stroke-width="2"/>`;break;
 case 'gate':glyph=`<path d="M0 -34 V34 M-22 -15 H22" stroke="${s.color}" stroke-width="7"/><path d="M0 -31 V31 M-19 -15 H19" stroke="${s.accent}" stroke-width="2"/><path d="M-12 -5 L-23 9 M12 -5 L23 9 M-9 16 L-17 25 M9 16 L17 25" stroke="${s.color}" stroke-width="1.5"/>`;break;
 case 'dark':glyph=`<path d="M-35 -21 Q-16 -5 -5 -13 Q1 -27 18 -22 Q1 -10 13 1 Q-3 4 -4 18 Q-24 6 -35 14 Q-26 -3 -35 -21" fill="url(#fx-volume)"/><path d="M-18 -4 Q-9 -11 3 -4 M-12 6 Q-4 3 2 6" fill="none" stroke="${s.accent}" stroke-width="2"/>`;break;
 case 'wind':glyph=`<path d="M-33 -7 Q-6 -31 22 -10 Q7 -17 -4 -5 Q-12 8 8 12 Q28 12 29 -1 M-26 14 Q-12 35 15 25" fill="none" stroke="${s.accent}" stroke-width="2"/><path d="M-34 -19 Q-8 -42 27 -20 M-24 27 Q3 43 31 20" fill="none" stroke="${s.color}" stroke-width="3"/>`;break;
 default:glyph=`<path d="M-27 -27 Q4 -24 13 0 Q4 24 -27 27 M-12 -23 Q15 -15 22 0 Q15 15 -12 23" fill="none" stroke="${s.color}" stroke-width="3"/><path d="M-3 -13 Q14 0 -3 13" fill="none" stroke="${s.accent}" stroke-width="3"/>`;
 }
 return `<g data-cast="${s.kind}" transform="scale(${size})" opacity="${.85-p*.25}">${glyph}</g>`;
}
/** Original vector motifs, shared by live effects and the local visual review sheet. */
export function motif(s:EffectSpec,phase:'travel'|'impact',p:number,guard=false){
 const r=phase==='impact'?14+p*22:12+s.variant,white=s.accent;
 if(guard)return `<path d="M0 -30 L25 -16 L21 13 L0 30 L-21 13 L-25 -16Z" fill="#143d54" fill-opacity=".8" stroke="#9ee8f5" stroke-width="3"/><path d="M-10 0 L-2 9 L14 -10" stroke="white" stroke-width="3" fill="none"/>`;
 switch(s.kind){
 case 'flame':return `<path d="M-32 3 Q-15 -4 -22 -19 Q-2 -12 1 -28 Q31 -14 26 4 Q25 24 2 22 Q-11 20 -32 3Z" fill="currentColor"/><path d="M-4 12 Q-15 1 5 -10 Q0 3 15 5 Q17 20 -4 12Z" fill="${white}"/>`;
 case 'bolt':return `<path d="M-38 8 L-18 -12 L-8 9 L10 -17 L17 6 L38 -9" fill="none" stroke="currentColor" stroke-width="8"/><path d="M-38 8 L-18 -12 L-8 9 L10 -17 L17 6 L38 -9" fill="none" stroke="${white}" stroke-width="2"/>`;
 case 'vine':return `<path d="M-45 20 C-22 -28 6 29 22 -17 Q45 -38 31 20" fill="none" stroke="currentColor" stroke-width="6"/><path d="M-10 4 Q-27 -25 -3 -12 M18 -7 Q40 1 33 13" fill="${white}"/>`;
 case 'claw':return [0,1,2].map(i=>`<path d="M${-22+i*15} -32 Q${-35+i*15} 7 ${-9+i*15} 32 L${-17+i*15} 1Z" fill="${i===1?white:'currentColor'}"/>`).join('');
 case 'arrow':return `<path d="M-40 -3 H13 V-12 L40 0 L13 12 V3 H-40 M-32 -3 L-40 -13 L-17 -3 M-32 3 L-40 13 L-17 3" fill="${white}" stroke="currentColor" stroke-width="2"/>`;
 case 'missile':return `<path d="M-34 -8 L12 -8 L29 0 L12 8 H-34Z" fill="${white}" stroke="currentColor" stroke-width="3"/><path d="M-36 -6 L-60 0 L-36 6 M-22 -8 L-35 -17 V-8 M-22 8 L-35 17 V8" fill="currentColor"/>`;
 case 'water':return `<path d="M-35 13 Q-18 -26 12 -11 Q40 -2 20 17 Q4 36 -9 9 Q-12 -3 -35 13" fill="currentColor" fill-opacity=".8" stroke="${white}" stroke-width="2"/><circle cx="30" cy="-21" r="4" fill="${white}"/>`;
 case 'fist':return `<path d="M-24 -14 L-14 -24 L-5 -17 L4 -24 L14 -16 L22 -18 L31 -5 L25 15 L3 24 L-23 10Z" fill="currentColor" stroke="${white}" stroke-width="3"/><path d="M-30 4 L-47 4 M-27 -10 L-42 -16 M-21 18 L-39 24" stroke="currentColor" stroke-width="3"/>`;
 case 'shard':return `<path d="M-34 0 L2 -17 L35 0 L2 17Z" fill="currentColor" stroke="${white}" stroke-width="2"/><path d="M-34 0 H35 L2 -17 L2 17" fill="none" stroke="${white}" stroke-width="1"/>`;
 case 'gate':return `<ellipse rx="${r}" ry="${r*1.35}" fill="#102833" fill-opacity=".5" stroke="currentColor" stroke-width="4"/><path d="M-12 26 V-15 Q0 -30 12 -15 V26 M0 -35 V-22 M-11 -28 H11" fill="none" stroke="${white}" stroke-width="3"/>`;
 case 'dark':return `<path d="M-32 -4 Q-10 -39 24 -18 Q-9 -14 -3 5 Q16 26 32 5 Q18 41 -14 26 Q-39 20 -32 -4Z" fill="currentColor"/><circle r="8" fill="${white}"/>`;
 default:return `<path d="M-32 -22 Q21 -42 32 -8 Q-8 -24 -22 -3 Q14 -17 32 9 Q7 2 -9 22 Q-33 27 -37 12" fill="none" stroke="currentColor" stroke-width="5"/><path d="M-23 0 Q5 -10 24 5" fill="none" stroke="${white}" stroke-width="2"/>`;
 }
}
export function impactGlyph(s:EffectSpec,p:number,guard=false){
 if(guard)return motif(s,'impact',p,true);
 const glow=`<circle r="42" fill="url(#fx-glow)"/>`,r=19+p*14;
 const rays=Array.from({length:8},(_,k)=>{const a=(k*45+s.variant*11)*Math.PI/180;return `<path d="M${line(Math.cos(a)*r*.5,Math.sin(a)*r*.5)} L${line(Math.cos(a)*r*1.4,Math.sin(a)*r*1.4)}" stroke="${k%2?s.color:s.accent}" stroke-width="${k%2?2:3}"/>`;}).join('');
 let art='';
 switch(s.kind){
 case 'flame':art=`<path d="M0 -10 L-7 -35 L7 -22 L19 -37 L20 -13 L39 -12 L25 4 L32 25 L10 18 L-4 37 L-11 19 L-35 25 L-25 4 L-40 -13 L-17 -11 L-21 -29Z" fill="url(#fx-volume)"/><path d="M-9 4 Q-12 -8 2 -18 Q0 -1 14 4 Q10 20 -5 16Z" fill="${s.accent}"/>`;break;
 case 'missile':art=`<path d="M0 -14 L9 -35 L17 -16 L37 -19 L27 0 L41 16 L16 17 L9 37 L-5 24 L-27 31 L-21 10 L-41 2 L-25 -12 L-29 -34 L-10 -21Z" fill="url(#fx-volume)"/><path d="M-11 -8 L2 -18 L12 -5 L20 10 L4 8 L-7 22 L-14 6 L-24 -2Z" fill="${s.accent}"/><path d="M-33 -25 Q-49 -30 -42 -11 M31 22 Q46 37 39 9 M-18 32 Q-28 47 -41 31" stroke="#8c9ca7" stroke-width="5" fill="none" opacity=".6"/>`;break;
 case 'bolt':art=rays+Array.from({length:4},(_,i)=>`<path d="M3 -5 L14 -20 L10 -23 L24 -39" transform="rotate(${i*90+p*20})" stroke="${s.accent}" stroke-width="2" fill="none"/>`).join('');break;
 case 'vine':art=`<path d="M-32 -15 C-50 -2 36 34 34 6 C32 -16 -46 -30 -30 5 C-11 42 54 9 18 -18" fill="none" stroke="${s.color}" stroke-width="5"/><path d="M-32 -15 C-50 -2 36 34 34 6 M-25 -3 C-11 24 34 12 18 -18" fill="none" stroke="${s.accent}" stroke-width="1.4"/><path d="M-30 5 Q-54 12 -40 26 Q-29 23 -30 5 M30 -4 Q52 -30 32 -25 Q21 -18 30 -4" fill="url(#fx-volume)"/>`;break;
 case 'water':art=`<path d="M0 10 Q-9 -5 -30 -26 Q-22 3 -31 11 Q-49 -8 -42 8 Q-33 33 -8 22 Q8 38 24 20 Q44 25 42 6 Q25 13 25 -18 Q13 -4 9 6 Q4 -23 -4 -32 Q-8 -9 0 10" fill="url(#fx-volume)" stroke="${s.accent}" stroke-width="1.5"/>`;break;
 case 'claw':art=motif(s,'impact',p)+`<path d="M-36 -5 L-43 -12 M-13 37 L-17 44 M30 20 L36 28" stroke="${s.accent}" stroke-width="2"/>`;break;
 case 'arrow':art=`<path d="M-3 -42 L4 -9 L34 -22 L11 1 L42 7 L10 12 L17 35 L0 17 L-11 39 L-8 8 L-37 18 L-14 -2 L-30 -27 L-8 -10Z" fill="url(#fx-volume)"/><path d="M0 -22 V23 M-23 0 H23" stroke="${s.accent}" stroke-width="3"/>`;break;
 case 'fist':art=`<path d="M-12 -10 L-12 -34 L1 -16 L18 -32 L18 -8 L39 -5 L22 9 L27 29 L8 19 L-7 39 L-14 17 L-37 19 L-27 0 L-41 -16 L-22 -14Z" fill="none" stroke="${s.color}" stroke-width="4"/><path d="M-12 -10 L14 13 M-14 14 L14 -14" stroke="${s.accent}" stroke-width="4"/>`;break;
 case 'shard':art=Array.from({length:5},(_,k)=>`<path d="M-4 -13 L1 -38 L7 -19 L1 -10Z" transform="rotate(${k*72+p*12})" fill="url(#fx-volume)" stroke="${s.accent}" stroke-width="1"/>`).join('');break;
 case 'gate':art=`<path d="M-26 32 V-19 Q0 -53 26 -19 V32 M-18 28 V-16 Q0 -41 18 -16 V28 M-26 32 H26" fill="none" stroke="${s.accent}" stroke-width="2"/><path d="M-33 -20 L-42 -29 M33 -20 L42 -29 M0 -46 V-57" stroke="${s.color}" stroke-width="3"/>`;break;
 case 'dark':art=motif(s,'impact',p)+`<path d="M-23 -30 Q-43 -24 -35 5 M23 32 Q43 24 35 -7" fill="none" stroke="${s.color}" stroke-width="3"/>`;break;
 default:art=`<ellipse rx="${r*1.3}" ry="${r*.65}" fill="none" stroke="${s.accent}" stroke-width="3" transform="rotate(-25)"/><ellipse rx="${r}" ry="${r*.5}" fill="none" stroke="${s.color}" stroke-width="2" transform="rotate(25)"/>`;
 }
 return `<g data-impact="${s.kind}">${glow}${art}</g>`;
}
export function effectSvg(plan:AttackPlan,from:Point,points:Point[],phase:'travel'|'impact',progress:number,reduced=false){
 const s=plan.spec,p=Math.min(1,Math.max(0,progress)),impact=phase==='impact';
 const aim=points[0]||from,angle=Math.atan2(aim.y-from.y,aim.x-from.x)*180/Math.PI;
 const defs=`<defs><linearGradient id="fx-volume" x1="0" y1="1" x2=".8" y2="0"><stop stop-color="${s.color}" stop-opacity=".3"/><stop offset=".52" stop-color="${s.color}"/><stop offset="1" stop-color="${s.accent}"/></linearGradient><radialGradient id="fx-glow"><stop stop-color="${s.accent}" stop-opacity=".55"/><stop offset=".3" stop-color="${s.color}" stop-opacity=".3"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></radialGradient></defs>`;
 const cast=!impact&&!reduced?`<g transform="translate(${line(from.x,from.y)}) rotate(${angle}) scale(.7)">${sourceGlyph(s,p)}</g>`:'';
 return (reduced&&!impact?'':defs)+cast+points.map((to,i)=>{
  const c=plan.contacts[i];if(!c)return '';const angle=Math.atan2(to.y-from.y,to.x-from.x)*180/Math.PI;
  if(!impact&&!reduced)return Array.from({length:s.shots},(_,j)=>{const t=Math.max(0,Math.min(1,p*(1+s.shots*.12)-j*.12)),pos=between(from,to,t),arc=Math.sin(t*Math.PI)*(j-(s.shots-1)/2)*(12+s.variant*2),trail=between(from,to,Math.max(0,t-.24));
   const connected=['vine','bolt','water','wind','wave'].includes(s.kind);
   const path=s.kind==='bolt'?`M${line(from.x,from.y)} L${line((from.x+pos.x)/2-8,(from.y+pos.y)/2-12)} l8 18 L${line(pos.x,pos.y+arc)}`:`M${line(connected?from.x:trail.x,connected?from.y:trail.y)} Q${line((from.x+pos.x)/2,(from.y+pos.y)/2+arc+Math.sin(p*7+j)*10)} ${line(pos.x,pos.y+arc)}`;
   const streak=`<path d="${path}" fill="none" stroke="${s.color}" stroke-opacity=".18" stroke-width="${s.kind==='water'?13:7}" stroke-linecap="round"/><path d="${path}" fill="none" stroke="${s.color}" stroke-opacity=".8" stroke-width="${s.kind==='vine'?3:1.5}" stroke-linecap="round"/>`;
   const melee=['claw','fist'].includes(s.kind),scale=melee?.3+t*.35:.48+s.variant*.025;
   const glyph=motif(s,'travel',t).replaceAll('fill="currentColor"','fill="url(#fx-volume)"');
   return `<g opacity="${t>0?.92:0}">${streak}<g transform="translate(${line(pos.x,pos.y+arc)}) rotate(${angle+(melee?-18+24*t:0)}) scale(${scale})" style="color:${s.color}">${glyph}</g></g>`;}).join('');
  if(!impact)return '';
  const guard=c.reaction==='guard',nil=c.reaction==='null',scale=reduced?.6:.55+p*.25;
  const sparks=reduced||nil?'':Array.from({length:6},(_,k)=>{const a=(k*60+s.variant*13)*Math.PI/180,dist=20+p*28,x=Math.cos(a)*dist,y=Math.sin(a)*dist;return `<path d="M${line(x*.7,y*.7)} L${line(x,y)}" stroke="${guard?'#aeeaf6':s.color}" stroke-width="3"/>`;}).join('');
  const text=nil?'무효':guard?'방어':`−${c.damage}`;
  return `<g transform="translate(${line(to.x,to.y)})" style="color:${s.color}" opacity="${reduced?1:1-p*.6}">${!nil?`<g transform="scale(${scale})">${impactGlyph(s,reduced?.5:p,guard)}</g>${sparks}`:''}<text y="-35" text-anchor="middle" fill="${guard?'#bceef7':s.accent}" stroke="#0b1b26" stroke-width="3" paint-order="stroke" font-size="17" font-weight="800">${text}</text>${c.blocked&&c.damage?`<text y="-18" text-anchor="middle" fill="#bceef7" font-size="11">방어 ${c.blocked}</text>`:''}</g>`;
 }).join('');
}
/** SVG overlay follows live sprite rectangles; no fixed viewport coordinates or game mutations. */
export class CombatEffects {
 private raf=0;private node:SVGSVGElement|null=null;private host:HTMLElement|null=null;private root:HTMLElement|null=null;
 private plan:AttackPlan|null=null;private phase:PosePhase='travel';private start=0;private minimal=false;
 stage(root:HTMLElement,plan:AttackPlan,phase:PosePhase,minimal:boolean){
  this.stop();this.root=root;this.plan=plan;this.phase=phase;this.minimal=minimal;this.start=performance.now();
  this.host=root.querySelector<HTMLElement>('.battlefield');if(!this.host)return;
  this.host.classList.add('fx-active');this.node=document.createElementNS('http://www.w3.org/2000/svg','svg');
  this.node.classList.add('combat-fx');this.node.setAttribute('aria-hidden','true');this.node.dataset.skill=plan.key;this.node.dataset.phase=phase;this.host.append(this.node);
  if(!minimal){
   setPose(root.querySelector(actorSelector(plan.from)+' > .sprite'),poseFrame(phase,plan.spec.kind,plan.key));
   if(phase==='impact'||phase==='recover')for(const c of plan.contacts){
    const el=root.querySelector(actorSelector(c.actor));el?.classList.add('fx-'+c.reaction);
    setPose(el?.querySelector(':scope > .sprite')||null,c.reaction==='null'?0:phase==='recover'?5:c.reaction==='guard'?1:4);
   }
  }
  const tick=()=>{this.paint();if(this.node)this.raf=requestAnimationFrame(tick);};tick();
 }
 private paint(){
  if(!this.host?.isConnected||!this.node||!this.plan){this.stop();return;}
  if(this.phase==='prepare'||this.phase==='recover')return;
  const box=this.host.getBoundingClientRect();
  const point=(actor:Actor,source=false)=>{
   const el=this.root!.querySelector<HTMLElement>(actorSelector(actor)+' > .sprite'),r=el?.getBoundingClientRect();if(!r)return null;
   const anchor=source?(el?.dataset.pose?bodyOrigin(el.dataset.pose,this.plan!.spec.kind,actor!=='player',r.width,r.height,this.plan!.key):sourceAnchor(this.plan!.spec.kind,actor,r.width,r.height)):{x:r.width*.5,y:r.height*.48};
   return {x:r.left+anchor.x-box.left,y:r.top+anchor.y-box.top};
  };
  const from=point(this.plan.from,true);if(!from)return;
  const points=this.plan.contacts.map(c=>point(c.actor)||from);this.node.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
  const duration=this.phase==='travel'?this.plan.spec.travel:this.plan.spec.impact;
  this.node.innerHTML=effectSvg(this.plan,from,points,this.phase,(performance.now()-this.start)/duration,this.minimal);
 }
 stop(){
  cancelAnimationFrame(this.raf);this.raf=0;this.node?.remove();this.host?.classList.remove('fx-active');
  this.root?.querySelectorAll('.fx-hit,.fx-guard,.fx-null,.fx-caster').forEach(e=>e.classList.remove('fx-hit','fx-guard','fx-null','fx-caster'));
  this.root?.querySelectorAll('.battle-pose').forEach(e=>setPose(e,0));this.node=null;this.host=null;this.plan=null;
 }
}
