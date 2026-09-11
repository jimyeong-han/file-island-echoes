// The save remains a newest-first string array. Numbering travels with each entry,
// so retaining a bounded window never renumbers an event on reload.
const numbered=/^\[(\d+)\] (.*)$/s;
export function logEntries(log:string[]){
 return log.slice().reverse().map((text,i)=>{const m=text.match(numbered),n=Number(m?.[1]),valid=m&&Number.isSafeInteger(n)&&n>0&&n<1e15;return {number:valid?n:i+1,text:valid?m[2]:text};});
}
export function appendLog(log:string[],text:string){
 const entries=logEntries(log),n=(entries.at(-1)?.number??0)+1;
 return [`[${n}] ${text}`,...entries.reverse().map(e=>`[${e.number}] ${e.text}`)].slice(0,999);
}
