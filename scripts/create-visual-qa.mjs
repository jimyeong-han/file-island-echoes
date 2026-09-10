import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
mkdirSync('test-results',{recursive:true});
let main=readFileSync('src/main.ts','utf8').replaceAll("from './","from '../src/").replaceAll("import './","import '../src/").replaceAll("import('./","import('../src/");
main+=`
const qaControls=document.createElement('nav');qaControls.style.cssText='position:fixed;bottom:0;right:0;z-index:10000;max-width:100vw;display:flex;flex-wrap:wrap;background:#fff;color:#111;padding:6px;font:14px sans-serif';
qaControls.innerHTML='<select id="qa-state" aria-label="QA screen">'+['title','select','detail','chapters','intro','map','battle','boss','event','rest','reward','evolution','forced','result','defeat','archive','settings','help','credits'].map(s=>'<option>'+s+'</option>').join('')+'</select><button id="qa-show">Show fixture</button><button id="qa-zoom">200% text</button><button id="qa-font">Font fallback</button>';document.body.append(qaControls);
document.querySelector('#qa-zoom')!.addEventListener('click',()=>document.documentElement.style.fontSize=document.documentElement.style.fontSize?'':'200%');
document.querySelector('#qa-font')!.addEventListener('click',()=>{const style=document.createElement('style');style.textContent="@font-face{font-family:'QA Missing';src:url('/file-island-echoes/qa-intentionally-missing.woff2');font-display:swap}";document.head.append(style);document.documentElement.style.setProperty('--font-body',"'QA Missing','Malgun Gothic',sans-serif");document.documentElement.style.setProperty('--font-display','var(--font-body)');void document.fonts.load('16px "QA Missing"').then(()=>{qaControls.dataset.fontFailure='unexpected-success';},()=>{qaControls.dataset.fontFailure='expected-load-failure';});});
document.querySelector('#qa-show')!.addEventListener('click',()=>{
 const target=(document.querySelector('#qa-state') as HTMLSelectElement).value;modal='';view='game';selected='kari';mapZone=null;warning='';
 const r=newRun(123,'kari');save.run=r;r.evoEnergy=30;r.bond=10;r.burden=0;r.screen='map';
 if(['title','select','detail','chapters'].includes(target))view=target as typeof view;
 else if(['archive','settings','help','credits'].includes(target)){view='title';modal=target;save.archive.forms=Object.keys(FORMS);save.archive.enemies=Object.keys(ENEMIES);}
 else if(target==='intro')r.screen='intro';
 else if(target==='event'||target==='rest'){r.row=target==='event'?1:3;const node=chapterOf(r).map[r.row].find(n=>n.type===target)!;enterNode(r,node.id);}
 else if(target==='battle'||target==='boss'){r.row=target==='boss'?10:0;enterNode(r,chapterOf(r).map[r.row][0].id);}
 else if(target==='reward'){enterNode(r,'0a');r.screen='reward';r.rewards=CHARACTERS.kari.exclusive.slice(0,3);}
 else if(target==='evolution'){r.form='gatomon-resonance';r.hp=r.maxHp=80;evolve(r,'angewomon');}
 else if(target==='forced'){save.run=newRun(123,'tai');save.run.screen='map';save.run.form='greymon';save.run.evoEnergy=30;save.run.burden=10;evolve(save.run,'skull');}
 else if(target==='result'||target==='defeat'){r.screen='result';r.won=target==='result';r.outcome=r.won?'victory':'defeat';}
 render();window.scrollTo(0,0);
});
`;
const moduleName='visual-main-'+Date.now()+'.ts';
writeFileSync('test-results/'+moduleName,main);
writeFileSync('test-results/visual.html','<!doctype html><html lang="ko"><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Visual fixtures (local only)</title><div id="app"></div><script type="module" src="./'+moduleName+'"></script></html>');
console.log('Local visual fixtures written to test-results/visual.html; no production hooks.');
