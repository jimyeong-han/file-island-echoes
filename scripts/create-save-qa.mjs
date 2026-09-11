// Synthetic fixtures only; generated files are ignored and never shipped.
import {build} from 'esbuild';
import {mkdirSync,writeFileSync} from 'node:fs';
mkdirSync('test-results/save-fixtures',{recursive:true});
await build({stdin:{contents:`
import {writeFileSync} from 'node:fs';
import {freshSave,exportSave} from './src/save-files';
import {newRun,enterNode,playCard} from './src/engine';
const s=freshSave();s.run=newRun(123,'kari');s.run.screen='map';enterNode(s.run,'0a');playCard(s.run,0);
s.archive={forms:['gatomon','angewomon'],enemies:['devimon'],events:[],zones:[0,1,2],runs:2,wins:1,best:11,clears:{kari:['file']},endings:['kari:file']};
s.settings={masterVolume:.42,musicVolume:.16,sfxVolume:.72,muted:false,reducedMotion:true,guide:false};
const e=JSON.parse(exportSave(s,new Date('2026-09-11T00:00:00Z')).text);
const fixtures={full:e,empty:JSON.parse(exportSave(freshSave()).text),wrongApp:{...e,app:'other'},future:{...e,formatVersion:99},badPayload:{...e,payload:[]},badRun:{...e,payload:{...s,run:{bad:true}}},legacy:{...s,version:1,run:null}};
for(const [name,value] of Object.entries(fixtures))writeFileSync('test-results/save-fixtures/'+name+'.json',JSON.stringify(value,null,2));
writeFileSync('test-results/save-fixtures/badSyntax.json','{');
writeFileSync('test-results/save-fixtures/tooLarge.json',' '.repeat(1024*1024+1));
`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:'test-results/save-fixtures/generate.mjs'});
await import('../test-results/save-fixtures/generate.mjs?'+Date.now());
writeFileSync('test-results/save-fixtures/README.txt','Disposable synthetic game data for local import/export/reset QA only. No user save or personal data.');
console.log('Synthetic save fixtures generated under test-results/save-fixtures/.');
