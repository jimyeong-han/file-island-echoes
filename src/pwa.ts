type InstallPrompt=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
const base=import.meta.env.BASE_URL;
export class Pwa {
 registration:ServiceWorkerRegistration|null=null;
 prompt:InstallPrompt|null=null;
 installed=false; applying=false; message=''; reloaded=false;
 constructor(private changed:()=>void){
  this.installed=this.standalone();
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();this.prompt=e as InstallPrompt;changed();});
  window.addEventListener('appinstalled',()=>{this.installed=true;this.prompt=null;changed();});
  matchMedia('(display-mode: standalone)').addEventListener('change',()=>{this.installed=this.standalone();changed();});
  window.addEventListener('online',()=>{changed();void this.check();});window.addEventListener('offline',changed);
  window.addEventListener('vite:preloadError',()=>{this.message='새 파일을 불러오지 못했습니다. 연결을 확인하고 업데이트를 확인하세요.';changed();});
 }
 standalone(){return matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;}
 iosSafari(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1 ? /Safari/.test(navigator.userAgent)&&!/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent):false;}
 async start(){
  if(!import.meta.env.PROD||!('serviceWorker' in navigator))return;
  try{
   this.registration=await navigator.serviceWorker.register(base+'sw.js',{scope:base,updateViaCache:'none'});
   const observe=()=>{const installing=this.registration?.installing;installing?.addEventListener('statechange',()=>{if(installing.state==='installed')this.changed();});this.changed();};
   this.registration.addEventListener('updatefound',observe);observe();
   navigator.serviceWorker.addEventListener('controllerchange',()=>this.controllerChanged());
  }catch{this.message='오프라인 준비를 완료하지 못했습니다. 온라인 게임은 계속할 수 있습니다.';this.changed();}
 }
 controllerChanged(){if(this.applying&&!this.reloaded){this.reloaded=true;location.reload();}else {this.warmVisibleAssets();this.changed();}}
 warmVisibleAssets(){for(const entry of performance.getEntriesByType('resource')){const url=new URL(entry.name);if(url.origin===location.origin&&url.pathname.startsWith(base+'assets/')&&/\.(webp|png|svg|mp3|ogg)$/.test(url.pathname))void fetch(url.href).catch(()=>{});}}
 async install(){const prompt=this.prompt;if(!prompt)return;this.prompt=null;try{await prompt.prompt();await prompt.userChoice;}catch{this.message='브라우저에서 설치를 완료하지 못했습니다.';}this.changed();}
 async check(){if(!this.registration||!navigator.onLine)return;try{await this.registration.update();this.message=this.registration.waiting?'새 버전 사용 가능':'업데이트 확인 완료';}catch{this.message='업데이트를 확인하지 못했습니다. 연결을 확인하세요.';}this.changed();}
 async apply(safe:boolean,save:()=>boolean){
  if(this.applying)return;
  if(!navigator.onLine){this.message='온라인으로 연결한 뒤 적용하세요.';this.changed();return;}
  if(!safe){this.message='전투를 마친 뒤 지도나 보상 화면에서 적용하세요.';this.changed();return;}
  if(!this.registration?.waiting)return;
  if(!save()){this.message='현재 기록을 저장하지 못해 업데이트를 중단했습니다. JSON 백업을 먼저 해주세요.';this.changed();return;}
  // Check actual connectivity; navigator.onLine alone is not proof of connectivity.
  this.applying=true;this.message='저장 완료 · 연결 확인 중';this.changed();
  try{const response=await fetch(base+'sw.js',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error();}catch{this.applying=false;this.message='서버에 연결하지 못했습니다. 현재 게임을 유지합니다.';this.changed();return;}
  if(!this.registration.waiting){this.applying=false;this.changed();return;}
  this.applying=true;this.message='저장 완료 · 업데이트 적용 중';this.changed();this.registration.waiting.postMessage({type:'APPLY_UPDATE'});
  window.setTimeout(()=>{if(!this.reloaded){this.applying=false;this.message='아직 적용되지 않았습니다. 연결을 확인한 뒤 다시 시도하세요.';this.changed();}},15000);
 }
 async repair(){
  if(!navigator.onLine){this.message='연결 후 오프라인 파일을 복구하세요.';this.changed();return;}
  try{
   // Keep the app shell: deleting it would break an offline reload or another open tab.
   if('caches' in window)for(const key of await caches.keys())if(key==='file-island-echoes-runtime-v1')await caches.delete(key);
   await this.registration?.update();this.message='그림·소리 캐시를 비웠습니다. 기록과 앱 본체는 유지됩니다. 다음 화면에서 필요한 파일을 다시 받습니다.';
  }catch{this.message='파일 복구를 완료하지 못했습니다. 게임 기록은 유지됩니다.';}this.changed();
 }
 panel(safe:boolean){
  const button=(label:string,action:string,disabled=false)=>`<button class="secondary wide" data-action="pwa-${action}" ${disabled?'disabled':''}>${label}</button>`;
  return `<section class="pwa-settings"><h3>앱 설치와 오프라인</h3>${this.installed?'<p>앱으로 실행 중이거나 설치된 상태입니다.</p>':this.prompt?button('앱으로 설치','install'):this.iosSafari()?'<p>Safari의 공유 → 홈 화면에 추가로 설치할 수 있습니다.</p>':'<p>지원하는 브라우저의 메뉴에서 홈 화면에 추가할 수 있습니다.</p>'}<p>한 번 받은 화면·그림은 오프라인에서도 사용합니다. 아직 받지 않은 그림과 소리는 생략될 수 있습니다.</p><p>${navigator.onLine?'온라인':'오프라인 · 저장한 파일로 실행 중'}${this.registration?.active?' · 오프라인 본체 준비됨':''}</p>${this.registration?.waiting?`<p><strong>새 버전 사용 가능</strong>${safe?'':' · 전투를 마친 뒤 적용할 수 있습니다.'}</p>${button('저장하고 업데이트 적용','apply',!safe||!navigator.onLine||this.applying)}`:''}${this.registration?button('업데이트 확인','check',!navigator.onLine||this.applying)+button('그림·소리 캐시 복구','repair',!navigator.onLine||this.applying):''}<p role="status">${this.message}</p><p>같은 주소의 앱과 브라우저는 기록을 공유할 수 있습니다. 앱 제거·브라우저 데이터 삭제로 기록을 잃을 수 있으니 중요한 탐험은 데이터 관리에서 JSON으로 내보내세요.</p></section>`;
 }
}
