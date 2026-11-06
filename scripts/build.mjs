import {spawnSync} from 'node:child_process';
import {deployment} from '../config/deployment.mjs';
const {target}=deployment(process.argv[2]||'pages');
for(const args of [['node_modules/typescript/bin/tsc','--noEmit'],['node_modules/vite/bin/vite.js','build','--mode',target],['scripts/build-pwa.mjs',target]]){
 const result=spawnSync(process.execPath,args,{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
