import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {freshSave} from '../src/save-files';
import {newRun,enterNode} from '../src/engine';
import {saveRun} from '../src/storage';
import {CHARACTER_IDS} from '../src/types';
import {accountEmail} from '../src/cloud/config';
const config=JSON.parse(execFileSync(process.execPath,['node_modules/supabase/dist/supabase.js','status','-o','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
assert.equal(config.API_URL,'http://127.0.0.1:55431','Tests must use the isolated local project, never production');
const url=config.API_URL,key=config.PUBLISHABLE_KEY,admin=createClient(url,config.SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const ids:string[]=[];let passed=0;
async function check(name:string,fn:()=>Promise<void>){await fn();passed++;console.log('PASS '+name);}
const clients=[0,1].map(()=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}));
const payload=freshSave();for(const id of CHARACTER_IDS){const r=newRun(150,id);r.screen='map';enterNode(r,'0a');saveRun(payload,r,1000);}
payload.archive.forms=['agumon'];payload.archive.runs=2;payload.settings.reducedMotion=true;
const request=(expected:number,id=randomUUID(),save:unknown=payload)=>({p_expected:expected,p_request:id,p_payload:save,p_app_version:'0.15.0'});
try{
 for(const client of clients){const name='qa_'+randomUUID().replaceAll('-','').slice(0,16),r=await client.auth.signUp({email:accountEmail(name),password:randomUUID()+'Qa!'});assert.ifError(r.error);assert(r.data.session,'Email confirmation must be off in local QA');ids.push(r.data.user!.id);}
 await check('real password sign-up without email confirmation',async()=>{assert.equal(ids.length,2);});
 const anon=createClient(url,key,{auth:{persistSession:false}});
 await check('unauthenticated RLS read returns no profiles and RPC is denied',async()=>{const r=await anon.from('fie_profiles').select('*');assert.ifError(r.error);assert.deepEqual(r.data,[]);assert((await anon.rpc('fie_write_profile',request(0))).error);});
 const operation=request(0);let revision=0;
 await check('8-slot profile round trip through authenticated RPC',async()=>{const r=await clients[0].rpc('fie_write_profile',operation);assert.ifError(r.error);assert.equal(r.data.kind,'saved');revision=r.data.record.revision;assert.deepEqual(r.data.record.payload,JSON.parse(JSON.stringify(payload)));assert.equal(r.data.record.user_id,ids[0]);});
 await check('account B cannot read A, including explicit UUID filter',async()=>{for(const query of [clients[1].from('fie_profiles').select('*'),clients[1].from('fie_profiles').select('*').eq('user_id',ids[0])]){const r=await query;assert.ifError(r.error);assert.deepEqual(r.data,[]);}});
 await check('direct REST insert/update/delete cannot bypass CAS or touch another account',async()=>{for(const query of [clients[1].from('fie_profiles').insert({user_id:ids[0],revision:9}),clients[1].from('fie_profiles').update({payload:null}).eq('user_id',ids[0]),clients[1].from('fie_profiles').delete().eq('user_id',ids[0]),clients[0].from('fie_profiles').update({revision:20}).eq('user_id',ids[0])])assert((await query).error);});
 await check('lost-response retry is idempotent',async()=>{const r=await clients[0].rpc('fie_write_profile',operation);assert.ifError(r.error);assert.equal(r.data.record.revision,revision);});
 await check('reusing an operation ID for different contents is rejected',async()=>{assert((await clients[0].rpc('fie_write_profile',{...operation,p_payload:{...payload,activeCharacterId:'tai'}})).error);});
 await check('two concurrent device writes produce exactly one winner',async()=>{const r=await Promise.all([clients[0].rpc('fie_write_profile',request(revision)),clients[0].rpc('fie_write_profile',request(revision))]);for(const x of r)assert.ifError(x.error);assert.deepEqual(r.map(x=>x.data.kind).sort(),['conflict','saved']);revision++;assert(r.every(x=>x.data.record.revision===revision));});
 await check('account B RPC creates only B and leaves A untouched',async()=>{const r=await clients[1].rpc('fie_write_profile',request(0));assert.ifError(r.error);assert.equal(r.data.record.user_id,ids[1]);const own=await clients[1].from('fie_profiles').select('*');assert.equal(own.data!.length,1);assert.equal(own.data![0].user_id,ids[1]);});
 await check('malformed save payload is rejected by database constraints',async()=>{for(const value of [{},[],{...payload,version:99}])assert((await clients[0].rpc('fie_write_profile',request(revision,randomUUID(),value))).error);});
 await check('cloud deletion is a revisioned tombstone; stale writes cannot resurrect it',async()=>{const del=request(revision,randomUUID(),null);const r=await clients[0].rpc('fie_write_profile',del);assert.ifError(r.error);assert.equal(r.data.record.payload,null);assert.equal(r.data.record.revision,revision+1);const stale=await clients[0].rpc('fie_write_profile',request(revision));assert.equal(stale.data.kind,'conflict');assert.equal(stale.data.record.payload,null);const duplicate=await clients[0].rpc('fie_write_profile',del);assert.equal(duplicate.data.record.revision,revision+1);});
 await check('invalid bearer is denied by real Auth/PostgREST gateway',async()=>{const response=await fetch(url+'/rest/v1/fie_profiles',{headers:{apikey:key,Authorization:'Bearer invalid-test-token'}});assert([401,403].includes(response.status));});
 console.log(`Local Supabase integration: ${passed} groups PASS. No production accounts used.`);
}finally{for(const id of ids){const r=await admin.auth.admin.deleteUser(id);assert.ifError(r.error);}for(const c of clients)c.auth.stopAutoRefresh();admin.auth.stopAutoRefresh();}
