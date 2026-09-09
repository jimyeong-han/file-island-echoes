import { CARDS, ENEMIES, MAP, STORIES, zoneAt } from './data';
import type { Archive, Run, Save, Settings } from './types';
export const SAVE_KEY='file-island-echoes:v1';
export const defaultSettings=():Settings=>({muted:true,reducedMotion:typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches,guide:true});
export const emptyArchive=():Archive=>({forms:['agumon'],enemies:[],events:[],zones:[],runs:0,wins:0,best:0});
const obj=(x:unknown):x is Record<string,any>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const num=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
const list=(x:unknown,test:(s:any)=>boolean):x is any[]=>Array.isArray(x)&&x.length<1000&&x.every(test);
const form=(x:any)=>['agumon','greymon','metal','skull'].includes(x);
const cards=(x:any)=>list(x,c=>typeof c==='string'&&Object.hasOwn(CARDS,c));
export function validRun(x:unknown):x is Run {
 if(!obj(x)||!['map','battle','event','rest','reward','evolution','result'].includes(x.screen)||!form(x.form))return false;
 if(x.evolvedFrom!==undefined&&!form(x.evolvedFrom))return false;
 if(x.lastEvent!==undefined&&(typeof x.lastEvent!=='string'||!Object.hasOwn(STORIES,x.lastEvent)))return false;
 if(!['seed','row','hp','maxHp','evoEnergy','bond','burden','corruption','supplies','battles','started'].every(k=>num(x[k])))return false;
 if(!Number.isInteger(x.row)||x.row>10||x.maxHp<1||x.hp>x.maxHp||typeof x.won!=='boolean'||!cards(x.deck)||!x.deck.length||!cards(x.rewards))return false;
 if(!list(x.path,id=>typeof id==='string'&&MAP.flat().some(n=>n.id===id)))return false;
 if(x.node!==null&&!MAP[x.row]?.some(n=>n.id===x.node))return false;
 const n=MAP[x.row]?.find(n=>n.id===x.node);
 if((x.screen==='event'&&!n?.event)||(x.screen==='rest'&&n?.type!=='rest')||(['battle','reward'].includes(x.screen)&&!n?.enemies))return false;
 if(x.screen==='reward'&&x.rewards.length!==3)return false;
 if(x.battle!==null){const b=x.battle;if(!obj(b)||!cards(b.hand)||!cards(b.draw)||!cards(b.discard)||!list(b.log,s=>typeof s==='string')||!['energy','block','turn','target'].every(k=>num(b[k])))return false;
 if(!list(b.enemies,e=>obj(e)&&Object.hasOwn(ENEMIES,e.id)&&['hp','maxHp','block','weak','step'].every(k=>num(e[k]))&&e.hp<=e.maxHp&&Number.isInteger(e.step))||b.enemies.length<1||b.enemies.length>2||!Number.isInteger(b.target)||b.target>=b.enemies.length)return false;
 }else if(x.screen==='battle'||x.screen==='reward')return false;
 if(x.screen==='battle'&&(x.hp<=0||!x.battle.enemies.some((e:any)=>e.hp>0)))return false;
 return true;
}
export function loadSave(storage?:Pick<Storage,'getItem'>):{save:Save;warning:string} {
 const save:Save={version:1,run:null,archive:emptyArchive(),settings:defaultSettings()};
 try {const raw=(storage??localStorage).getItem(SAVE_KEY);if(!raw)return {save,warning:''};const data:unknown=JSON.parse(raw);if(!obj(data)||data.version!==1)throw Error();
 let warning='';if(obj(data.settings))for(const k of ['muted','reducedMotion','guide'] as const)if(typeof data.settings[k]==='boolean')save.settings[k]=data.settings[k];
 const a=data.archive;if(obj(a)&&list(a.forms,form)&&list(a.enemies,x=>Object.hasOwn(ENEMIES,x))&&list(a.events,x=>Object.hasOwn(STORIES,x))&&list(a.zones,x=>[0,1,2].includes(x))&&['runs','wins','best'].every(k=>num(a[k])))save.archive=a as Archive;else warning='일부 도감 기록을 복구하지 못했습니다.';
 if(data.run!==null){if(validRun(data.run))save.run=data.run;else warning='탐험 저장을 읽지 못했습니다. 새 탐험은 정상적으로 시작할 수 있습니다.';}
 return {save,warning};
 }catch{return {save,warning:'저장 데이터를 읽지 못했습니다. 새 탐험을 시작할 수 있습니다.'};}
}
export function updateArchive(save:Save,previous:Run|null) {const r=save.run;if(!r)return;const a=save.archive;const add=<T>(xs:T[],v:T)=>{if(!xs.includes(v))xs.push(v);};add(a.forms,r.form);add(a.zones,zoneAt(r.row));r.battle?.enemies.forEach(e=>add(a.enemies,e.id));if(r.lastEvent)add(a.events,r.lastEvent);a.best=Math.max(a.best,r.row+1);if(r.screen==='result'&&previous?.screen!=='result'){a.runs++;if(r.won)a.wins++;}}
export function writeSave(save:Save,storage?:Pick<Storage,'setItem'>) {try{(storage??localStorage).setItem(SAVE_KEY,JSON.stringify(save));return true;}catch{return false;}}
