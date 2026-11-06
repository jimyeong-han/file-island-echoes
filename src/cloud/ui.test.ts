// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {AccountUI,profileSummary} from './ui';
import {freshSave} from '../save-files';
vi.mock('./config',()=>({cloudConfig:()=>({url:'http://127.0.0.1:55431',key:'sb_publishable_test'}),accountName:()=>'',accountEmail:(id:string)=>id+'@test.invalid'}));
afterEach(()=>{vi.useRealTimers();document.body.innerHTML='';});
test('signup submits only through the auth handler, never GET credentials into a URL',()=>{
 vi.useFakeTimers();const root=document.createElement('div');document.body.append(root);
 const ui=new AccountUI({root,local:freshSave,replace:()=>true,changed:()=>{}});
 root.innerHTML='<dialog open>'+ui.panel()+'</dialog>';
 const form=root.querySelector('form')!;
 // name=id can shadow form.id in real browsers. Do not use property equality for routing.
 Object.defineProperty(form,'id',{value:root.querySelector('[name=id]')});
 const event=new Event('submit',{bubbles:true,cancelable:true});
 expect(form.dispatchEvent(event)).toBe(false);expect(event.defaultPrevented).toBe(true);
 expect(form.getAttribute('method')).toBe('dialog');
 expect(root.querySelector<HTMLInputElement>('[name=password]')!.type).toBe('password');
});
test('first-login comparison includes all eight character slots and shared scope',()=>{
 const html=profileSummary(freshSave(),'이 기기');
 for(const name of ['신태일','매튜','한소라','장한솔','이미나','정석','리키','신나리'])expect(html).toContain(name);
 expect(html).toContain('슬롯 0/8');expect(html).toContain('진행 없음');
});
