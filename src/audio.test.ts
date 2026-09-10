import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {AudioManager,AUDIO,smoothLoopEdge} from './audio';
import {GameAudio,musicForScene,sceneFor,transitionCues} from './audio-events';
import {defaultSettings,loadSave,SAVE_KEY,writeSave} from './storage';
import {newRun,enterNode,playCard,crest,evolve,endTurn} from './engine';
import {CARDS,CHARACTERS} from './data';

class Param {value=1;setValueAtTime(v:number){this.value=v;}linearRampToValueAtTime(v:number){this.value=v;}cancelScheduledValues(){} }
class Node {gain=new Param();connect<T>(n:T){return n;}disconnect(){}}
class Source extends Node {
  buffer:any;loop=false;loopStart=0;loopEnd=0;playbackRate=new Param();onended?:()=>void;offset=0;started=false;
  start(_t:number,offset=0){this.offset=offset;this.started=true;}
  stop(){this.onended?.();}
}
class Context {
  static all:Context[]=[];currentTime=0;state='suspended';destination=new Node();sources:Source[]=[];
  constructor(){Context.all.push(this);}
  resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}
  createGain(){return new Node();}
  createAnalyser(){return Object.assign(new Node(),{fftSize:512,getFloatTimeDomainData:(a:Float32Array)=>a.fill(.02)});}
  createDynamicsCompressor(){return Object.assign(new Node(),{threshold:new Param(),knee:new Param(),ratio:new Param(),attack:new Param(),release:new Param()});}
  createBufferSource(){const s=new Source();this.sources.push(s);return s;}
  decodeAudioData(){return Promise.resolve({duration:90});}
}
const tick=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
const on=()=>({...defaultSettings(),muted:false});
const battle=()=>{const r=newRun(1);r.screen='map';enterNode(r,'0a');return r;};
beforeEach(()=>{vi.stubEnv('BASE_URL','/file-island-echoes/');Context.all=[];vi.stubGlobal('AudioContext',Context);vi.stubGlobal('Audio',class {canPlayType(){return 'probably';}});vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)})));});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();vi.useRealTimers();});

describe('audio mixer lifecycle',()=>{
  it('removes codec endpoint offsets without changing duration or the musical body',()=>{
    const samples=Float32Array.from({length:1000},(_,i)=>Math.sin(i*.1)*.3),original=samples.slice();
    smoothLoopEdge(samples,samples.length);expect(Math.abs(samples[0]-samples.at(-1)!)).toBeLessThan(1e-7);expect(samples.slice(64,-64)).toEqual(original.slice(64,-64));expect(samples.length).toBe(original.length);
  });
  it('does not create a context or fetch before an explicit gesture, including saved unmuted settings',async()=>{
    const a=new AudioManager(on());a.setMusic('music-title');await a.play('ui-confirm');expect(Context.all).toHaveLength(0);expect(fetch).not.toHaveBeenCalled();
    await a.unlock();await tick();expect(Context.all).toHaveLength(1);expect(a.status.playing).toBe('music-title');expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('reuses a song through UI renders and resumes its position after a crossfade',async()=>{
    const a=new AudioManager(on());a.setMusic('music-title');await a.unlock();await tick();const ctx=Context.all[0];ctx.currentTime=18;
    for(let i=0;i<10;i++)a.setMusic('music-title');await tick();expect(ctx.sources).toHaveLength(1);
    a.setMusic('music-battle');await tick();a.setMusic('music-title');await tick();expect(ctx.sources.at(-1)?.offset).toBe(18);expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('keeps only the latest music request when asynchronous downloads finish out of order',async()=>{
    let release:(r:any)=>void=()=>{};vi.stubGlobal('fetch',vi.fn((url:string)=>url.includes('music-title')?new Promise(r=>release=r):Promise.resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)})));
    const a=new AudioManager(on());a.setMusic('music-title');await a.unlock();a.setMusic('music-boss');await tick();release({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});await tick();expect(a.status.playing).toBe('music-boss');expect(Context.all[0].sources).toHaveLength(1);
  });
  it('caps identical pending/playing effects and ignores queued scene sounds after leaving',async()=>{
    const a=new AudioManager(on());await a.unlock();for(let i=0;i<25;i++)void a.play('card-attack');await tick();expect(a.status.voices).toBe(1);
    Context.all[0].currentTime=.2;await a.play('card-attack');Context.all[0].currentTime=.4;await a.play('card-attack');expect(a.status.voices).toBe(2);
    let release:(r:any)=>void=()=>{};vi.stubGlobal('fetch',()=>new Promise(r=>release=r));void a.play('evolution-start',0,'scene');a.stopGroup('scene');release({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});await tick();expect(a.status.voices).toBe(2);
  });
  it('suspends in the background, resumes once, and respects mute while returning',async()=>{
    const a=new AudioManager(on());a.setMusic('music-title');await a.unlock();await tick();await a.visibility(true);expect(a.status.context).toBe('suspended');await a.play('ui-confirm');expect(a.status.voices).toBe(1);
    await a.visibility(false);await tick();expect(a.status.context).toBe('running');expect(Context.all[0].sources).toHaveLength(1);
    a.configure({...on(),muted:true});await a.visibility(true);await a.visibility(false);expect(a.status.context).toBe('suspended');
  });
  it('tries an alternate codec and caches successful decoding',async()=>{
    vi.stubGlobal('fetch',vi.fn(async(url:string)=>({ok:!url.endsWith('.ogg'),arrayBuffer:async()=>new ArrayBuffer(8)})));
    const a=new AudioManager(on());a.setMusic('music-title');await a.unlock();await tick();expect(a.status.playing).toBe('music-title');expect(fetch).toHaveBeenCalledTimes(2);
    expect(vi.mocked(fetch).mock.calls.every(c=>String(c[0]).startsWith('/file-island-echoes/assets/audio/'))).toBe(true);
  });
  it('swallows network/decoder failures and never retries a failing cue on each render',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>{throw Error('offline');}));const a=new AudioManager(on());a.setMusic('music-title');await a.unlock();await tick();
    expect(a.status.failed).toBe(1);for(let i=0;i<5;i++)a.setMusic('music-title');await tick();expect(fetch).toHaveBeenCalledTimes(2);expect(a.status.playing).toBe('');
    const r=battle();const id=r.battle!.hand[0];const old=r.battle!.energy;playCard(r,0);expect(r.battle!.energy).toBe(old-CARDS[id].cost);
  });
});

