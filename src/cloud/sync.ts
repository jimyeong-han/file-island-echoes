import type {Save} from '../types';
import {CloudError,cleanProfile,signature} from './model';
import type {CloudBackend,CloudRecord,WriteRequest} from './model';
export type SyncStatus='signed-out'|'loading'|'review'|'syncing'|'synced'|'pending'|'conflict'|'error';
export interface SyncHooks {local:()=>Save;replace:(save:Save)=>boolean;changed:()=>void;online:()=>boolean;id:()=>string}

/** One in-flight operation, one account epoch, revision-based CAS. No timestamps decide a winner. */
export class CloudSync {
 userId:string|null=null;remote:CloudRecord|null=null;status:SyncStatus='signed-out';message='';linked=false;
 private epoch=0;private abort:AbortController|null=null;private pending:WriteRequest|null=null;
 private baseline='';private timer:ReturnType<typeof setTimeout>|null=null;private busy=false;private localEpoch=0;
 constructor(private backend:CloudBackend,private hooks:SyncHooks){}
 get working(){return this.busy;}
 get revision(){return this.remote?.revision??0;}
 private notify(){this.hooks.changed();}
 private cancel(){this.epoch++;this.abort?.abort();this.abort=null;this.busy=false;this.pending=null;if(this.timer)clearTimeout(this.timer);this.timer=null;}
 async account(userId:string|null){
  if(userId===this.userId)return;
  this.cancel();this.userId=userId;this.remote=null;this.linked=false;this.baseline='';
  this.status=userId?'loading':'signed-out';this.message='';this.notify();if(userId)await this.refresh();
 }
 pause(message='동기화를 멈췄습니다. 기록을 다시 비교해 주세요.'){
  this.cancel();this.linked=false;this.baseline='';this.localEpoch++;
  this.status=this.userId?'review':'signed-out';this.message=message;this.notify();
 }
 private failure(error:unknown){
  if(error instanceof CloudError&&error.kind!=='network'){this.linked=false;this.pending=null;}
  this.status=!this.hooks.online()&&this.linked?'pending':'error';
  this.message=error instanceof CloudError?error.message:'연결하지 못했습니다. 이 기기의 기록은 안전하게 저장되어 있습니다.';this.notify();
 }
 async refresh(){
  if(!this.userId||this.busy)return;
  this.linked=false;this.pending=null;this.status='loading';this.busy=true;const epoch=this.epoch,uid=this.userId,abort=this.abort=new AbortController();this.notify();
  try{const record=await this.backend.read(uid,abort.signal);if(epoch!==this.epoch)return;this.remote=record;this.status='review';this.message='양쪽 기록을 확인하고 저장 방향을 선택하세요.';}
  catch(error){if(epoch===this.epoch)this.failure(error);}
  finally{if(epoch===this.epoch){this.busy=false;this.notify();}}
 }
 localChanged(){
  this.localEpoch++;
  if(!this.userId||!this.linked)return;
  if(signature(this.hooks.local())===this.baseline&&!this.pending)return;
  if(!this.busy){this.status='pending';this.message=this.hooks.online()?'클라우드 저장 대기 중':'오프라인 · 이 기기에 저장됨';this.notify();}
  if(this.timer)clearTimeout(this.timer);
  this.timer=setTimeout(()=>{this.timer=null;void this.retry();},800);
 }
 /** Explicit upload/download confirmations pass the exact local snapshot and cloud revision shown. */
 async chooseUpload(shownLocal:string,shownRevision:number){
  if(!this.userId||this.busy)return;
  if(shownLocal!==signature(this.hooks.local())||shownRevision!==this.revision){this.message='확인 중 기록이 바뀌었습니다. 다시 비교해 주세요.';this.notify();return;}
  this.linked=true;this.pending=null;this.baseline='';await this.flush();
 }
 async chooseDownload(shownLocal:string,shownRevision:number){
  if(!this.userId||this.busy||!this.remote?.save)return;
  const epoch=this.epoch,uid=this.userId,localEpoch=this.localEpoch;this.busy=true;this.status='loading';const abort=this.abort=new AbortController();this.notify();
  try{
   const latest=await this.backend.read(uid,abort.signal);if(epoch!==this.epoch)return;
   if(latest?.revision!==shownRevision||shownLocal!==signature(this.hooks.local())||localEpoch!==this.localEpoch){this.remote=latest;this.linked=false;this.status='conflict';this.message='확인 중 기록이 바뀌었습니다. 양쪽 내용을 다시 비교해 주세요.';return;}
   if(!latest?.save)throw new CloudError('불러올 클라우드 기록이 없습니다.','invalid');
   if(!this.hooks.replace(structuredClone(latest.save)))throw new CloudError('로컬 저장에 실패했습니다. 현재 기록을 유지합니다.','invalid');
   this.remote=latest;this.baseline=signature(this.hooks.local());this.linked=true;this.pending=null;this.status='synced';this.message='클라우드 기록을 이 기기에 불러왔습니다.';
  }catch(error){if(epoch===this.epoch)this.failure(error);}
  finally{if(epoch===this.epoch){this.busy=false;this.notify();}}
 }
 async deleteCloud(shownRevision:number){
  if(!this.userId||this.busy||shownRevision!==this.revision)return;
  this.linked=false;this.pending={expected:shownRevision,id:this.hooks.id(),save:null};await this.flush(true);
 }
 async retry(){if(!this.userId||this.busy)return;if(this.linked||this.pending)await this.flush();else await this.refresh();}
 private async flush(deleting=false){
  if(!this.userId||this.busy||(!this.linked&&!this.pending))return;
  if(!this.hooks.online()){this.status='pending';this.message=this.pending?.save===null?'오프라인 · 클라우드 삭제 대기 중. 연결 후 재시도하세요.':'오프라인 · 이 기기에 저장됨. 연결되면 재시도합니다.';this.notify();return;}
  try{this.pending??={expected:this.revision,id:this.hooks.id(),save:cleanProfile(this.hooks.local())};}catch(e){this.failure(e);return;}
  const request=this.pending,uid=this.userId,epoch=this.epoch;deleting=request.save===null;
  this.busy=true;this.status='syncing';this.message=deleting?'클라우드 기록 삭제 중':'클라우드에 저장 중';const abort=this.abort=new AbortController();this.notify();
  try{
   const result=await this.backend.write(uid,request,abort.signal);if(epoch!==this.epoch)return;
   this.remote=result.record;this.pending=null;
   if(result.kind==='conflict'){this.linked=false;this.status='conflict';this.message='다른 기기에서 기록이 바뀌었습니다. 자동으로 덮어쓰지 않았습니다.';return;}
   if(deleting){this.linked=false;this.baseline='';this.status='review';this.message='클라우드 진행 기록을 삭제했습니다. 이 기기 기록과 로그인은 유지됩니다.';return;}
   this.baseline=signature(request.save!);this.status='synced';this.message='클라우드 저장 완료';
  }catch(error){if(epoch===this.epoch)this.failure(error);}
  finally{if(epoch===this.epoch){this.busy=false;this.notify();}}
  if(epoch===this.epoch&&this.linked&&this.status==='synced'&&signature(this.hooks.local())!==this.baseline)this.localChanged();
 }
 dispose(){this.cancel();}
}
