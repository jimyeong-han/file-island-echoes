import {afterEach,describe,expect,it,vi} from 'vitest';
import {EvolutionSequence,EVOLUTION_TIMING} from './evolution-sequence';
import {evolutionScreen} from './evolution-ui';
import {EVOLUTIONS,FORMS} from './data';
import {evolve,newRun} from './engine';
import {freshSave,exportSave,prepareImport} from './save-files';
import {saveRun} from './storage';
import {AUDIO} from './audio';
afterEach(()=>vi.useRealTimers());
const setup=(score=vi.fn(async()=>true))=>{const frame=vi.fn(),stopScore=vi.fn();return {sequence:new EvolutionSequence({score,frame,stopScore}),frame,score,stopScore};};
describe('evolution presentation lifecycle',()=>{
 it('follows score cue points and cleans up at its end',async()=>{
  vi.useFakeTimers();const h=setup();await h.sequence.start();expect(h.sequence.phase).toBe('device');
  await vi.advanceTimersByTimeAsync(800);expect(h.sequence.phase).toBe('signal');await vi.advanceTimersByTimeAsync(800);expect(h.sequence.phase).toBe('data');
  await vi.advanceTimersByTimeAsync(1600);expect(h.sequence.phase).toBe('reveal');await vi.advanceTimersByTimeAsync(2400);expect(h.sequence.phase).toBe('complete');expect(h.sequence.running).toBe(false);expect(vi.getTimerCount()).toBe(0);
  expect(AUDIO['music-evolution'].duration*1000).toBe(EVOLUTION_TIMING.complete);
 });
 it('skip/navigation aborts pending music and cannot resurrect a stale timeline',async()=>{
  vi.useFakeTimers();let resolve!:(n:boolean)=>void;const score=vi.fn(()=>new Promise<boolean>(r=>resolve=r)),h=setup(score);
  const p=h.sequence.start(true);h.sequence.finish();resolve(true);await p;await vi.advanceTimersByTimeAsync(10000);expect(h.sequence.phase).toBe('complete');expect(h.sequence.running).toBe(false);expect(vi.getTimerCount()).toBe(0);
  expect((score.mock.calls as unknown as [boolean,AbortSignal][])[0][1].aborted).toBe(true);
 });
 it('reduced motion makes only a brief static change, without delayed sound',async()=>{
  vi.useFakeTimers();const h=setup();await h.sequence.start(false,true);expect(h.score).not.toHaveBeenCalled();await vi.advanceTimersByTimeAsync(180);expect(h.sequence.phase).toBe('complete');expect(h.frame.mock.calls.map(c=>c[0])).not.toContain('data');expect(vi.getTimerCount()).toBe(0);
 });
 it('muted, failed and rejected audio never prevent a reveal or a later sequence',async()=>{
  vi.useFakeTimers();const h=setup(vi.fn().mockRejectedValueOnce(Error('offline')).mockResolvedValue(false));await h.sequence.start();await vi.advanceTimersByTimeAsync(5600);expect(h.sequence.phase).toBe('complete');
  await h.sequence.start(true);await vi.advanceTimersByTimeAsync(1600);h.sequence.finish();await vi.advanceTimersByTimeAsync(5000);expect(h.sequence.phase).toBe('complete');expect(vi.getTimerCount()).toBe(0);
 });
 it.each(EVOLUTIONS)('commits $from → $to once and restores its exact saved result',e=>{
  const r=newRun(13,FORMS[e.from].owner);r.screen='map';r.form=e.from;r.maxHp=FORMS[e.from].hp;r.hp=r.maxHp-10;r.evoEnergy=30;r.bond=15;r.burden=e.burden;
  expect(evolve(r,e.to)).toBe(true);const result=structuredClone(r);expect(evolve(r,e.to)).toBe(false);expect(r).toEqual(result);
  const s=freshSave();saveRun(s,r);const restored=prepareImport(exportSave(s).text).save.runs[r.characterId]!.run;expect(restored).toEqual(result);
  const html=evolutionScreen(restored);expect(html).toContain(FORMS[e.from].name);expect(html).toContain(FORMS[e.to].name);expect(html).toContain('data-phase="complete"');expect(html).toContain('data-action="evolution-skip"');
  if(e.resonance){expect(FORMS[e.from].art).toBe(FORMS[e.to].art);expect(html).toContain('data-mode="resonance"');expect(html).toContain('새로운 종으로 진화하는 대신');}
  if(e.to==='skull')expect(html).toContain('data-mode="forced"');
 });
 it('keeps all eight evolved slots independent across a save export',()=>{
  const s=freshSave();for(const e of EVOLUTIONS.filter(e=>FORMS[e.to].stage===1)){const r=newRun(13,FORMS[e.to].owner);r.screen='map';r.evoEnergy=30;evolve(r,e.to);saveRun(s,r);}
  const restored=prepareImport(exportSave(s).text).save;expect(Object.keys(restored.runs)).toHaveLength(8);expect(restored.runs).toEqual(s.runs);expect(restored.version).toBe(3);
 });
});
