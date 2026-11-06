import {createClient} from '@supabase/supabase-js';
import type {CloudConfig} from './config';
import {CloudError,decodeRecord} from './model';
import type {CloudBackend,WriteRequest} from './model';
import {APP_VERSION} from '../save-files';

export function connectSupabase(config:CloudConfig){
 const client=createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'fie-auth-'+new URL(config.url).hostname},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}});
 async function request(userId:string,path:string,signal:AbortSignal,body?:object){
  const {data,error}=await client.auth.getSession();
  if(error||!data.session||data.session.user.id!==userId)throw new CloudError('로그인이 만료되었거나 계정이 바뀌었습니다. 다시 로그인해 주세요.','auth');
  if(signal.aborted)throw new DOMException('Aborted','AbortError');
  // Capture this account's bearer before the request. A later account switch cannot change its owner.
  const token=data.session.access_token;
  const response=await fetch(config.url+'/rest/v1/'+path,{method:body?'POST':'GET',cache:'no-store',signal:AbortSignal.any([signal,AbortSignal.timeout(12000)]),headers:{apikey:config.key,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  if(response.status===401||response.status===403)throw new CloudError('계정 권한을 확인하지 못했습니다. 다시 로그인한 뒤 재시도하세요.','auth');
  if(!response.ok)throw new CloudError(response.status===404?'클라우드 저장 설정이 아직 준비되지 않았습니다. 로컬 플레이는 계속할 수 있습니다.':'클라우드 저장에 실패했습니다. 로컬 기록을 유지하며 재시도할 수 있습니다.');
  return response.json();
 }
 const backend:CloudBackend={
  async read(userId,signal){const rows=await request(userId,'fie_profiles?select=*&user_id=eq.'+encodeURIComponent(userId),signal);if(!Array.isArray(rows)||rows.length>1)throw new CloudError('클라우드 응답을 확인하지 못했습니다.','invalid');return rows.length?decodeRecord(rows[0],userId):null;},
  async write(userId,r:WriteRequest,signal){const value=await request(userId,'rpc/fie_write_profile',signal,{p_expected:r.expected,p_request:r.id,p_payload:r.save,p_app_version:APP_VERSION});if(!['saved','conflict'].includes(value?.kind))throw new CloudError('클라우드 저장 응답을 확인하지 못했습니다.','invalid');return {kind:value.kind,record:decodeRecord(value.record,userId)};}
 };
 return {client,backend};
}
