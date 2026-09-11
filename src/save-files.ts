import { defaultSettings, emptyArchive, loadSave, SAVE_KEY, LEGACY_KEY, validRun } from './storage';
import { freshAbility } from './engine';
import type { Run, Save } from './types';

export const APP_VERSION='0.8.1';
export const MAX_SAVE_BYTES=1024*1024;
const APP='file-island-echoes';
type Dict=Record<string,unknown>;
const object=(x:unknown):x is Dict=>!!x&&typeof x==='object'&&!Array.isArray(x);
function fail(message:string):never{throw new Error(message);}
const integer=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0&&v<=1e15;
export interface SavePreview {save:Save;appVersion:string;exportedAt:string;warnings:string[]}
export const freshSave=():Save=>({version:2,run:null,archive:emptyArchive(),settings:defaultSettings()});

/** Bound the entire input before migration, including unknown fields. */
function inspectTree(value:unknown,depth=0,budget={nodes:0}){
 if(depth>16||++budget.nodes>20000)fail('저장 파일의 구조가 너무 복잡합니다.');
 if(typeof value==='string'&&value.length>2048)fail('저장 파일의 문장이 허용 길이를 초과합니다.');
 if(typeof value==='number'&&(!Number.isFinite(value)||Math.abs(value)>1e15))fail('허용 범위를 벗어난 숫자가 있습니다.');
 if(Array.isArray(value)){if(value.length>=1000)fail('저장 파일의 목록이 너무 깁니다.');value.forEach(v=>inspectTree(v,depth+1,budget));}
 else if(object(value))for(const [key,v] of Object.entries(value)){
  if(['__proto__','constructor','prototype'].includes(key)||key.length>64)fail('안전하지 않은 필드가 포함된 파일입니다.');
  inspectTree(v,depth+1,budget);
 }
}
const pick=(value:Dict,keys:string[])=>Object.fromEntries(keys.filter(k=>Object.hasOwn(value,k)).map(k=>[k,value[k]]));
function cleanRun(r:Run):Run {
 const result=pick(r as unknown as Dict,['seed','screen','characterId','chapterId','row','path','node','hp','maxHp','form','evoEnergy','bond','burden','corruption','supplies','deck','battle','rewards','won','battles','started','storyFlags','evolvedFrom','legacyEvent','lastEvent','lastVictory','outcome']) as unknown as Run;
 if(r.battle){
  result.battle=pick(r.battle as unknown as Dict,['enemies','hand','draw','discard','exhausted','energy','block','turn','target','log','ability']) as unknown as Run['battle'];
  result.battle!.ability=pick(r.battle.ability as unknown as Dict,Object.keys(freshAbility())) as unknown as NonNullable<Run['battle']>['ability'];
  result.battle!.enemies=r.battle.enemies.map(e=>pick(e as unknown as Dict,['id','hp','maxHp','block','weak','step','burn','root','shock','exposed','mark','power']) as unknown as typeof e);
 }
 return result;
}
function checkPayload(p:unknown):asserts p is Dict {
 if(!object(p)||![1,2].includes(p.version as number)||!Object.hasOwn(p,'run')||!object(p.archive)||!object(p.settings))fail('저장 본문이 손상되었거나 지원하지 않는 저장 버전입니다.');
 const a=p.archive as Dict,s=p.settings as Dict;
 if(!['forms','enemies','events','zones'].every(k=>Array.isArray(a[k]))||!['runs','wins','best'].every(k=>integer(a[k])))fail('도감 기록의 형식이 올바르지 않습니다.');
 if(a.clears!==undefined&&(!object(a.clears)||!Object.values(a.clears).every(Array.isArray)))fail('챕터 기록의 형식이 올바르지 않습니다.');
 if(a.endings!==undefined&&!Array.isArray(a.endings))fail('엔딩 기록의 형식이 올바르지 않습니다.');
 for(const k of ['muted','reducedMotion','guide'])if(s[k]!==undefined&&typeof s[k]!=='boolean')fail('설정 값의 형식이 올바르지 않습니다.');
 for(const k of ['masterVolume','musicVolume','sfxVolume'])if(s[k]!==undefined&&(typeof s[k]!=='number'||s[k]<0||s[k]>1))fail('음량은 0~1 사이의 값이어야 합니다.');
}

