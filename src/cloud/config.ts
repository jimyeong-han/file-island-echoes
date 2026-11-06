export interface CloudConfig {url:string;key:string}
export function cloudConfig(url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY):CloudConfig|null {
 if(!url||!key)return null;
 try{const u=new URL(url);const local=['127.0.0.1','localhost'].includes(u.hostname)&&(import.meta.env.DEV||typeof location!=='undefined'&&['127.0.0.1','localhost'].includes(location.hostname));
  if(u.username||u.password||u.search||u.hash||u.pathname!=='/'||(!local&&(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co'))))return null;
  if(!key.startsWith('sb_publishable_')&&!(local&&key.startsWith('eyJ')))return null;
  return {url:u.origin,key};
 }catch{return null;}
}
export function accountEmail(id:string){
 const normalized=id.trim().toLowerCase();
 if(!/^[a-z0-9][a-z0-9_]{2,23}$/.test(normalized))throw Error('아이디는 영문·숫자로 시작하는 3~24자의 영문·숫자·밑줄로 입력하세요.');
 // Reserved, non-deliverable domain. Auth treats this as a login identifier; no email is sent.
 return normalized+'@accounts.file-island-echoes.invalid';
}
export const accountName=(email?:string)=>email?.endsWith('@accounts.file-island-echoes.invalid')?email.split('@')[0]:'연결된 계정';
