// Isolated production-mode browser/PWA QA. Never embeds a local secret/admin key.
import {execFileSync} from 'node:child_process';
import {cpSync} from 'node:fs';
const config=JSON.parse(execFileSync(process.execPath,['node_modules/supabase/dist/supabase.js','status','-o','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
if(config.API_URL!=='http://127.0.0.1:55431')throw Error('Isolated local Supabase only');
execFileSync(process.execPath,['scripts/build.mjs','vercel'],{stdio:'inherit',env:{...process.env,VITE_SUPABASE_URL:config.API_URL,VITE_SUPABASE_PUBLISHABLE_KEY:config.PUBLISHABLE_KEY}});
cpSync('dist','test-results/v015-cloud-root',{recursive:true});
console.log('QA build: test-results/v015-cloud-root (local public key only). Rebuild normally before deployment.');
