export const ISSUE_URL='https://github.com/jimyeong-han/file-island-echoes/issues/new';
export const TEMPLATE='bug_report.yml';
export const LOCATIONS=['타이틀','선택','지도','이벤트','전투','진화','결과','도감','설정','저장/불러오기','오디오','기타'] as const;
export const FREQUENCIES=['한 번','가끔','항상'] as const;
export const SEVERITIES=['불편','진행 방해','진행 불가','저장 손실 의심'] as const;
export const FIELDS={title:{label:'제목 또는 한 줄 요약',max:100},actual:{label:'실제로 일어난 일',max:2000},expected:{label:'기대했던 동작',max:2000},steps:{label:'재현 단계',max:3000},extra:{label:'추가 설명',max:2000}};
export type TextField=keyof typeof FIELDS;
export type Draft=Record<TextField,string>&{location:string;frequency:string;severity:string};
export const newDraft=():Draft=>({title:'',actual:'',expected:'',steps:'',extra:'',location:'기타',frequency:'한 번',severity:'불편'});
export const GROUPS={environment:'앱 버전·브라우저·화면 크기',game:'현재 화면·캐릭터·전투 요약',audio:'소리·움직임 줄이기 설정',errors:'최근 오류 요약'};
export type Group=keyof typeof GROUPS;
export type Diagnostics=Record<Group,unknown>;
export function validateDraft(d:Draft){for(const [key,f] of Object.entries(FIELDS)){const value=d[key as TextField];if(typeof value!=='string'||value.length>f.max||key!=='extra'&&!value.trim())return `${f.label}: ${key==='extra'?'': '필수 항목이며 '}최대 ${f.max}자입니다.`;}if(!LOCATIONS.some(v=>v===d.location)||!FREQUENCIES.some(v=>v===d.frequency)||!SEVERITIES.some(v=>v===d.severity))return '선택 항목을 확인해 주세요.';return '';}
export function makeReport(d:Draft,source:Diagnostics,groups:Group[],reviewed=false){const error=validateDraft(d);if(error)throw Error(error);const fields=Object.fromEntries(Object.keys(FIELDS).map(k=>[k,d[k as TextField].trim()])) as Record<TextField,string>;return {reportVersion:1,app:'file-island-echoes',...fields,location:d.location,frequency:d.frequency,severity:d.severity,diagnostics:Object.fromEntries((Object.keys(GROUPS) as Group[]).filter(k=>groups.includes(k)).map(k=>[k,structuredClone(source[k])])),privacyReviewed:reviewed};}
export type Report=ReturnType<typeof makeReport>;
// Quoting user text keeps headings, links and HTML from becoming report structure.
const quote=(s:string)=>s.split(/\r?\n/).map(l=>'> '+l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')).join('\n');
export function markdown(r:Report){return `## 요약\n${quote(r.title)}\n\n## 발생 위치와 빈도\n${r.location} · ${r.frequency} · ${r.severity}\n\n## 실제 동작\n${quote(r.actual)}\n\n## 기대 동작\n${quote(r.expected)}\n\n## 재현 단계\n${quote(r.steps)}\n\n## 진단 정보\n${Object.keys(r.diagnostics).length?quote(JSON.stringify(r.diagnostics,null,2)):'포함하지 않음'}\n\n## 추가 설명\n${quote(r.extra||'없음')}\n\n- [${r.privacyReviewed?'x':' '}] 개인정보·인증정보가 없는지 직접 확인했습니다.\n`;}
export function issueLink(r:Report,maxLength=6000){const url=new URL(ISSUE_URL);url.searchParams.set('template',TEMPLATE);const blank=url.href;url.searchParams.set('title',r.title);url.searchParams.set('body',markdown(r));return url.href.length<=maxLength?{url:url.href,fallback:false}:{url:blank,fallback:true};}
export const escapeHtml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export type RecentError={code:string;message:string};
export class ErrorJournal{
 private entries:RecentError[]=[];
 add(kind:'runtime'|'promise',value:unknown){try{const name=value instanceof Error?value.name:'';const type=['TypeError','RangeError','ReferenceError','SyntaxError'].includes(name)?name:'Error';const entry={code:`${kind}:${type}`,message:'앱 실행 중 오류가 발생했습니다. 경로·스택·원문은 포함하지 않습니다.'};this.entries=[entry,...this.entries.filter(e=>e.code!==entry.code)].slice(0,2);}catch{/* Diagnostics must never interrupt play. */}}
 snapshot(){return structuredClone(this.entries);}
}
export async function copyReport(text:string,write:(s:string)=>Promise<void>,select:()=>void){try{await write(text);return 'Markdown을 복사했습니다.';}catch{select();return '자동 복사를 사용할 수 없습니다. 아래 보고서를 직접 선택해 복사하거나 파일로 내려받으세요.';}}
