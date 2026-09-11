import {describe,it,expect,vi,afterEach} from 'vitest';
import {MotionQueue} from './combat-motion';
import {appendLog,logEntries} from './combat-log';
import {newRun,enterNode,endTurn,makeEnemy} from './engine';
import type {TurnFrame} from './engine';
import {CHARACTER_IDS} from './types';
import {ENEMIES} from './data';
afterEach(()=>vi.useRealTimers());
describe('combat presentation lifetime',()=>{
 it('cancels every pending continuation and cleans up once on navigation',async()=>{vi.useFakeTimers();const q=new MotionQueue(),done=vi.fn(),token=q.begin(done),a=q.wait(150,token),b=q.wait(600,token);q.finish();q.finish();await expect(a).resolves.toBe(false);await expect(b).resolves.toBe(false);await vi.runAllTimersAsync();expect(done).toHaveBeenCalledTimes(1);expect(q.busy).toBe(false);expect(vi.getTimerCount()).toBe(0);});
 it('an old deal cannot finish a replacement turn',async()=>{vi.useFakeTimers();const q=new MotionQueue(),old=q.begin(()=>{}),wait=q.wait(200,old),next=q.begin(()=>{});await vi.advanceTimersByTimeAsync(200);expect(await wait).toBe(false);expect(q.live(old)).toBe(false);expect(q.live(next)).toBe(true);q.finish();});
 it('watchdog unlocks even without animation completion or a UI continuation',async()=>{vi.useFakeTimers();const q=new MotionQueue(),done=vi.fn();q.begin(done);await vi.advanceTimersByTimeAsync(4000);expect(q.busy).toBe(false);expect(done).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);});
 it('reduced motion still completes its state transition',async()=>{vi.useFakeTimers();const q=new MotionQueue(),done=vi.fn(),token=q.begin(done),wait=q.wait(50,token);await vi.advanceTimersByTimeAsync(50);expect(await wait).toBe(true);q.finish();expect(done).toHaveBeenCalledOnce();});
});
describe('chronological battle log',()=>{
 it('reads legacy entries without reversing the source and continues their order',()=>{const old=['last','first'],copy=[...old];expect(logEntries(old)).toEqual([{number:1,text:'first'},{number:2,text:'last'}]);expect(old).toEqual(copy);expect(logEntries(appendLog(old,'new')).map(e=>e.number)).toEqual([1,2,3]);});
 it('keeps consecutive event numbers across capped windows and JSON restore',()=>{let log:string[]=[];for(let i=0;i<1200;i++)log=appendLog(log,'event '+i);expect(log).toHaveLength(999);log=appendLog(JSON.parse(JSON.stringify(log)),'next');const entries=logEntries(log);expect(entries[0].number).toBe(203);expect(entries.at(-1)?.number).toBe(1201);expect(new Set(entries.map(e=>e.number)).size).toBe(999);});
});
describe('enemy presentation snapshots',()=>{
 it('has identical final rules and RNG with or without presentation for every partner and enemy pattern',()=>{
  for(const id of CHARACTER_IDS)for(const [enemy,def] of Object.entries(ENEMIES))for(let step=0;step<def.pattern.length;step++){
   const r=newRun(391,id);r.screen='map';enterNode(r,'0a');r.hp=r.maxHp=999;r.battle!.enemies=[makeEnemy(enemy),makeEnemy('kuwaga')];r.battle!.enemies[0].step=step;r.battle!.block=5;r.battle!.enemies[0].burn=2;
   const copy=structuredClone(r),frames:TurnFrame[]=[];endTurn(r,frames);endTurn(copy);expect(r).toEqual(copy);expect(frames[0].enemy).toBe(-1);expect(frames.filter(f=>f.action).map(f=>f.enemy)).toEqual([0,1]);const final=structuredClone(r);frames[0].run.hp=1;expect(r).toEqual(final);
  }
 });
 it('does not show actions after status death or lethal first enemy',()=>{
  const r=newRun(1);r.screen='map';enterNode(r,'0a');r.hp=1;r.corruption=2;let frames:TurnFrame[]=[];endTurn(r,frames);expect(r.screen).toBe('result');expect(frames.filter(f=>f.action)).toHaveLength(0);
  const s=newRun(1);s.screen='map';enterNode(s,'0a');s.hp=1;s.battle!.enemies=[makeEnemy('kuwaga'),makeEnemy('kuwaga')];frames=[];endTurn(s,frames);expect(s.screen).toBe('result');expect(frames.filter(f=>f.action).map(f=>f.enemy)).toEqual([0]);
 });
 it('keeps the acting enemy snapshot when counterattack kills it mid-turn',()=>{const r=newRun(1);r.screen='map';enterNode(r,'0a');r.battle!.enemies=[makeEnemy('kuwaga')];r.battle!.enemies[0].hp=1;r.battle!.ability.thorns=2;const frames:TurnFrame[]=[];endTurn(r,frames);expect(frames[1].run.battle!.enemies[0].hp).toBe(0);expect(r.screen).toBe('reward');});
});