export function prepareImport(text:string,byteLength=new TextEncoder().encode(text).length):SavePreview {
 if(byteLength>MAX_SAVE_BYTES||new TextEncoder().encode(text).length>MAX_SAVE_BYTES)fail('저장 파일은 1MB 이하만 불러올 수 있습니다.');
 let data:unknown;try{data=JSON.parse(text);}catch{fail('JSON 형식이 올바르지 않습니다.');}
 inspectTree(data);
 if(!object(data))fail('게임 저장 파일이 아닙니다.');
 let payload:unknown,appVersion='구버전 · 버전 정보 없음',exportedAt='날짜 정보 없음';const warnings:string[]=[];
 if(Object.hasOwn(data,'app')){
  if(data.app!==APP)fail('다른 앱의 저장 파일입니다.');
  if(data.formatVersion!==1)fail('지원하지 않는 파일 형식 버전입니다.');
  if(typeof data.appVersion!=='string'||!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(data.appVersion)||data.appVersion.length>48)fail('앱 버전 정보가 올바르지 않습니다.');
  if(typeof data.exportedAt!=='string'||data.exportedAt.length>40||!Number.isFinite(Date.parse(data.exportedAt)))fail('내보낸 날짜가 올바르지 않습니다.');
  payload=data.payload;appVersion=data.appVersion;exportedAt=data.exportedAt;
 }else{
  if(![1,2].includes(data.version as number))fail('게임 저장 파일이 아닙니다.');
  payload=data;warnings.push('이전 원본 저장 형식입니다. 앱 버전과 내보낸 날짜는 확인할 수 없습니다.');
 }
 checkPayload(payload);
 const normalized=loadSave({getItem:key=>key===SAVE_KEY?JSON.stringify(payload):null});
 if(normalized.warning)warnings.push(normalized.warning);
 const save=normalized.save;
 if(save.run){
  // Optional copy and legacy node fields also need a type check before rendering.
  if((save.run.lastVictory!==undefined&&typeof save.run.lastVictory!=='string')||
    (save.run.node!==null&&typeof save.run.node!=='string')){
   save.run=null;warnings.push('손상된 탐험만 제외했습니다. 도감과 설정을 복원할 수 있습니다.');
  }else{save.run=cleanRun(save.run);if(!validRun(save.run))fail('탐험 저장을 변환하지 못했습니다.');}
 }
 const originalArchive=payload.archive as Dict;
 if(['forms','enemies','events','zones','endings'].some(k=>Array.isArray(originalArchive[k])&&(originalArchive[k] as unknown[]).length!==(save.archive[k as 'forms']?.length??0)))warnings.push('현재 게임에서 인식할 수 없는 일부 도감 항목을 제외했습니다.');
 return {save,appVersion,exportedAt,warnings};
}

export function exportSave(save:Save,now=new Date()){
 const pad=(n:number)=>String(n).padStart(2,'0');
 const filename=`${APP}-save-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.json`;
 return {filename,text:JSON.stringify({app:APP,formatVersion:1,appVersion:APP_VERSION,exportedAt:now.toISOString(),payload:save},null,2)+'\n'};
}
/** Browser storage's single setItem is atomic. Never mutate the active Save here. */
export function replaceSave(preview:SavePreview,storage?:Pick<Storage,'setItem'>):boolean{
 try{(storage??localStorage).setItem(SAVE_KEY,JSON.stringify(preview.save));return true;}catch{return false;}
}
export function resetSave(storage?:Pick<Storage,'getItem'|'setItem'|'removeItem'>):boolean{
 let previous:[string,string|null][]=[];
 try{
  storage??=localStorage;
  const io=storage;
  previous=[SAVE_KEY,LEGACY_KEY].map(k=>[k,io.getItem(k)]);
  // Remove legacy first so a failed primary deletion cannot resurrect it.
  storage.removeItem(LEGACY_KEY);storage.removeItem(SAVE_KEY);return true;
 }catch{
  // Best-effort rollback if a browser/storage adapter fails between removals.
  for(const [k,v] of previous)try{if(v!==null)storage?.setItem(k,v);}catch{/* Caller reports failure; active in-memory state stays unchanged. */}
  return false;
 }
}
