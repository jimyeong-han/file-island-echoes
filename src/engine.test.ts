import { describe, expect, it } from 'vitest';
import { BOSS_RAGE, CARDS, ENEMIES, MAP, RECOVERY, STORIES } from './data';
import { cardStats, chooseEvent, draw, endTurn, enterNode, evolve, evolutionOptions, intent, newRun, playCard, rest, reward, turnThreat, useSupply } from './engine';
import { emptyArchive, loadSave, SAVE_KEY, updateArchive, validRun, writeSave } from './storage';
import { balanceReport, playTurn } from '../scripts/balance-simulation';
import type { Form, Run, Save } from './types';

function fight(seed=12){const r=newRun(seed);enterNode(r,'0a');return r;}
function turnAI(r:Run){playTurn(r,'tactical');}
function completeRun(seed:number,form:Form){const r=newRun(seed);let safety=500;const forms:Form[]=['agumon'];let turns=0;
 while(r.screen!=='result'&&safety--){expect(validRun(r)).toBe(true);
 if(r.screen==='map'){const next=evolutionOptions(r).find(e=>e.ready&&(e.form==='greymon'||e.form===form));if(next){evolve(r,next.form);forms.push(next.form);continue;}const paths=['0a','1a','2b','3a','4b',form==='skull'?'5b':'5a',form==='skull'?'6b':'6a','7a','8a','9a','10a'];enterNode(r,paths[r.row]);}
 else if(r.screen==='evolution')r.screen='map';
 else if(r.screen==='battle'){turnAI(r);turns++;}
 else if(r.screen==='reward'){const id=['analysis','light','mimi','claw','hope','matt'].find(x=>r.rewards.includes(x as typeof r.rewards[number])) as typeof r.rewards[number] | undefined;reward(r,id);}
 else if(r.screen==='rest')rest(r,'rest');
 else if(r.screen==='event')chooseEvent(r,form==='skull'&&[5,6].includes(r.row)?1:0);
 }
 return {r,forms,turns,safety};
}
describe('combat rules',()=>{
 it('cheer cycles a card without generating free energy',()=>{const r=fight();r.battle!.hand=['cheer'];r.battle!.draw=['guard'];playCard(r,0);expect(r.battle!.energy).toBe(3);expect(r.battle!.hand).toEqual(['guard']);});
 it('forecasts the exact damage after block, weakness, corruption and skull recoil',()=>{
  const r=newRun(55);r.row=2;r.form='skull';enterNode(r,'2a');r.battle!.enemies[1].weak=1;r.battle!.block=5;r.corruption=2;
  const forecast=turnThreat(r),hp=r.hp;expect(forecast).toEqual({incoming:11,blocked:5,recoil:4,damage:10});
  endTurn(r);expect(r.hp).toBe(hp-forecast.damage);expect(turnThreat(r).incoming).toBe(0);
 });
 it('scales boss attacks at announced turns and applies weakness after the bonus',()=>{
  const r=newRun(1);r.row=10;enterNode(r,'10a');const b=r.battle!;
  expect(intent(r,0).value).toBe(20);b.turn=BOSS_RAGE.turn;expect(intent(r,0).value).toBe(26);
  b.turn=9;expect(intent(r,0).value).toBe(32);b.enemies[0].weak=1;expect(intent(r,0).value).toBe(19);
  b.enemies[0].step=1;expect(intent(r,0).type).toBe('corrupt');expect(intent(r,0).value).toBe(2);
  const resumed=JSON.parse(JSON.stringify(r));expect(intent(resumed,0)).toEqual(intent(r,0));
 });
 it('drain heals only from damage that passed through block',()=>{
  const r=newRun(1);r.row=10;enterNode(r,'10a');const e=r.battle!.enemies[0];e.step=2;e.hp=100;r.battle!.block=20;
  endTurn(r);expect(r.hp).toBe(58);expect(e.hp).toBe(103);
 });
 it('skips a defeated target when using a single-target card',()=>{
  const r=newRun(1);r.row=2;enterNode(r,'2a');r.battle!.enemies[1].hp=0;r.battle!.target=1;r.battle!.hand=['flame'];
  playCard(r,0);expect(r.battle!.target).toBe(0);expect(r.battle!.enemies[0].hp).toBe(27);
 });
 it('starts with ten cards, five drawn, three energy, and rejects unreachable nodes',()=>{const r=newRun(1);enterNode(r,'10a');expect(r.screen).toBe('map');enterNode(r,'0a');expect(r.deck).toHaveLength(10);expect(r.battle?.hand).toHaveLength(5);expect(r.battle?.draw).toHaveLength(5);expect(r.battle?.energy).toBe(3);});
 it('spends energy, resolves attack and moves the card to discard',()=>{const r=fight();r.battle!.hand=['flame'];playCard(r,0);expect(r.battle!.energy).toBe(2);expect(r.battle!.enemies[0].hp).toBe(27);expect(r.battle!.discard).toEqual(['flame']);expect(r.battle!.hand).toEqual([]);});
 it('rejects unaffordable cards without changing state',()=>{const r=fight();r.battle!.hand=['courage'];r.battle!.energy=1;const before=structuredClone(r);expect(playCard(r,0)).toBe(false);expect(r).toEqual(before);});
 it('blocks the enemy attack then resets block and draws next turn',()=>{const r=fight();r.battle!.hand=['guard'];playCard(r,0);endTurn(r);expect(r.hp).toBe(64);expect(r.battle!.block).toBe(0);expect(r.battle!.energy).toBe(3);expect(r.battle!.hand).toHaveLength(5);expect(r.battle!.turn).toBe(2);});
 it('reshuffles discard and preserves the total number of cards',()=>{const r=fight();r.battle!.hand=[];r.battle!.draw=['guard'];r.battle!.discard=['flame','cheer','food','guard'];draw(r,5);expect(r.battle!.hand).toHaveLength(5);expect(r.battle!.draw).toHaveLength(0);expect(r.battle!.discard).toHaveLength(0);});
 it('draw cards cannot redraw themselves while resolving',()=>{const r=fight();r.battle!.hand=['cheer'];r.battle!.draw=[];r.battle!.discard=[];playCard(r,0);expect(r.battle!.hand).toEqual([]);expect(r.battle!.discard).toEqual(['cheer']);});
 it('distinguishes enemy patterns, weakness, guard, corruption and drain',()=>{expect(new Set(Object.values(ENEMIES).map(e=>JSON.stringify(e.pattern))).size).toBe(7);const r=fight();r.battle!.enemies[0].weak=2;expect(intent(r,0).value).toBe(4);endTurn(r);expect(r.hp).toBe(60);endTurn(r);expect(r.battle!.enemies[0].block).toBe(7);r.corruption=2;const hp=r.hp;endTurn(r);expect(r.hp).toBe(hp-14);});
 it('selects one target, applies all-target damage, and handles dead targets',()=>{const r=newRun(3);r.row=2;enterNode(r,'2a');r.battle!.hand=['flame','zero','flame'];r.battle!.energy=9;r.battle!.target=1;playCard(r,0);expect(r.battle!.enemies.map(e=>e.hp)).toEqual([34,27]);playCard(r,0);expect(r.battle!.enemies.map(e=>e.hp)).toEqual([0,0]);expect(r.screen).toBe('reward');});
 it('self damage can lose the battle even on a finishing attack',()=>{const r=fight();r.hp=5;r.battle!.hand=['zero'];playCard(r,0);expect(r.screen).toBe('result');expect(r.won).toBe(false);});
 it('can lose normally by passing turns',()=>{const r=fight();for(let i=0;i<30&&r.screen==='battle';i++)endTurn(r);expect(r.screen).toBe('result');expect(r.hp).toBe(0);expect(r.won).toBe(false);});
});
describe('progression and evolution',()=>{
 it('preserves damage after winning and uses the shared limited recovery values',()=>{
  const r=fight();r.hp=25;r.battle!.enemies[0].hp=1;r.battle!.hand=['flame'];playCard(r,0);reward(r);
  expect(r.hp).toBe(25);useSupply(r);expect(r.hp).toBe(25+RECOVERY.supply);expect(r.supplies).toBe(1);
  r.row=3;enterNode(r,'3a');rest(r,'rest');expect(r.hp).toBe(25+RECOVERY.supply+RECOVERY.rest);
 });
 it('supports reward selection and skipping without duplicate completion',()=>{const r=fight();r.battle!.enemies[0].hp=1;r.battle!.hand=['flame'];playCard(r,0);expect(r.rewards).toHaveLength(3);expect(new Set(r.rewards).size).toBe(3);const id=r.rewards[0];reward(r,id);expect(r.deck).toHaveLength(11);expect(r.row).toBe(1);reward(r,id);expect(r.row).toBe(1);const s=fight();s.battle!.enemies[0].hp=1;s.battle!.hand=['flame'];playCard(s,0);reward(s);expect(s.deck).toHaveLength(10);});
 it('checks evolution conditions and changes the deck and combat modifiers',()=>{const r=newRun(2);expect(evolve(r,'greymon')).toBe(false);r.evoEnergy=5;expect(evolve(r,'greymon')).toBe(true);expect(r.deck.filter(c=>c==='nova')).toHaveLength(4);expect(r.maxHp).toBe(80);r.screen='map';r.evoEnergy=14;r.bond=7;expect(evolve(r,'metal')).toBe(true);expect(r.deck.filter(c=>c==='missile')).toHaveLength(2);expect(cardStats(r,'nova').damage).toBe(15);expect(cardStats(r,'guard').block).toBe(10);});
 it('never automatically forces evolution and applies skull recoil',()=>{const r=newRun(2);r.evoEnergy=99;evolve(r,'greymon');r.screen='map';r.burden=20;enterNode(r,'0a');expect(r.form).toBe('greymon');expect(evolve(r,'skull')).toBe(false);r.screen='map';r.battle=null;expect(evolve(r,'skull')).toBe(true);r.screen='map';enterNode(r,'0a');r.battle!.block=100;endTurn(r);expect(r.hp).toBe(88);expect(r.deck.filter(c=>c==='zero')).toHaveLength(2);expect(evolutionOptions(r)).toHaveLength(0);});
 it('applies every event and safe/risky consequences',()=>{for(const n of MAP.flat().filter(n=>n.event)){for(let c=0;c<2;c++){const r=newRun(1);r.row=MAP.findIndex(row=>row.includes(n));r.hp=30;enterNode(r,n.id);const choice=STORIES[n.event!].choices[c];chooseEvent(r,c);expect(r.bond).toBe(1+(choice.bond||0));expect(r.evoEnergy).toBe(choice.energy||0);expect(r.lastEvent).toBe(n.event);expect(r.row).toBe(MAP.findIndex(row=>row.includes(n))+1);}}});
 it('can win both paths while preserving valid checkpoints on wins and losses',()=>{
  for(const form of ['metal','skull'] as Form[]){
   let wins=0;
   for(let seed=1;seed<=30;seed++){
    const {r,forms,safety}=completeRun(seed,form);
    expect(safety).toBeGreaterThan(0);expect(forms).toContain(form);expect(r.screen).toBe('result');
    if(r.won){wins++;expect(r.path).toHaveLength(11);expect(r.battles).toBe(5);}
    else expect(r.hp).toBe(0);
   }
   expect(wins,form).toBeGreaterThan(form==='metal'?20:5);
  }
 });
 it('rewards defensive planning over attack-only play across both routes',()=>{
  const reports=balanceReport(50);
  expect(reports.some(x=>x.exhausted)).toBe(false);
  const planned=reports.filter(x=>x.strategy==='tactical'), rushed=reports.filter(x=>x.strategy==='rush');
  expect(planned.every(x=>x.wins>0)).toBe(true);
  expect(planned.reduce((s,x)=>s+x.wins,0)).toBeGreaterThan(rushed.reduce((s,x)=>s+x.wins,0)+30);
  expect(rushed.some(x=>x.wins<x.runs/2)).toBe(true);
 });
});
describe('save checkpoints',()=>{
 const wrap=(r:Run):Save=>({version:1,run:r,archive:emptyArchive(),settings:{muted:true,reducedMotion:false,guide:true}});
 it('round trips a battle checkpoint exactly, including shuffle and enemy intents',()=>{const r=fight(55);playCard(r,0);endTurn(r);const s=wrap(r);const raw=JSON.stringify(s);const loaded=loadSave({getItem:()=>raw});expect(loaded.warning).toBe('');expect(loaded.save.run).toEqual(r);});
 it('handles malformed JSON, wrong schemas and blocked storage',()=>{for(const raw of ['{','null','[]','{}',JSON.stringify({...wrap(fight()),run:{screen:'battle'}})]){expect(loadSave({getItem:()=>raw}).save.run).toBeNull();}expect(loadSave({getItem:()=>{throw Error('blocked');}}).warning).not.toBe('');expect(writeSave(wrap(fight()),{setItem:()=>{throw Error('quota');}})).toBe(false);});
 it('rejects structurally corrupted nested data while keeping valid archive/settings',()=>{const s=wrap(fight());s.settings.reducedMotion=true;(s.run!.battle!.enemies[0] as any).id='unknown';const loaded=loadSave({getItem:()=>JSON.stringify(s)});expect(loaded.save.run).toBeNull();expect(loaded.save.settings.reducedMotion).toBe(true);expect(loaded.save.archive.forms).toEqual(['agumon']);});
 it('rejects corrupt optional evolution and event references',()=>{for(const key of ['evolvedFrom','lastEvent']){const r=newRun(1);(r as any)[key]='missing';expect(validRun(r)).toBe(false);}});
 it('keeps the game available when the browser blocks the storage accessor itself',()=>{const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');try{Object.defineProperty(globalThis,'localStorage',{configurable:true,get:()=>{throw Error('SecurityError');}});expect(loadSave().save.run).toBeNull();expect(writeSave(wrap(fight()))).toBe(false);}finally{if(original)Object.defineProperty(globalThis,'localStorage',original);else Reflect.deleteProperty(globalThis,'localStorage');}});
 it('records a result once and starts the next run without permanent stat bonuses',()=>{const {r}=completeRun(1,'metal');const s=wrap(r),before=structuredClone(r);before.screen='battle';updateArchive(s,before);updateArchive(s,r);expect(s.archive.wins).toBe(1);expect(s.archive.runs).toBe(1);expect(newRun().deck).toHaveLength(10);expect(newRun().maxHp).toBe(64);let key='';expect(writeSave(s,{setItem:(k)=>{key=k;}})).toBe(true);expect(key).toBe(SAVE_KEY);});
});
