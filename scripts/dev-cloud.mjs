import {execFileSync} from 'node:child_process';
import {createServer} from 'vite';
const config=JSON.parse(execFileSync(process.execPath,['node_modules/supabase/dist/supabase.js','status','-o','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
if(config.API_URL!=='http://127.0.0.1:55431')throw Error('Only the isolated local Supabase project may be used.');
process.env.VITE_SUPABASE_URL=config.API_URL;process.env.VITE_SUPABASE_PUBLISHABLE_KEY=config.PUBLISHABLE_KEY;
const server=await createServer({mode:'vercel',server:{host:'127.0.0.1',port:Number(process.argv[2]||3040),strictPort:true}});await server.listen();server.printUrls();
