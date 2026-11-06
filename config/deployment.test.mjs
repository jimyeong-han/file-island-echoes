import {describe,it,expect} from 'vitest';
import {deployment} from './deployment.mjs';
import {readFileSync} from 'node:fs';
describe('explicit hosting targets',()=>{
 it('defaults existing commands to Pages, with an explicit Vercel root',()=>{
  expect(deployment()).toEqual({target:'pages',base:'/file-island-echoes/'});expect(deployment('vercel')).toEqual({target:'vercel',base:'/'});
 });
 it('rejects misspelled or prototype-derived targets instead of silently publishing a broken base',()=>{
  for(const name of ['','page','production','toString','__proto__'])expect(()=>deployment(name)).toThrow();
 });
 it('configures a static root deployment without enabling analytics, auth bypass or fake access control',()=>{
  const c=JSON.parse(readFileSync('vercel.json','utf8'));expect(c.outputDirectory).toBe('dist');expect(c.buildCommand).toContain('build:vercel');expect(c.headers.some(h=>h.source==='/sw.js'&&h.headers.some(v=>v.key==='Cache-Control'&&v.value.includes('no-cache')))).toBe(true);
  expect(c.headers[0].headers).toContainEqual({key:'X-Robots-Tag',value:'noindex, nofollow, noarchive, nosnippet'});
  expect(c).not.toHaveProperty('env');expect(c).not.toHaveProperty('rewrites');
 });
});
