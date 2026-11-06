import {describe,it,expect} from 'vitest';
import {FORMS,ENEMIES,CARDS} from './data';
import {hasPose,poseId,posePath,bodyOrigin,BODY_ORIGINS,poseFrame} from './battle-poses';
import {attackBeats,cardAttackPlan,enemyAttackPlan,contactSnapshot} from './combat-effects';
import {newRun,enterNode,makeEnemy,endTurn,playCard} from './engine';
import type {TurnFrame} from './engine';
import manifest from './pose-manifest.json';
describe('body animation coverage and presentation truth',()=>{
 it('covers every playable form and enemy with individual poses and origins',()=>{
  for(const id of [...Object.keys(FORMS),...Object.keys(ENEMIES)]){expect(hasPose(id),id).toBe(true);expect(BODY_ORIGINS[poseId(id)],id).toBeDefined();expect(posePath(id)).toMatch(/^poses\/[a-z-]+-poses\.(webp|svg)$/);}
  expect(poseId('gatomon-resonance')).toBe('gatomon');
 });
 it('uses independent windup, release, hit and recovery cells',()=>{expect(poseFrame('prepare','flame')).toBe(1);expect(poseFrame('travel','flame')).toBe(2);expect(poseFrame('travel','claw')).toBe(3);expect(poseFrame('recover','claw')).toBe(5);for(const entry of Object.values(manifest))expect(entry.frames).toHaveLength(6);});
 it('mirrors origins inside the contained square without stretching bodies',()=>{
  for(const id of Object.keys(BODY_ORIGINS))for(const [w,h] of [[200,120],[90,140]]){const p=bodyOrigin(id,'flame',false,w,h),e=bodyOrigin(id,'flame',true,w,h);expect(p.x+e.x).toBeCloseTo(w);expect(p.y).toBe(e.y);expect(p.x).toBeLessThan(w);expect(p.y).toBeLessThan(h);}
 });
 it('renders cards as one logical impact irrespective of projectile decorations',()=>{
  for(const [id,card] of Object.entries(CARDS))if(card.damage){const before=newRun(15,card.owner||'tai');before.screen='map';enterNode(before,'0a');before.battle!.hand=[id];before.battle!.energy=99;const after=structuredClone(before);playCard(after,0);expect(attackBeats(cardAttackPlan(before,after,id)!)).toHaveLength(1);}
 });
 it('shows the intended hit count and conserves committed damage/block at every beat',()=>{
  for(const block of [0,3,999]){const r=newRun(15);r.screen='map';enterNode(r,'0a');r.battle!.enemies=[makeEnemy('kuwaga')];r.battle!.block=block;const frames:TurnFrame[]=[];endTurn(r,frames);const before=frames[0].run,after=frames[1].run,p=enemyAttackPlan(before,frames[1])!,beats=attackBeats(p);
   expect(beats).toHaveLength(2);expect(beats.reduce((n,b)=>n+b.contacts[0].damage,0)).toBe(p.contacts[0].damage);expect(beats.reduce((n,b)=>n+b.contacts[0].blocked,0)).toBe(p.contacts[0].blocked);
   const snapshot=contactSnapshot(before,after,beats,0);expect(snapshot.hp).toBe(before.hp-beats[0].contacts[0].damage);expect(contactSnapshot(before,after,beats,1)).toEqual(after);expect(r.seed).toBe(before.seed);
  }
 });
});
