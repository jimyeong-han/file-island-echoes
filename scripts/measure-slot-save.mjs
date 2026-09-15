import {build} from 'esbuild';import {mkdirSync,writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';
mkdirSync('test-results',{recursive:true});writeFileSync('test-results/measure-slots.ts',`
import {CARDS,FORMS,ENEMIES} from '../src/data';import {cardStats,newRun,enterNode} from '../src/engine';import {CHARACTER_IDS} from '../src/types';import {freshSave,exportSave,prepareImport} from '../src/save-files';import {saveRun} from '../src/storage';
const bytes=s=>new TextEncoder().encode(s).length;let longest='';const consider=t=>{t='[999999999999999] '+t;if(bytes(t)>bytes(longest))longest=t;};
for(const [form,definition]of Object.entries(FORMS)){const r=newRun(1,definition.owner);r.screen='map';enterNode(r,'0a');r.form=form;r.battle.block=1e15;r.battle.ability.crestBuff=1e15;for(const id of Object.keys(CARDS)){const c=cardStats(r,id);consider(c.name+' · '+c.text);}}
for(const e of Object.values(ENEMIES)){consider(e.encounter);for(const a of e.pattern)consider(e.name+' · '+a.label+': 피해 1000000000000000 (방어 1000000000000000)');}
const s=freshSave();for(const id of CHARACTER_IDS){const r=newRun(1,id);r.screen='map';enterNode(r,'0a');r.battle.log=Array(999).fill(longest);saveRun(s,r,123);}
const file=exportSave(s);prepareImport(file.text);console.log(JSON.stringify({longestLogBytes:bytes(longest),eightFullLogsExportBytes:bytes(file.text),limit:8*1024*1024,longest},null,2));
`);await build({entryPoints:['test-results/measure-slots.ts'],bundle:true,platform:'node',format:'esm',outfile:'test-results/measure-slots.mjs'});process.stdout.write(execFileSync(process.execPath,['test-results/measure-slots.mjs']));
