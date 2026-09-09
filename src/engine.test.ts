import { describe, expect, it } from 'vitest';
import { CARDS, ENEMIES, MAP, STORIES } from './data';
import { cardStats, chooseEvent, draw, endTurn, enterNode, evolve, evolutionOptions, intent, newRun, playCard, rest, reward, useSupply } from './engine';
import { emptyArchive, loadSave, SAVE_KEY, updateArchive, validRun, writeSave } from './storage';
import type { Form, Run, Save } from './types';

function fight(seed=12){const r=newRun(seed);enterNode(r,'0a');return r;}
function turnAI(r:Run){const b=r.battle!;if(r.hp<r.maxHp-18)useSupply(r);let limit=50;
 while(r.screen==='battle'&&limit--){b.target=b.enemies.findIndex(e=>e.hp>0);const incoming=b.enemies.reduce((s,e,i)=>s+(e.hp>0&&['attack','drain'].includes(intent(r,i).type)?intent(r,i).value:0),0);
 const candidates=b.hand.map((id,i)=>{const c=cardStats(r,id);let score=0;if(c.cost>b.energy)return {i,score:-100};if(c.energy)score+=30;if(c.draw)score+=4;if(c.damage)score+=c.damage/(c.cost||1);if(c.damage&&c.damage>=b.enemies[b.target].hp+b.enemies[b.target].block)score+=20;if(c.heal&&r.hp<r.maxHp-5)score+=10;if(c.block&&incoming>b.block)score+=Math.min(c.block,incoming-b.block)*.8;if(c.cleanse&&r.corruption)score+=15;if(c.weak&&incoming>10)score+=10;return {i,score};}).sort((a,b)=>b.score-a.score);
 if(!candidates.length||candidates[0].score<=0)break;playCard(r,candidates[0].i);
 }if(r.screen==='battle')endTurn(r);
}
function completeRun(seed:number,form:Form){const r=newRun(seed);let safety=500;const forms:Form[]=['agumon'];let turns=0;
 while(r.screen!=='result'&&safety--){expect(validRun(r)).toBe(true);
 if(r.screen==='map'){const next=evolutionOptions(r).find(e=>e.ready&&(e.form==='greymon'||e.form===form));if(next){evolve(r,next.form);forms.push(next.form);continue;}const paths=['0a','1a','2b','3a','4b',form==='skull'?'5b':'5a',form==='skull'?'6b':'6a','7a','8a','9a','10a'];enterNode(r,paths[r.row]);}
 else if(r.screen==='evolution')r.screen='map';
 else if(r.screen==='battle'){turnAI(r);turns++;}
 else if(r.screen==='reward'){const id=r.rewards.find(x=>['light','mimi','claw','analysis','hope'].includes(x));reward(r,id);}
 else if(r.screen==='rest')rest(r,'rest');
 else if(r.screen==='event')chooseEvent(r,form==='skull'&&[5,6].includes(r.row)?1:0);
 }
 return {r,forms,turns,safety};
}
describe('combat rules',()=>{
 it('starts with ten cards, five drawn, three energy, and rejects unreachable nodes',()=>{const r=newRun(1);enterNode(r,'10a');expect(r.screen).toBe('map');enterNode(r,'0a');expect(r.deck).toHaveLength(10);expect(r.battle?.hand).toHaveLength(5);expect(r.battle?.draw).toHaveLength(5);expect(r.battle?.energy).toBe(3);});
 it('spends energy, resolves attack and moves the card to discard',()=>{const r=fight();r.battle!.hand=['flame'];playCard(r,0);expect(r.battle!.energy).toBe(2);expect(r.battle!.enemies[0].hp).toBe(27);expect(r.battle!.discard).toEqual(['flame']);expect(r.battle!.hand).toEqual([]);});
 it('rejects unaffordable cards without changing state',()=>{const r=fight();r.battle!.hand=['courage'];r.battle!.energy=1;const before=structuredClone(r);expect(playCard(r,0)).toBe(false);expect(r).toEqual(before);});
 it('blocks the enemy attack then resets block and draws next turn',()=>{const r=fight();r.battle!.hand=['guard'];playCard(r,0);endTurn(r);expect(r.hp).toBe(64);expect(r.battle!.block).toBe(0);expect(r.battle!.energy).toBe(3);expect(r.battle!.hand).toHaveLength(5);expect(r.battle!.turn).toBe(2);});
 it('reshuffles discard and preserves the total number of cards',()=>{const r=fight();r.battle!.hand=[];r.battle!.draw=['guard'];r.battle!.discard=['flame','cheer','food','guard'];draw(r,5);expect(r.battle!.hand).toHaveLength(5);expect(r.battle!.draw).toHaveLength(0);expect(r.battle!.discard).toHaveLength(0);});
 it('draw cards cannot redraw themselves while resolving',()=>{const r=fight();r.battle!.hand=['cheer'];r.battle!.draw=[];r.battle!.discard=[];playCard(r,0);expect(r.battle!.hand).toEqual([]);expect(r.battle!.discard).toEqual(['cheer']);});
 it('distinguishes enemy patterns, weakness, guard, corruption and drain',()=>{expect(new Set(Object.values(ENEMIES).map(e=>JSON.stringify(e.pattern))).size).toBe(7);const r=fight();r.battle!.enemies[0].weak=2;expect(intent(r,0).value).toBe(4);endTurn(r);expect(r.hp).toBe(60);endTurn(r);expect(r.battle!.enemies[0].block).toBe(7);r.corruption=2;const hp=r.hp;endTurn(r);expect(r.hp).toBe(hp-14);});
 it('selects one target, applies all-target damage, and handles dead targets',()=>{const r=newRun(3);r.row=2;enterNode(r,'2a');r.battle!.hand=['flame','missile','flame'];r.battle!.energy=9;r.battle!.target=1;playCard(r,0);expect(r.battle!.enemies.map(e=>e.hp)).toEqual([28,21]);playCard(r,0);expect(r.battle!.enemies.map(e=>e.hp)).toEqual([6,0]);playCard(r,0);expect(r.screen).toBe('reward');});
 it('self damage can lose the battle even on a finishing attack',()=>{const r=fight();r.hp=5;r.battle!.hand=['zero'];playCard(r,0);expect(r.screen).toBe('result');expect(r.won).toBe(false);});
 it('can lose normally by passing turns',()=>{const r=fight();for(let i=0;i<30&&r.screen==='battle';i++)endTurn(r);expect(r.screen).toBe('result');expect(r.hp).toBe(0);expect(r.won).toBe(false);});
});
describe('progression and evolution',()=>{
 it('supports reward selection and skipping without duplicate completion',()=>{const r=fight();r.battle!.enemies[0].hp=1;r.battle!.hand=['flame'];playCard(r,0);expect(r.rewards).toHaveLength(3);expect(new Set(r.rewards).size).toBe(3);const id=r.rewards[0];reward(r,id);expect(r.deck).toHaveLength(11);expect(r.row).toBe(1);reward(r,id);expect(r.row).toBe(1);const s=fight();s.battle!.enemies[0].hp=1;s.battle!.hand=['flame'];playCard(s,0);reward(s);expect(s.deck).toHaveLength(10);});
 it('checks evolution conditions and changes the deck and combat modifiers',()=>{const r=newRun(2);expect(evolve(r,'greymon')).toBe(false);r.evoEnergy=5;expect(evolve(r,'greymon')).toBe(true);expect(r.deck.filter(c=>c==='nova')).toHaveLength(4);expect(r.maxHp).toBe(80);r.screen='map';r.evoEnergy=14;r.bond=7;expect(evolve(r,'metal')).toBe(true);expect(r.deck.filter(c=>c==='missile')).toHaveLength(2);expect(cardStats(r,'nova').damage).toBe(15);expect(cardStats(r,'guard').block).toBe(10);});
 it('never automatically forces evolution and applies skull recoil',()=>{const r=newRun(2);r.evoEnergy=99;evolve(r,'greymon');r.screen='map';r.burden=20;enterNode(r,'0a');expect(r.form).toBe('greymon');expect(evolve(r,'skull')).toBe(false);r.screen='map';r.battle=null;expect(evolve(r,'skull')).toBe(true);r.screen='map';enterNode(r,'0a');r.battle!.block=100;endTurn(r);expect(r.hp).toBe(88);expect(r.deck.filter(c=>c==='zero')).toHaveLength(2);expect(evolutionOptions(r)).toHaveLength(0);});
 it('applies every event and safe/risky consequences',()=>{for(const n of MAP.flat().filter(n=>n.event)){for(let c=0;c<2;c++){const r=newRun(1);r.row=MAP.findIndex(row=>row.includes(n));r.hp=30;enterNode(r,n.id);const choice=STORIES[n.event!].choices[c];chooseEvent(r,c);expect(r.bond).toBe(1+(choice.bond||0));expect(r.evoEnergy).toBe(choice.energy||0);expect(r.lastEvent).toBe(n.event);expect(r.row).toBe(MAP.findIndex(row=>row.includes(n))+1);}}});
 it('completes both evolution paths across seeded full expeditions',()=>{for(const form of ['metal','skull'] as Form[]){for(const seed of [1,7,42,99,2026]){const {r,forms,safety}=completeRun(seed,form);expect(safety).toBeGreaterThan(0);expect(forms,`${form} seed ${seed}`).toContain(form);expect(r.won,`${form} seed ${seed}, hp ${r.hp}`).toBe(true);expect(r.path).toHaveLength(11);expect(r.battles).toBe(5);}}});
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
