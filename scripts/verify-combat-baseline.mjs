// Read the pre-UI engine from Git; generated sources are ignored and never shipped.
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {build} from 'esbuild';
mkdirSync('test-results',{recursive:true});
const baseline=execFileSync('git',['show','340c57c:src/engine.ts'],{encoding:'utf8'}).replaceAll("from './","from '../src/");
writeFileSync('test-results/baseline-engine.ts',baseline);
writeFileSync('test-results/compare-combat.ts',`
import assert from 'node:assert/strict';
import * as old from './baseline-engine';
import * as now from '../src/engine';
import {CHARACTER_IDS} from '../src/types';
import {ENEMIES} from '../src/data';
const state=r=>{const copy=structuredClone(r);delete copy.started;if(copy.battle)delete copy.battle.log;return copy;};
let cases=0;
for(const character of CHARACTER_IDS)for(const [enemy,def] of Object.entries(ENEMIES))for(let step=0;step<def.pattern.length;step++){
 const a=old.newRun(837,character),b=now.newRun(837,character);
 for(const [e,r] of [[old,a],[now,b]]){r.screen='map';e.enterNode(r,'0a');r.hp=r.maxHp=999;r.battle.enemies=[e.makeEnemy(enemy),e.makeEnemy('kuwaga')];r.battle.enemies[0].step=step;r.battle.block=4;r.corruption=1;r.battle.ability.burn=1;}
 for(let turn=0;turn<3;turn++){
  if(a.screen!=='battle')break;
  for(let card=0;card<3;card++){
   const i=a.battle.hand.findIndex(id=>old.cardStats(a,id).cost<=a.battle.energy);if(i<0||a.screen!=='battle')break;
   assert.deepEqual(now.cardStats(b,b.battle.hand[i]),old.cardStats(a,a.battle.hand[i]));old.playCard(a,i);now.playCard(b,i);assert.deepEqual(state(a),state(b));
  }
  old.endTurn(a);now.endTurn(b,[]);assert.deepEqual(state(a),state(b));
 }
 cases++;
}
for(const id of CHARACTER_IDS){const a=old.newRun(123,id),b=now.newRun(123,id);for(const r of [a,b]){r.screen='map';r.evoEnergy=99;r.bond=10;}for(let stage=0;stage<2;stage++){const options=old.evolutionOptions(a);if(!options.length)break;old.evolve(a,options[0].form);now.evolve(b,options[0].form);assert.deepEqual(state(a),state(b));a.screen=b.screen='map';}}
console.log('Pre-v0.8 engine comparison passed: '+cases+' scenarios, 8 partners, up to 3 turns, card costs/effects, enemy results, RNG and evolution. Only log representation excluded.');
`);
await build({entryPoints:['test-results/compare-combat.ts'],outfile:'test-results/compare-combat.mjs',bundle:true,platform:'node',format:'esm'});
await import('../test-results/compare-combat.mjs?time='+Date.now());