describe('game sound direction and persistent settings',()=>{
  it('covers all screens, regions, battle ranks and three boss orchestrations',()=>{
    const r=battle();expect(sceneFor('title','',r)).toBe('title');expect(sceneFor('detail','',r)).toBe('character-select');expect(sceneFor('game','archive',r)).toBe('character-select');
    expect(sceneFor('game','',r)).toBe('normal-battle');r.row=4;r.node='4b';expect(sceneFor('game','',r)).toBe('elite-battle');r.row=10;r.node='10a';
    for(const chapter of ['file','server','city'] as const){r.chapterId=chapter;expect(AUDIO[musicForScene(sceneFor('game','',r))!]).toBeDefined();}
    r.chapterId='file';r.screen='map';for(const row of [1,4,8]){r.row=row;expect(['forest','factory','mountain']).toContain(sceneFor('game','',r));}
    r.screen='event';expect(sceneFor('game','',r)).toBe('story');r.screen='result';r.won=true;expect(sceneFor('game','',r)).toBe('ending');r.won=false;expect(sceneFor('game','',r)).toBe('defeat');
  });
  it('plays crest readiness and actual use, not an ability details preview',()=>{
    const r=battle();r.battle!.ability.attacks=1;r.battle!.hand=['flame'];r.battle!.energy=3;const before=structuredClone(r);playCard(r,0);
    expect(transitionCues(before,r,'card:0').map(c=>c.id)).toContain('crest-ready');const ready=structuredClone(r);crest(r);expect(transitionCues(ready,r,'crest').map(c=>c.id)).toContain('crest-tai');
    expect(transitionCues(r,r,'ability')).toEqual([]);
  });
  it('uses card metadata, truthful damage/cleanup cues, and exhausted-draw reshuffle cues',()=>{
    const r=battle();r.battle!.hand=['ember'];r.battle!.energy=3;let before=structuredClone(r);playCard(r,0);let ids=transitionCues(before,r,'card:0').map(c=>c.id);expect(ids).toContain('attack-fire');expect(ids).toContain('enemy-hit');expect(ids).toContain('status-apply');
    r.battle!.draw=[];r.battle!.discard=['guard','flame'];before=structuredClone(r);endTurn(r);expect(transitionCues(before,r,'end').map(c=>c.id)).toContain('deck-shuffle');
    for(const c of Object.values(CARDS))if(c.audioId)expect(AUDIO[c.audioId]).toBeDefined();for(const c of Object.values(CHARACTERS))expect(AUDIO[c.ability.audioId!]).toBeDefined();
  });
  it('evolution uses a one-shot and cancels its delayed context when the player leaves',async()=>{
    vi.useFakeTimers();const a=new GameAudio(on());await a.mixer.unlock();const r=newRun(1);r.screen='map';r.evoEnergy=10;evolve(r,'greymon');a.sync('game','',r,null);await tick();expect(a.mixer.status.musicVoices).toBe(0);
    r.screen='reward';a.sync('game','',r,null);a.sync('title','',r,null);await tick();await vi.advanceTimersByTimeAsync(5000);expect(a.mixer.status.playing).toBe('music-title');
  });
  it('adds volume defaults to old saves, clamps damaged numbers and round-trips all settings',()=>{
    const old={version:2,run:null,archive:{},settings:{muted:false,guide:true,reducedMotion:false}};
    const s=loadSave({getItem:()=>JSON.stringify(old)}).save;expect(s.settings).toMatchObject({masterVolume:.8,musicVolume:.65,sfxVolume:.8,muted:false});
    s.settings.masterVolume=.37;s.settings.musicVolume=0;s.settings.sfxVolume=.92;let raw='';writeSave(s,{setItem:(_k,v)=>raw=v});expect(loadSave({getItem:k=>k===SAVE_KEY?raw:null}).save.settings).toEqual(s.settings);
    const bad={...old,settings:{...old.settings,masterVolume:9,musicVolume:-3,sfxVolume:'bad'}};expect(loadSave({getItem:()=>JSON.stringify(bad)}).save.settings).toMatchObject({masterVolume:1,musicVolume:0,sfxVolume:.8});
  });
});
