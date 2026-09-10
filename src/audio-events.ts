import { AudioManager } from './audio';
import { CARDS, CHARACTERS, ENEMIES, zoneAt } from './data';
import { crestReady, harmful, intent, nodeOf } from './engine';
import type { Run, Settings } from './types';

export type GameView = 'title'|'game'|'select'|'detail'|'chapters';
export type CueEvent = { id: string; delay: number };
export function regionMusic(r: Run, zone=zoneAt(r.row)) {
  if(r.chapterId==='server')return zone===1?'music-factory':'music-map';
  if(r.chapterId==='city')return zone===0?'music-map':'music-mountain';
  return ['music-forest','music-factory','music-mountain'][zone];
}
export function sceneFor(view: GameView, modal: string, r: Run|null, zone: number|null=null): string {
  if(modal==='archive'||['select','detail'].includes(view))return 'character-select';
  if(view==='chapters')return 'map';
  if(view==='title'||!r)return 'title';
  if(r.screen==='intro'||r.screen==='event')return 'story';
  if(r.screen==='evolution')return r.form==='skull'?'evolution-forced':'evolution';
  if(r.screen==='result')return r.won?'ending':'defeat';
  if(r.screen==='reward')return 'victory:'+regionMusic(r);
  if(r.screen==='battle') {
    const type=nodeOf(r)?.type;
    return type==='boss'?'boss-battle:'+r.chapterId:type==='elite'?'elite-battle':'normal-battle';
  }
  if(r.screen==='map'&&r.row===0)return 'map';
  return regionMusic(r,zone??zoneAt(r.row)).replace('music-','');
}
export function musicForScene(scene: string): string|null {
  if(scene.startsWith('victory:')||['evolution','evolution-forced','ending','defeat'].includes(scene))return null;
  if(scene.startsWith('boss-battle:'))return scene.endsWith('server')?'music-boss-etemon':scene.endsWith('city')?'music-boss-myotismon':'music-boss';
  return ({title:'music-title','character-select':'music-selection',map:'music-map',story:'music-story',forest:'music-forest',factory:'music-factory',mountain:'music-mountain','normal-battle':'music-battle','elite-battle':'music-elite'} as Record<string,string>)[scene]||'music-map';
}

