import type {Save} from '../types';
import {APP_VERSION,prepareImport} from '../save-files';

export interface CloudRecord {userId:string;revision:number;save:Save|null;updatedAt:string;requestId:string}
export interface WriteRequest {expected:number;id:string;save:Save|null}
export interface CloudBackend {
 read(userId:string,signal:AbortSignal):Promise<CloudRecord|null>;
 write(userId:string,request:WriteRequest,signal:AbortSignal):Promise<{kind:'saved'|'conflict';record:CloudRecord}>;
}
export class CloudError extends Error {constructor(message:string,public kind:'network'|'auth'|'invalid'='network'){super(message);}}
// JSONB reorders keys; compare values, not serialization order (or undefined optional fields).
export const signature=(save:Save)=>JSON.stringify(save,(_key,value)=>value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(k=>[k,value[k]])):value);
export function decodeRecord(value:unknown,userId:string):CloudRecord {
 const r=value as Record<string,unknown>;
 if(!r||r.user_id!==userId||!Number.isSafeInteger(r.revision)||(r.revision as number)<1||typeof r.updated_at!=='string'||!Number.isFinite(Date.parse(r.updated_at))||typeof r.last_request!=='string')throw new CloudError('클라우드 응답을 확인할 수 없습니다. 로컬 기록은 유지됩니다.','invalid');
 let save:Save|null=null;
 if(r.payload!==null){
  try{const preview=prepareImport(JSON.stringify({app:'file-island-echoes',formatVersion:2,appVersion:r.app_version,exportedAt:r.updated_at,payload:r.payload}));
   if(preview.warnings.length)throw Error();save=preview.save;
  }catch{throw new CloudError('클라우드 기록의 형식이 현재 게임과 맞지 않습니다. 자동으로 덮어쓰지 않습니다.','invalid');}
 }
 return {userId,revision:r.revision as number,save,updatedAt:r.updated_at,requestId:r.last_request};
}
export function cleanProfile(save:Save):Save {
 const preview=prepareImport(JSON.stringify({app:'file-island-echoes',formatVersion:2,appVersion:APP_VERSION,exportedAt:new Date().toISOString(),payload:save}));
 if(preview.warnings.length||signature(preview.save)!==signature(save))throw new CloudError('이 기기의 기록을 먼저 JSON으로 백업하고 확인해 주세요.','invalid');
 return preview.save;
}
