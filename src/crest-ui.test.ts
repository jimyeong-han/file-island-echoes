import {describe,it,expect} from 'vitest';
import {crestHUD,crestProgress,resourceChip,CREST_RESOURCES} from './crest-ui';
import {newRun,enterNode,crestReady} from './engine';
import {CHARACTERS} from './data';
import {freshSave,exportSave,prepareImport} from './save-files';
import type {CharacterId} from './types';
import main from './main.ts?raw';

const battle=(id:CharacterId)=>{const r=newRun(123,id);r.screen='map';enterNode(r,'0a');return r;};
describe('v0.8.2 compact crest presentation',()=>{
 for(const id of Object.keys(CHARACTERS) as CharacterId[])it(id+' uses the actual readiness and preserves combat state',()=>{
  for(const rich of [false,true])for(const sealed of [0,2])for(const used of [false,true]){
   const r=battle(id),b=r.battle!,s=b.ability;
   Object.assign(s,{attacks:rich?2:0,supports:rich?1:0,combo:rich?2:0,growth:rich?2:0,stock:rich?2:0,hope:rich?2:0,light:rich?2:0,sealed,crestUsed:used});b.turn=rich?2:1;b.block=rich?8:0;
   const before=structuredClone(r),text=crestProgress(r),html=crestHUD(r);
   expect(text==='사용 가능').toBe(crestReady(r));
   expect(html.includes('disabled')).toBe(!crestReady(r));
   expect(html).toContain('aria-describedby="crest-progress"');
   expect(html).toContain(`aria-label="${CHARACTERS[id].ability.name} 사용"`);
   expect(html).not.toContain(CHARACTERS[id].name+' ·');
   if(sealed&&!used)expect(text).toBe('봉인 2턴');
   if(used)expect(text).toBe('사용 완료');
   expect(r).toEqual(before);
  }
 });
 it('reports the remaining Matt/Koushiro prerequisites, including empty piles',()=>{
  const m=battle('matt');m.battle!.ability.combo=2;m.battle!.hand=[];expect(crestProgress(m)).toBe('손패 필요');
  const k=battle('koushiro');expect(crestProgress(k)).toBe('2턴부터');k.battle!.turn=2;expect(crestProgress(k)).toBe('지원 0/1');k.battle!.ability.supports=1;k.battle!.draw=[];expect(crestProgress(k)).toBe('뽑기 카드 필요');
 });
 it('respects alternate Sora/Mimi/Kari trigger conditions',()=>{
  const s=battle('sora');s.hp=Math.floor(s.maxHp*.7);expect(crestProgress(s)).toBe('사용 가능');
  const m=battle('mimi');m.corruption=1;expect(crestProgress(m)).toBe('사용 가능');
  const k=battle('kari');k.corruption=2;expect(crestProgress(k)).toBe('사용 가능');
 });
 it('shows zero-valued personal resources once, with engine caps, and omits non-resource partners',()=>{
  expect(Object.values(CREST_RESOURCES).map(r=>r.max)).toEqual([4,6,3,3,6]);
  for(const id of Object.keys(CHARACTERS) as CharacterId[]){const r=battle(id),spec=CREST_RESOURCES[id],chip=resourceChip(r);if(spec)expect(chip).toContain(`0/${spec.max}`);else expect(chip).toBe('');expect(chip).not.toMatch(/再生|재생|반격|중첩 없음/);}
 });
 it.each([true,false])('imports old guide=%s without changing the checkpoint',guide=>{
  const s=freshSave();s.run=battle('tai');s.settings.guide=guide;
  const envelope=JSON.parse(exportSave(s).text);envelope.appVersion='0.8.1';
  expect(prepareImport(JSON.stringify(envelope)).save).toEqual(s);
 });
 it('retires the banner and guide action',()=>{
  expect(main).not.toMatch(/guide-banner|settings\.guide|data-action="guide"|첫 턴 안내|중첩 없음/);

 });
});
