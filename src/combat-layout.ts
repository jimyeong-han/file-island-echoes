import {icon} from './icons';

const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

/** Content is trusted, internally rendered markup. Only the first title moves. */
export function dialogFrame(content:string){
 const title=content.match(/<h2>([\s\S]*?)<\/h2>/);
 return `<dialog aria-labelledby="dialog-title"><header class="dialog-top"><h2 id="dialog-title">${title?.[1]||'게임 메뉴'}</h2><button data-action="close" class="close-button" aria-label="닫기">${icon('close')}</button></header><div class="dialog-body">${title?content.replace(title[0],''):content}</div></dialog>`;
}

export function battleHeading(region:string,title:string,turn:number){
 return `<div class="battle-heading"><div class="battle-title"><div class="eyebrow">${escape(region)}</div><h1 tabindex="-1">${escape(title)}</h1></div><button data-action="ability" class="battle-analysis quiet">능력 · 적 분석</button><div class="turn-info">턴 <b>${String(turn).padStart(2,'0')}</b></div></div>`;
}

export function targetAttributes(name:string,selected:boolean,defeated:boolean){
 return `aria-pressed="${selected&&!defeated}" aria-label="${escape(name)} · ${defeated?'전투 불능':selected?'선택한 대상':'대상 선택'}"`;
}
