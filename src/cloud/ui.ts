import type {Save} from '../types';
import {CHARACTERS,CHAPTERS,FORMS} from '../data';
import {cloudConfig,accountEmail,accountName} from './config';
import {CloudSync} from './sync';
import {signature} from './model';
import type {connectSupabase} from './supabase';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const button=(text:string,action:string,disabled=false,kind='secondary')=>`<button class="${kind} wide" data-action="cloud-${action}" ${disabled?'disabled':''}>${text}</button>`;
const time=(s:number|string)=>new Date(s).toLocaleString('ko-KR');
export function profileSummary(save:Save|null,title:string,updated?:string){return `<section class="cloud-profile"><h3>${title}</h3>${updated?`<p class="muted">서버 저장 시각 ${esc(time(updated))}</p>`:''}${!save?'<p>저장된 클라우드 진행 기록이 없습니다.</p>':`<p>슬롯 ${Object.keys(save.runs).length}/8 · 클리어 ${save.archive.wins}회 · 엔딩 ${save.archive.endings.length}개<br/>도감: 진화 ${save.archive.forms.length} · 적 ${save.archive.enemies.length} · 이야기 ${save.archive.events.length}</p><ul>${Object.values(CHARACTERS).map(c=>{const s=save.runs[c.id];return `<li><b>${c.name}</b><span>${s?`${CHAPTERS[s.run.chapterId].name} · ${s.run.row+1}번째 장소<br/>${FORMS[s.run.form].name} · ${s.run.screen==='battle'?'전투 중':s.run.screen==='result'?'결과 확인':'탐험 중'}<small>${esc(time(s.updatedAt))}</small>`:'진행 없음'}</span></li>`;}).join('')}</ul><p>소리 ${save.settings.muted?'꺼짐':'켜짐'} · 움직임 줄이기 ${save.settings.reducedMotion?'켜짐':'꺼짐'}</p>`}</section>`;}
export interface AccountHooks {root:HTMLElement;local:()=>Save;replace:(save:Save)=>boolean;changed:()=>void}
export class AccountUI {
 readonly config=cloudConfig();sync:CloudSync|null=null;private connection:ReturnType<typeof connectSupabase>|null=null;
 private loading=false;private authBusy=false;private authMessage='';private name='';private signup=false;private loginId='';
 private confirmation:{action:'upload'|'download'|'delete'|'logout';local:string;revision:number}|null=null;
 constructor(private hooks:AccountHooks){
  hooks.root.addEventListener('submit',e=>{if((e.target as HTMLElement).getAttribute('id')==='cloud-login'){e.preventDefault();void this.authenticate(e.target as HTMLFormElement);}});
  hooks.root.addEventListener('input',e=>{const el=e.target as HTMLInputElement;if(el.id==='cloud-id')this.loginId=el.value;});
  window.addEventListener('online',()=>{if(this.sync?.linked)void this.sync.retry();});
  // Retry transient failures while the page is open. Never run in a service worker or after logout.
  setInterval(()=>{if(!document.hidden&&this.sync?.linked&&['pending','error'].includes(this.sync.status))void this.sync.retry();},30000);
 }
 async init(){
  if(!this.config||this.loading||this.connection)return;
  this.loading=true;this.hooks.changed();
  try{const {connectSupabase}=await import('./supabase');this.connection=connectSupabase(this.config);
   this.sync=new CloudSync(this.connection.backend,{local:this.hooks.local,replace:this.hooks.replace,changed:()=>this.hooks.changed(),online:()=>navigator.onLine,id:()=>crypto.randomUUID()});
   this.connection.client.auth.onAuthStateChange((_event,session)=>{queueMicrotask(()=>{this.name=accountName(session?.user.email);if(session?.user.id!==this.sync?.userId)this.confirmation=null;void this.sync?.account(session?.user.id??null);});});
  }catch{this.authMessage='계정 연결을 준비하지 못했습니다. 온라인에서 다시 열어 주세요.';}
  finally{this.loading=false;this.hooks.changed();}
 }
 localChanged(){this.confirmation=null;this.sync?.localChanged();}
 pause(message:string){this.confirmation=null;this.sync?.pause(message);}
 private async authenticate(form:HTMLFormElement){
  if(!this.connection||this.authBusy||!form.reportValidity())return;
  const data=new FormData(form),password=String(data.get('password')??'');let email:string;
  try{email=accountEmail(String(data.get('id')??''));if(new TextEncoder().encode(password).length>72)throw Error('비밀번호는 UTF-8 기준 72바이트 이내로 입력하세요.');if(this.signup&&password!==data.get('password-confirm'))throw Error('비밀번호 확인이 일치하지 않습니다.');}catch(e){this.authMessage=(e as Error).message;this.hooks.changed();return;}
  this.authBusy=true;this.authMessage='';this.confirmation=null;this.hooks.changed();
  try{const response=this.signup?await this.connection.client.auth.signUp({email,password}):await this.connection.client.auth.signInWithPassword({email,password});
   if(response.error){const code=response.error.code;this.authMessage=code==='user_already_exists'?'이미 사용 중인 아이디입니다.':code==='signup_disabled'?'새 아이디 가입이 닫혀 있습니다. 운영자에게 문의해 주세요.':code==='weak_password'?'더 긴 비밀번호를 사용해 주세요.':code==='over_request_rate_limit'?'요청이 많습니다. 잠시 뒤 다시 시도하세요.':'가입 또는 로그인에 실패했습니다. 아이디·비밀번호와 연결을 확인하세요.';}
   else if(!response.data.session)this.authMessage='운영자의 가입 설정 확인이 필요합니다. 이메일 인증 없이 가입하도록 설정되기 전에는 사용할 수 없습니다.';
   else {this.loginId='';this.authMessage='';}
  }catch{this.authMessage='서버에 연결하지 못했습니다. 잠시 뒤 다시 시도하세요.';}
  finally{this.authBusy=false;this.hooks.changed();}
 }
 panel(){
  if(!this.config)return '<h2>계정 · 클라우드 저장</h2><p>계정 저장을 준비 중입니다. 지금은 로그인 없이 탐험과 JSON 백업을 사용할 수 있습니다.</p>';
  if(this.loading)return '<h2>계정 · 클라우드 저장</h2><p role="status">계정 연결을 준비하고 있습니다.</p>';
  const s=this.sync;
  if(!s?.userId)return `<h2>${this.signup?'아이디 만들기':'계정 로그인'}</h2><section class="cloud-account"><p>로그인 없이도 플레이할 수 있습니다. 계정을 연결하면 8명의 탐험과 공용 기록을 다른 기기에서 이어갈 수 있습니다.</p><form id="cloud-login" method="dialog"><label for="cloud-id">아이디</label><input id="cloud-id" name="id" autocomplete="username" autocapitalize="none" spellcheck="false" minlength="3" maxlength="24" pattern="[a-zA-Z0-9][a-zA-Z0-9_]{2,23}" required value="${esc(this.loginId)}" aria-describedby="cloud-id-note"/><p id="cloud-id-note" class="muted">영문·숫자·밑줄 3~24자. 대소문자를 구분하지 않습니다.</p><label for="cloud-password">비밀번호</label><input id="cloud-password" name="password" type="password" autocomplete="${this.signup?'new-password':'current-password'}" minlength="8" maxlength="72" required/>${this.signup?'<label for="cloud-password-confirm">비밀번호 확인</label><input id="cloud-password-confirm" name="password-confirm" type="password" autocomplete="new-password" minlength="8" maxlength="72" required/><p class="muted">이메일 인증은 없습니다. 비밀번호를 잊으면 운영자에게 복구를 요청해야 합니다.</p>':''}<button class="primary wide" type="submit" ${this.authBusy||!this.connection?'disabled':''}>${this.authBusy?'연결 중…':this.signup?'아이디 만들기':'로그인'}</button></form>${button(this.signup?'기존 아이디로 로그인':'새 아이디 만들기','mode',this.authBusy,'quiet')}<p role="status">${esc(this.authMessage)}</p><p class="muted">비밀번호는 Supabase Auth가 처리합니다. 로그인이 게임 주소의 접근을 제한하지는 않습니다.</p></section>`;
  const c=this.confirmation,disabled=s.working||this.authBusy;
  return `<h2>계정 · 클라우드 저장</h2><section class="cloud-account"><p><strong>${esc(this.name)}</strong>로 로그인 중</p><p class="cloud-status" role="status">${esc(s.message||'기록을 확인하고 있습니다.')}</p><p>전체 프로필: 8명 슬롯·도감·챕터 해금·엔딩·설정. 선택한 캐릭터 하나만 옮기는 기능은 아닙니다.</p>${s.linked?'<p class="muted">이 페이지에서 로컬 저장 후 클라우드에도 저장합니다. 오프라인 변경은 연결되면 재시도합니다.</p>':'<p class="muted">저장 방향을 선택하기 전에는 어느 쪽도 자동으로 교체하지 않습니다.</p>'}${profileSummary(this.hooks.local(),'이 기기')}${s.status==='loading'?'<p>클라우드 기록 확인 중…</p>':s.status==='error'&&!s.remote?'<p>클라우드 기록을 확인하지 못했습니다. 연결 후 재시도해 주세요.</p>':profileSummary(s.remote?.save??null,'클라우드',s.remote?.updatedAt)}${c?`<section class="cloud-confirm" aria-label="클라우드 작업 확인"><h3>${c.action==='upload'?'이 기기 기록으로 클라우드를 교체할까요?':c.action==='download'?'클라우드 기록으로 이 기기를 교체할까요?':c.action==='delete'?'클라우드 진행 기록을 삭제할까요?':'로그아웃할까요?'}</h3><p>${c.action==='logout'?'클라우드 동기화를 멈춥니다. 이 기기의 8명 슬롯과 클라우드 기록은 그대로 남습니다. 공용 기기라면 로그아웃 후 데이터 관리에서 로컬 기록도 따로 지워 주세요.':c.action==='delete'?'클라우드의 8명 슬롯·도감·해금·설정을 삭제합니다. 이 기기 기록과 계정은 유지되며 자동 동기화는 멈춥니다.':'대상의 8명 슬롯·공용 기록·설정 전체가 교체됩니다. 진행 시각만으로 최신 기록을 판단하지 않습니다.'}</p><button class="secondary wide" data-action="save-export">먼저 이 기기 JSON 백업</button>${button(c.action==='delete'?'클라우드 기록 삭제 확정':c.action==='logout'?'로그아웃':c.action==='upload'?'클라우드 전체 교체 확정':'이 기기 전체 교체 확정','confirm',disabled,c.action==='delete'?'danger':'primary')}${button('취소','cancel',disabled,'quiet')}</section>`:`${button('이 기기 기록을 클라우드에 저장','upload',disabled||['loading','error','pending'].includes(s.status))}${button('클라우드 기록을 이 기기로 불러오기','download',disabled||!s.remote?.save||['loading','error','pending'].includes(s.status))}${button('동기화 재시도 · 기록 다시 확인','retry',disabled)}${button('클라우드 기록 삭제','delete',disabled||!s.remote?.save||['loading','error','pending'].includes(s.status),'quiet')}${button('로그아웃','logout',this.authBusy,'quiet')}` }<p class="muted">로그아웃은 이 브라우저의 연결을 해제합니다. 계정 자체 삭제는 운영자에게 요청하세요.</p></section>`;
 }
 async handle(action:string){
  if(!action.startsWith('cloud-'))return false;
  const cmd=action.slice(6);if(cmd==='mode'){this.signup=!this.signup;this.authMessage='';this.hooks.changed();return true;}
  const s=this.sync;if(!s)return true;
  if(cmd==='cancel'){this.confirmation=null;this.hooks.changed();return true;}
  if(cmd==='retry'){this.confirmation=null;await s.retry();return true;}
  if(['upload','download','delete','logout'].includes(cmd)){this.confirmation={action:cmd as NonNullable<typeof this.confirmation>['action'],local:signature(this.hooks.local()),revision:s.revision};this.hooks.changed();return true;}
  if(cmd==='confirm'&&this.confirmation){const c=this.confirmation;this.confirmation=null;
   if(c.action==='upload')await s.chooseUpload(c.local,c.revision);
   if(c.action==='download')await s.chooseDownload(c.local,c.revision);
   if(c.action==='delete')await s.deleteCloud(c.revision);
   if(c.action==='logout'){this.authBusy=true;s.pause('로그아웃 중 · 동기화를 중단했습니다.');try{const {error}=await this.connection!.client.auth.signOut({scope:'local'});if(error){s.message='로그아웃에 실패했습니다. 동기화는 멈췄습니다. 다시 시도하세요.';}else await s.account(null);}catch{s.message='로그아웃에 실패했습니다. 다시 시도하세요.';}finally{this.authBusy=false;}}
   this.hooks.changed();
  }
  return true;
 }
}
