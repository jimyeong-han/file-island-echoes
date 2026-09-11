import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
mkdirSync('test-results',{recursive:true});
let main=readFileSync('src/main.ts','utf8').replaceAll("from './","from '../src/").replaceAll("import './","import '../src/").replaceAll("import('./","import('../src/");
main="import {makeEnemy} from '../src/engine';\n"+main;
main+=`
const qaControls=document.createElement('nav');qaControls.style.cssText='position:fixed;bottom:0;right:0;z-index:10000;max-width:100vw;display:flex;flex-wrap:wrap;background:#fff;color:#111;padding:6px;font:14px sans-serif';
qaControls.innerHTML='<select id="qa-state" aria-label="QA screen">'+['title','select','detail','chapters','intro','map','battle','enemy-pattern','all-cards','two-enemies','near-win','boss-win','history','status-death','low-hp','energy-12','angewomon-battle','boss','event','rest','reward','evolution','evolution-final','forced','result','defeat','archive','settings','help','credits'].map(s=>'<option>'+s+'</option>').join('')+'</select><select id="qa-character" aria-label="QA character">'+Object.keys(CHARACTERS).map(id=>'<option>'+id+'</option>').join('')+'</select><select id="qa-enemy" aria-label="QA enemy">'+Object.keys(ENEMIES).map(id=>'<option>'+id+'</option>').join('')+'</select><input id="qa-step" aria-label="QA step" type="number" value="0" min="0" style="width:45px"><button id="qa-show">Show fixture</button><button id="qa-zoom">200% text</button><button id="qa-font">Font fallback</button>';document.body.append(qaControls);void import('../qa/combat-checks.ts');
document.querySelector('#qa-zoom')!.addEventListener('click',()=>document.documentElement.style.fontSize=document.documentElement.style.fontSize?'':'200%');
document.querySelector('#qa-font')!.addEventListener('click',()=>{const style=document.createElement('style');style.textContent="@font-face{font-family:'QA Missing';src:url('/file-island-echoes/qa-intentionally-missing.woff2');font-display:swap}";document.head.append(style);document.documentElement.style.setProperty('--font-body',"'QA Missing','Malgun Gothic',sans-serif");document.documentElement.style.setProperty('--font-display','var(--font-body)');void document.fonts.load('16px "QA Missing"').then(()=>{qaControls.dataset.fontFailure='unexpected-success';},()=>{qaControls.dataset.fontFailure='expected-load-failure';});});
document.querySelector('#qa-show')!.addEventListener('click',()=>{
 motion.finish();const target=(document.querySelector('#qa-state') as HTMLSelectElement).value;modal='';view='game';selected=(document.querySelector('#qa-character') as HTMLSelectElement).value as CharacterId;mapZone=null;warning='';
 const r=newRun(123,selected);save.run=r;r.evoEnergy=30;r.bond=10;r.burden=0;r.screen='map';
 if(['title','select','detail','chapters'].includes(target))view=target as typeof view;
 else if(['archive','settings','help','credits'].includes(target)){view='title';modal=target;save.archive.forms=Object.keys(FORMS);save.archive.enemies=Object.keys(ENEMIES);}
 else if(target==='intro')r.screen='intro';
 else if(target==='event'||target==='rest'){r.row=target==='event'?1:3;const node=chapterOf(r).map[r.row].find(n=>n.type===target)!;enterNode(r,node.id);}
 else if(['battle','enemy-pattern','all-cards','two-enemies','near-win','boss-win','history','status-death','low-hp','energy-12','angewomon-battle','boss'].includes(target)){r.row=target==='boss'||target==='boss-win'?10:0;enterNode(r,chapterOf(r).map[r.row][0].id);if(target==='energy-12')r.battle!.energy=12;if(target==='angewomon-battle')r.form='angewomon';if(target==='all-cards'){r.battle!.hand=Object.keys(CARDS);r.battle!.energy=12;}if(target==='two-enemies'){r.battle!.enemies=[makeEnemy('kuwaga'),makeEnemy('shellmon')];r.hp=r.maxHp=200;}if(target==='history')r.battle!.log=Array.from({length:40},(_,i)=>'['+(40-i)+'] 검증용 이전 행동 '+(40-i));if(target==='near-win'||target==='boss-win'){r.battle!.enemies.forEach(e=>e.hp=1);r.battle!.hand=[CHARACTERS[selected].startDeck[0]];}if(target==='status-death'){r.hp=1;r.corruption=3;}if(target==='low-hp')r.hp=10;if(target==='enemy-pattern'){r.battle!.enemies=[makeEnemy((document.querySelector('#qa-enemy') as HTMLSelectElement).value)];r.battle!.enemies[0].step=Number((document.querySelector('#qa-step') as HTMLInputElement).value);r.battle!.enemies[0].hp=Math.floor(r.battle!.enemies[0].maxHp/2);r.hp=r.maxHp=200;}}
 else if(target==='reward'){enterNode(r,'0a');r.screen='reward';r.rewards=CHARACTERS.kari.exclusive.slice(0,3);}
 else if(target==='evolution'||target==='evolution-final'){if(target==='evolution-final'){r.form=CHARACTERS[selected].forms[1];r.hp=r.maxHp=FORMS[r.form].hp;}evolve(r,CHARACTERS[selected].forms[target==='evolution'?1:2]);}
 else if(target==='forced'){save.run=newRun(123,'tai');save.run.screen='map';save.run.form='greymon';save.run.evoEnergy=30;save.run.burden=10;evolve(save.run,'skull');}
 else if(target==='result'||target==='defeat'){r.screen='result';r.won=target==='result';r.outcome=r.won?'victory':'defeat';}
 render();window.scrollTo(0,0);if(target==='battle'||target==='two-enemies')void dealHand(0);
});
`;
const moduleName='visual-main-'+Date.now()+'.ts';
writeFileSync('test-results/'+moduleName,main);
writeFileSync('test-results/visual.html','<!doctype html><html lang="ko"><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Visual fixtures (local only)</title><div id="app"></div><script type="module" src="./'+moduleName+'"></script></html>');
console.log('Local visual fixtures written to test-results/visual.html; no production hooks.');
