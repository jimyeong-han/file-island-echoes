import { describe, it, expect } from 'vitest';
import { exportSave, prepareImport, replaceSave, resetSave, freshSave, MAX_SAVE_BYTES } from './save-files';
import { SAVE_KEY, LEGACY_KEY, loadSave } from './storage';
import { newRun, enterNode, playCard } from './engine';

const fullSave=()=>{
 const s=freshSave();s.run=newRun(123,'kari');s.run.started=Date.parse('2026-09-11T00:00:00Z');s.run.screen='map';enterNode(s.run,'0a');playCard(s.run,0);
 s.archive={forms:['gatomon','angewomon'],enemies:['devimon'],events:[],zones:[0,1,2],runs:2,wins:1,best:11,clears:{kari:['file']},endings:['kari:file']};
 s.settings={masterVolume:.42,musicVolume:.16,sfxVolume:.72,muted:false,reducedMotion:true,guide:false};return s;
};
const envelope=()=>JSON.parse(exportSave(fullSave(),new Date('2026-09-11T00:00:00Z')).text);
const memory=()=>{const values=new Map<string,string>();return {values,getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};};
describe('local save files',()=>{
 it('exports readable UTF-8 envelope even with no existing save',()=>{
  const s=freshSave(),f=exportSave(s,new Date(2026,8,11,9,5));expect(f.filename).toBe('file-island-echoes-save-20260911-0905.json');expect(f.text).toContain('\n  "app"');expect(prepareImport(f.text).save).toEqual(s);
 });
 it('roundtrips battle piles, seed, archive, chapters and every setting without mutating source',()=>{
  const s=fullSave(),before=structuredClone(s);expect(prepareImport(exportSave(s).text).save).toEqual(s);expect(s).toEqual(before);
 });
 it('preview never writes; confirmation writes once and loadSave returns the same data',()=>{
  const io=memory();io.setItem(SAVE_KEY,exportSave(freshSave()).text);const original=io.getItem(SAVE_KEY),p=prepareImport(exportSave(fullSave()).text);expect(io.getItem(SAVE_KEY)).toBe(original);
  let writes=0;expect(replaceSave(p,{setItem:(k,v)=>{writes++;io.setItem(k,v);}})).toBe(true);expect(writes).toBe(1);expect(loadSave(io).save).toEqual(p.save);
 });
 it('failed atomic write preserves original and preview',()=>{
  const io=memory();io.setItem(SAVE_KEY,'unchanged');const p=prepareImport(exportSave(fullSave()).text),copy=structuredClone(p);
  expect(replaceSave(p,{setItem:()=>{throw Error('quota');}})).toBe(false);expect(io.getItem(SAVE_KEY)).toBe('unchanged');expect(p).toEqual(copy);
 });
 it('reset deletes only the two owned keys and a backup restores everything',()=>{
  const io=memory(),s=fullSave(),backup=exportSave(s).text;io.setItem(SAVE_KEY,JSON.stringify(s));io.setItem(LEGACY_KEY,'old');io.setItem('unrelated:test','keep');
  expect(resetSave(io)).toBe(true);expect([...io.values]).toEqual([['unrelated:test','keep']]);expect(loadSave(io).save.run).toBe(null);
  expect(replaceSave(prepareImport(backup),io)).toBe(true);expect(loadSave(io).save).toEqual(s);
 });
 it('reports reset failures and restores both keys when the second removal fails',()=>{
  const io=memory();io.setItem(SAVE_KEY,'current');io.setItem(LEGACY_KEY,'legacy');
  expect(resetSave({...io,removeItem:k=>{if(k===SAVE_KEY)throw Error('denied');io.removeItem(k);}})).toBe(false);
  expect(io.getItem(SAVE_KEY)).toBe('current');expect(io.getItem(LEGACY_KEY)).toBe('legacy');
 });
 it('reports storage access failure',()=>expect(resetSave({getItem:()=>{throw Error();},setItem:()=>{},removeItem:()=>{}})).toBe(false));
 it('migrates raw v1 and v1 payloads using the existing storage migration',()=>{
  const s=fullSave(),r=newRun(123,'tai');r.screen='map';enterNode(r,'0a');const old={...s,version:1,run:r};
  for(const text of [JSON.stringify(old),JSON.stringify({...envelope(),payload:old})]){
   const p=prepareImport(text);expect(p.save.version).toBe(2);expect(p.save.run?.characterId).toBe('tai');expect(p.save.archive.clears.tai).toEqual(['file']);expect(p.warnings.length).toBeGreaterThan(0);
  }
 });
 it('keeps archive and settings when run is corrupt',()=>{
  const e=envelope();e.payload.run.form='not-a-form';const p=prepareImport(JSON.stringify(e));expect(p.save.run).toBe(null);expect(p.save.archive).toEqual(fullSave().archive);expect(p.save.settings).toEqual(fullSave().settings);expect(p.warnings.join(' ')).toContain('도감과 설정');
 });
 it('removes unknown safe fields from all persisted levels',()=>{
  const e=envelope();e.extra='okay';e.payload.extra='ignore';e.payload.run.extra='ignore';e.payload.run.battle.extra='ignore';e.payload.run.battle.ability.extra='ignore';e.payload.run.battle.enemies[0].extra='ignore';
  expect(prepareImport(JSON.stringify(e)).save).toEqual(fullSave());
 });
 it.each([
  ['invalid JSON','{'],['non-object','[]'],['wrong app',JSON.stringify({...envelope(),app:'another-app'})],
  ['future format',JSON.stringify({...envelope(),formatVersion:2})],['missing payload',JSON.stringify({...envelope(),payload:null})],
  ['empty archive',JSON.stringify({...envelope(),payload:{...fullSave(),archive:{}}})],
  ['future schema',JSON.stringify({...envelope(),payload:{...fullSave(),version:3}})],
  ['bad date',JSON.stringify({...envelope(),exportedAt:'invalid'})],['bad version',JSON.stringify({...envelope(),appVersion:'<img onerror=1>'})],
  ['prototype pollution','{"app":"file-island-echoes","payload":{"__proto__":{"polluted":true}}}'],
  ['constructor pollution','{"constructor":{"prototype":{"polluted":true}}}'],
  ['oversized array',JSON.stringify({...envelope(),extra:Array(1000).fill(1)})],
  ['oversized string',JSON.stringify({...envelope(),extra:'x'.repeat(2049)})],
  ['numeric overflow',JSON.stringify({...envelope(),extra:1e20})],
  ['invalid volume',JSON.stringify({...envelope(),payload:{...fullSave(),settings:{...fullSave().settings,musicVolume:2}}})],
 ])('rejects %s before any persistence',(_name,text)=>{
  const io=memory();io.setItem(SAVE_KEY,'original');expect(()=>prepareImport(text)).toThrow();expect(io.getItem(SAVE_KEY)).toBe('original');expect(({} as Record<string,unknown>).polluted).toBeUndefined();
 });
 it('rejects oversized files before parsing even if reported byte count is forged',()=>{
  expect(()=>prepareImport('{}',MAX_SAVE_BYTES+1)).toThrow('1MB');expect(()=>prepareImport(' '.repeat(MAX_SAVE_BYTES+1),1)).toThrow('1MB');
 });
 it('rejects excessive nesting',()=>{let x:unknown=0;for(let i=0;i<20;i++)x={x};expect(()=>prepareImport(JSON.stringify({...envelope(),extra:x}))).toThrow('복잡');});
 it('does not discard valid logs or optional victory copy',()=>{
  const s=fullSave();s.run!.lastVictory='정화 완료';expect(prepareImport(exportSave(s).text).save).toEqual(s);
 });
 it('recovers a run with malformed optional display fields',()=>{const e=envelope();e.payload.run.lastVictory={bad:true};expect(prepareImport(JSON.stringify(e)).save.run).toBe(null);});
});
