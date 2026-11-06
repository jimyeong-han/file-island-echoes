import { defineConfig } from 'vite';
import {deployment} from './config/deployment.mjs';
export default defineConfig(({mode})=>{
 const config=deployment(mode==='development'||mode==='production'||mode==='test'?'pages':mode);
 return {base:config.base,plugins:[{name:'deployment-metadata',generateBundle(){this.emitFile({type:'asset',fileName:'deployment.json',source:JSON.stringify(config)});}}]};
});
