import { CARDS, ENEMIES, FORMS, CHARACTERS, CHAPTERS, STORIES, chapterOf, zoneAt } from './data';
import {freshAbility} from './engine';
import type { Archive, Run, Save, Settings, CharacterId, ChapterId } from './types';
export const SAVE_KEY='file-island-echoes:v2';
export const LEGACY_KEY='file-island-echoes:v1';
export const defaultSettings=():Settings=>({muted:true,reducedMotion:typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches,guide:true});
export const emptyArchive=():Archive=>({forms:[],enemies:[],events:[],zones:[],runs:0,wins:0,best:0,clears:{},endings:[]});
const obj=(x:unknown):x is Record<string,any>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const num=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1e15;
const list=(x:unknown,test:(s:any)=>boolean):x is any[]=>Array.isArray(x)&&x.length<1000&&x.every(test);
const known=(table:object,x:any)=>typeof x==='string'&&Object.hasOwn(table,x);
const cards=(x:any)=>list(x,c=>known(CARDS,c));
export function validRun(x:unknown):x is Run {
 if(!obj(x)||!known(CHARACTERS,x.characterId)||!known(CHAPTERS,x.chapterId)||!known(FORMS,x.form)||FORMS[x.form].owner!==x.characterId||!['intro','map','battle','event','rest','reward','evolution','result'].includes(x.screen))return false;
 if(x.evolvedFrom!==undefined&&(!known(FORMS,x.evolvedFrom)||FORMS[x.evolvedFrom].owner!==x.characterId))return false;
 if(x.lastEvent!==undefined&&!known(STORIES,x.lastEvent))return false;if(x.legacyEvent!==undefined&&!known(STORIES,x.legacyEvent))return false;
 if(!['seed','row','hp','maxHp','evoEnergy','bond','burden','corruption','supplies','battles','started'].every(k=>num(x[k])))return false;
 if(!Number.isInteger(x.row)||x.row>10||x.maxHp<1||x.hp>x.maxHp||typeof x.won!=='boolean'||!cards(x.deck)||!x.deck.length||!cards(x.rewards)||!list(x.storyFlags,s=>typeof s==='string')||!['active','victory','defeat','retreat'].includes(x.outcome))return false;
 const map=CHAPTERS[x.chapterId as ChapterId].map;if(!list(x.path,id=>typeof id==='string'&&/^\d+[ab]$/.test(id)))return false;
 if(x.node!==null&&(!map[x.row]?.some(n=>n.id===x.node)&&!x.legacyEvent))return false;
 const n=map[x.row]?.find(n=>n.id===x.node);
 if((x.screen==='event'&&!n?.event&&!x.legacyEvent)||(x.screen==='rest'&&n?.type!=='rest')||(['battle','reward'].includes(x.screen)&&!n?.enemies&&!n?.pool))return false;
 if(x.screen==='reward'&&x.rewards.length!==3)return false;
 if(x.battle!==null){const b=x.battle;if(!obj(b)||!cards(b.hand)||!cards(b.draw)||!cards(b.discard)||!cards(b.exhausted)||!list(b.log,s=>typeof s==='string')||!['energy','block','turn','target'].every(k=>num(b[k])))return false;
 if(!list(b.enemies,e=>obj(e)&&known(ENEMIES,e.id)&&['hp','maxHp','block','weak','step','burn','root','shock','exposed','mark','power'].every(k=>num(e[k]))&&e.hp<=e.maxHp&&Number.isInteger(e.step))||b.enemies.length<1||b.enemies.length>2||!Number.isInteger(b.target)||b.target>=b.enemies.length)return false;
 const s=b.ability,defaults=freshAbility();if(!obj(s)||!cards(s.retained))return false;for(const [k,v] of Object.entries(defaults)){if(typeof v==='number'&&!num(s[k]))return false;if(typeof v==='boolean'&&typeof s[k]!=='boolean')return false;}if(s.lastKind!==null&&!['attack','guard','support'].includes(s.lastKind))return false;
 }else if(x.screen==='battle'||x.screen==='reward')return false;
 if(x.screen==='battle'&&(x.hp<=0||!x.battle.enemies.some((e:any)=>e.hp>0)))return false;return true;
}
function migrateRun(old:Record<string,any>){const x=structuredClone(old);x.characterId='tai';x.chapterId='file';x.storyFlags=[];x.outcome=x.screen==='result'?(x.won?'victory':'defeat'):'active';const oldEvents:Record<string,string>={'1a':'koushiro','1b':'joe','3b':'mimi','5a':'matt','5b':'gear','6a':'tk','6b':'terminal','9a':'kari','9b':'echo'};if(x.screen==='event')x.legacyEvent=oldEvents[x.node];if(x.node&&x.node.endsWith('b')&&['1','5','6','9'].includes(x.node.slice(0,-1)))x.node=x.node.slice(0,-1)+'a';if(x.battle&&obj(x.battle)){x.battle.exhausted=[];x.battle.ability=freshAbility();if(Array.isArray(x.battle.enemies))x.battle.enemies=x.battle.enemies.map((e:any)=>({...e,burn:0,root:0,shock:0,exposed:0,mark:0,power:0}));}return x;}
export function loadSave(storage?:Pick<Storage,'getItem'>):{save:Save;warning:string}{const save:Save={version:2,run:null,archive:emptyArchive(),settings:defaultSettings()};try{const io=storage??localStorage,raw=io.getItem(SAVE_KEY)||io.getItem(LEGACY_KEY);if(!raw)return {save,warning:''};const data:unknown=JSON.parse(raw);if(!obj(data)||![1,2].includes(data.version))throw Error();let warning='';if(obj(data.settings))for(const k of ['muted','reducedMotion','guide'] as const)if(typeof data.settings[k]==='boolean')save.settings[k]=data.settings[k];
 const a=data.archive;if(obj(a)){for(const k of ['runs','wins','best'] as const)if(num(a[k]))save.archive[k]=a[k];if(Array.isArray(a.forms))save.archive.forms=a.forms.filter((v:any)=>known(FORMS,v));if(Array.isArray(a.enemies))save.archive.enemies=a.enemies.filter((v:any)=>known(ENEMIES,v));if(Array.isArray(a.events))save.archive.events=a.events.filter((v:any)=>known(STORIES,v));if(Array.isArray(a.zones))save.archive.zones=a.zones.filter((v:any)=>Number.isInteger(v)&&v>=0&&v<=8);if(obj(a.clears))for(const id of Object.keys(CHARACTERS) as CharacterId[])if(Array.isArray(a.clears[id]))save.archive.clears[id]=a.clears[id].filter((v:any)=>known(CHAPTERS,v));if(Array.isArray(a.endings))save.archive.endings=a.endings.filter((v:any)=>typeof v==='string'&&/^(tai|matt|sora|koushiro|mimi|joe|tk|kari):(file|server|city)$/.test(v));if(data.version===1&&save.archive.wins){save.archive.clears.tai=['file'];save.archive.endings=['tai:file'];}}
 if(data.run!==null){const run=data.version===1&&obj(data.run)?migrateRun(data.run):data.run;if(validRun(run))save.run=run;else warning='탐험 저장을 복구하지 못했습니다. 도감과 설정은 유지하며 새 탐험을 시작할 수 있습니다.';}if(data.version===1&&!warning)warning='이전 저장을 신태일의 탐험으로 옮겼습니다. 새 전투 규칙이 적용됩니다.';return {save,warning};}catch{return {save,warning:'저장 데이터를 읽지 못했습니다. 새 탐험은 정상적으로 시작할 수 있습니다.'};}}
export function updateArchive(save:Save,previous:Run|null){const r=save.run;if(!r)return;const a=save.archive,add=<T>(xs:T[],v:T)=>{if(!xs.includes(v))xs.push(v);};add(a.forms,r.form);add(a.zones,Object.keys(CHAPTERS).indexOf(r.chapterId)*3+zoneAt(r.row));r.battle?.enemies.forEach(e=>add(a.enemies,e.id));if(r.lastEvent)add(a.events,r.lastEvent);a.best=Math.max(a.best,r.row+1);if(r.screen==='result'&&previous?.screen!=='result'){a.runs++;if(r.won){a.wins++;const clears=a.clears[r.characterId]??=[];add(clears,r.chapterId);add(a.endings,r.characterId+':'+r.chapterId);}}}
export function writeSave(save:Save,storage?:Pick<Storage,'setItem'>){try{(storage??localStorage).setItem(SAVE_KEY,JSON.stringify(save));return true;}catch{return false;}}
export function chapterUnlocked(save:Save,id:CharacterId,ch:ChapterId){const prev=CHAPTERS[ch].previous;return !prev||!!save.archive.clears[id]?.includes(prev);}
