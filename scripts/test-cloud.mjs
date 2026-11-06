import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
await build({entryPoints:['qa/cloud-integration.ts'],outfile:'test-results/cloud-integration.mjs',bundle:true,platform:'node',format:'esm',packages:'external',define:{'import.meta.env.DEV':'true','import.meta.env.VITE_SUPABASE_URL':'undefined','import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY':'undefined'}});
const result=spawnSync(process.execPath,['test-results/cloud-integration.mjs'],{stdio:'inherit'});process.exitCode=result.status??1;