/** Read-only before/after comparison; audio cannot change combat or random seeds. */
export function transitionCues(before: Run, after: Run, action: string): CueEvent[] {
  const cues:CueEvent[]=[];
  const add=(id:string,delay=0)=>{if(!cues.some(c=>c.id===id))cues.push({id,delay});};
  const old=before.battle, next=after.battle;
  if(before.screen!=='battle'&&after.screen==='battle'){add('enemy-appear');add('card-draw',.18);add('enemy-intent',.4);}
  if(action.startsWith('card:')&&old) {
    const c=CARDS[old.hand[Number(action.split(':')[1])]];
    if(c){
      add('card-'+(c.kind==='guard'?'guard':c.kind==='attack'?'attack':'support'));
      if(c.rarity==='evolved')add('card-evolved',.08);
      if(c.audioId)add(c.audioId,.06);
      if(c.damage)add(c.damage>=18?'hit-heavy':'hit-normal',.14);
      if(c.draw){add('card-draw',.24);if(old.draw.length<c.draw&&old.discard.length)add('deck-shuffle',.08);}
    }
  }
  if(action==='end'&&old) {
    if(old.hand.length)add('card-discard');
    if(after.screen==='battle') {add('card-draw',.28);add('enemy-intent',.5);if(old.draw.length<5&&old.discard.length+old.hand.length>0)add('deck-shuffle',.12);}
    const acting=old.enemies.map((e,i)=>({e,a:intent(before,i)})).filter(x=>x.e.hp>0);
    if(acting.some(x=>['corrupt','curse','drain','seal'].includes(x.a.type)))add('attack-dark',.06);
    else if(acting.some(x=>x.a.type==='burn'))add('attack-fire',.06);
    else {const attack=acting.find(x=>['attack','drain'].includes(x.a.type));if(attack)add(ENEMIES[attack.e.id].audioId||'hit-normal',.08);}
    if(next&&next.enemies.some(e=>!old.enemies.some(o=>o.id===e.id)))add('enemy-appear',.18);
  }
  if(next&&old&&before.screen==='battle') {
    if(next.block>old.block)add('block-gain',.09);
    if(old.block>0&&next.block===0&&after.hp<before.hp)add('block-break',.12);
    for(const [i,e] of next.enemies.entries()) {
      const prev=old.enemies[i];if(!prev||prev.id!==e.id)continue;
      if(e.hp<prev.hp)add('enemy-hit',.18);
      if(prev.block>0&&e.block===0)add('block-break',.14);
      if(e.hp===0&&prev.hp>0)add(ENEMIES[e.id].purifiable?'enemy-purify':'enemy-down',.25);
      if(['weak','burn','root','shock','exposed','mark'].some(k=>e[k as keyof typeof e]>prev[k as keyof typeof e]))add('status-apply',.22);
    }
    if(next.ability.crestUsed&&!old.ability.crestUsed)add(CHARACTERS[after.characterId].ability.audioId||'crest-ready');
    else if(['combo','growth','stock','hope','light'].some(k=>next.ability[k as 'combo']>old.ability[k as 'combo']))add('crest-charge',.18);
    if(crestReady(after)&&!crestReady(before))add('crest-ready',.32);
    if(harmful(after)>harmful(before))add('status-apply',.14);
    if(harmful(after)<harmful(before)&&action!=='end')add('status-cleanse',.2);
  }
  if(after.hp>before.hp)add('heal',.12);
  if(after.hp<before.hp&&before.screen==='battle')add('player-hit',.13);
  if(after.corruption>before.corruption)add('corruption-rise',.15);
  if(after.burden<before.burden)add('burden-relief',.2);
  if(after.evoEnergy>before.evoEnergy)add('evolution-energy',.25);
  if(action.startsWith('reward:'))add('card-acquire');
  if(action==='evolution-done'){add('evolution-complete');add('card-upgrade',.35);}
  return cues;
}

export class GameAudio {
  readonly mixer: AudioManager;
  private scene='';
  private timer?: ReturnType<typeof setTimeout>;
  constructor(settings: Settings) {this.mixer=new AudioManager(settings);}
  sync(view: GameView, modal: string, run: Run|null, zone: number|null) {
    const scene=sceneFor(view,modal,run,zone);if(scene===this.scene)return;
    this.scene=scene;clearTimeout(this.timer);this.mixer.stopGroup('scene');
    this.mixer.setMusic(musicForScene(scene));
    const later=(id:string,ms:number)=>{this.timer=setTimeout(()=>{if(this.scene===scene)this.mixer.setMusic(id);},ms);};
    if(scene==='evolution'||scene==='evolution-forced') {
      void this.mixer.play(scene==='evolution'?'evolution-start':'evolution-forced',0,'scene');
      void this.mixer.play('data-gather',.3,'scene');
    } else if(scene.startsWith('victory:')) {
      void this.mixer.play('battle-victory',0,'scene');void this.mixer.play('reward-reveal',.3,'scene');later(scene.slice(8),2800);
    } else if(scene==='ending'||scene==='defeat') {
      void this.mixer.play(scene==='ending'?'chapter-complete':'battle-defeat',0,'scene');later('music-story',scene==='ending'?5000:3200);
    }
  }
  transition(before: Run, after: Run, action: string, discovered=false) {
    for(const cue of transitionCues(before,after,action))void this.mixer.play(cue.id,cue.delay);
    if(discovered)void this.mixer.play('archive-unlock',.65);
  }
  action(action: string, value='') {
    if(action==='preview'&&value==='skull'){void this.mixer.play('forced-warning');return;}
    const id=action==='node'?'node-select':action==='card'?'card-select':
      ['close','home','selection'].includes(action)?'ui-cancel':
      ['select','target','order','view-zone'].includes(action)?'ui-select':'ui-confirm';
    void this.mixer.play(id);
  }
}
