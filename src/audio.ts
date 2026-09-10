import rawManifest from './audio-manifest.json';
import type { Settings } from './types';

export interface AudioCue {
  label: string; kind: 'music'|'stinger'|'sfx'; files: string[]; volume: number;
  loop: boolean; duration: number; limit: number; cooldown: number; variation: number; fade: number;
}
export const AUDIO = rawManifest as Record<string, AudioCue>;
export const PRIORITY_SFX = ['ui-confirm','ui-select','ui-cancel','ui-denied','card-select','card-attack','card-guard','card-support','node-select','energy-low'] as const;
/** Lossy codecs can introduce an endpoint offset. Correct 2 ms, preserving tempo/tails. */
export function smoothLoopEdge(samples: Float32Array, length: number, window=64) {
  const end=Math.min(samples.length,Math.max(0,length));if(end<window*2)return;
  const correction=(samples[end-1]-samples[0])/2;
  for(let i=0;i<window;i++){
    const amount=correction*(.5+.5*Math.cos(Math.PI*i/(window-1)));
    samples[i]+=amount;samples[end-1-i]-=amount;
  }
}
type Voice = { source: AudioBufferSourceNode; gain: GainNode; id: string; group: string; started: number; offset: number; stopping?: boolean };
export interface AudioStatus { enabled: boolean; playing: string; loading: boolean; failed: number; voices: number; musicVoices: number; context: string; level: number; lastCue: string; musicStarts: number }

/** One lazy mixer. No context or download before a gesture. */
export class AudioManager {
  private ctx?: AudioContext;
  private master?: GainNode;
  private musicBus?: GainNode;
  private sfxBus?: GainNode;
  private duckBus?: GainNode;
  private analyser?: AnalyserNode;
  private groupEpoch = new Map<string,number>();
  private settings: Settings;
  private hidden = false;
  private desired: string|null = null;
  private current?: Voice;
  private voices = new Set<Voice>();
  private buffers = new Map<string, AudioBuffer>();
  private pending = new Map<string, Promise<AudioBuffer|null>>();
  private failed = new Set<string>();
  private positions = new Map<string, number>();
  private lastPlayed = new Map<string, number>();
  private pendingVoices = new Map<string, number>();
  private musicRequest = 0;
  private effectEpoch = 0;
  private duckUntil = 0;
  private formats?: string[];
  private loading = false;
  private lastCue = '';
  private musicStarts = 0;
  private activation?: Promise<void>;
  private preparation?: Promise<void>;
  onStatus?: (status: AudioStatus) => void;

  constructor(settings: Settings, private catalog: Record<string, AudioCue> = AUDIO) { this.settings = {...settings}; }
  get status(): AudioStatus {
    let level=0;
    if(this.analyser&&this.ctx?.state==='running'&&!this.settings.muted){const samples=new Float32Array(this.analyser.fftSize);this.analyser.getFloatTimeDomainData(samples);level=Math.sqrt(samples.reduce((sum,n)=>sum+n*n,0)/samples.length);}
    return {enabled: !this.settings.muted, playing: this.current?.id || '', loading: this.loading,
      failed: this.failed.size, voices: this.voices.size, musicVoices: [...this.voices].filter(v=>this.catalog[v.id].loop).length,
      context: this.ctx?.state || 'locked',level,lastCue:this.lastCue,musicStarts:this.musicStarts};
  }
  private report() { this.onStatus?.(this.status); }
  private ramp(param: AudioParam, value: number, seconds = .06) {
    const t=this.ctx!.currentTime;
    param.cancelScheduledValues(t); param.setValueAtTime(param.value,t); param.linearRampToValueAtTime(value,t+seconds);
  }
  configure(settings: Settings) {
    const wasMuted=this.settings.muted; this.settings={...settings};
    if (this.ctx) {
      this.ramp(this.master!.gain,settings.muted?0:settings.masterVolume);
      this.ramp(this.musicBus!.gain,settings.musicVolume);
      this.ramp(this.sfxBus!.gain,settings.sfxVolume);
      if(settings.muted&&!wasMuted) this.stopEffects();
      if(!settings.muted&&wasMuted) void this.refreshMusic();
    }
    this.report();
  }
  async unlock() {
    if(this.settings.muted||this.hidden) return;
    try {
      if(!this.ctx) {
        const Constructor=globalThis.AudioContext || (globalThis as typeof globalThis & {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
        if(!Constructor)return;
        this.ctx=new Constructor(); this.master=this.ctx.createGain(); this.musicBus=this.ctx.createGain(); this.sfxBus=this.ctx.createGain(); this.duckBus=this.ctx.createGain();
        const limiter=this.ctx.createDynamicsCompressor();
        limiter.threshold.value=-5;limiter.knee.value=6;limiter.ratio.value=8;limiter.attack.value=.004;limiter.release.value=.18;
        this.analyser=this.ctx.createAnalyser();this.analyser.fftSize=512;
        this.musicBus.connect(this.duckBus).connect(this.master);this.sfxBus.connect(this.master);this.master.connect(limiter).connect(this.analyser).connect(this.ctx.destination);
        this.master.gain.value=this.settings.masterVolume;this.musicBus.gain.value=this.settings.musicVolume;this.sfxBus.gain.value=this.settings.sfxVolume;
        const probe=new Audio();this.formats=probe.canPlayType('audio/ogg; codecs="vorbis"')?['ogg','mp3']:['mp3','ogg'];
      }
      if(this.ctx.state!=='running') {
        this.activation ??= this.ctx.resume().finally(()=>{this.activation=undefined;});
        await this.activation;
      }
      // Small interaction cues enter the request queue before any soundtrack.
      this.preparation ??= this.preload(PRIORITY_SFX);
      await this.preparation;
      void this.refreshMusic(); this.report();
    } catch { this.report(); /* Autoplay refusal never blocks the game. */ }
  }
  async visibility(hidden: boolean) {
    this.hidden=hidden; this.effectEpoch++;
    if(!this.ctx)return;
    try {
      if(hidden) {this.stopEffects();this.ramp(this.master!.gain,0,.08);await this.ctx.suspend();}
      else if(!this.settings.muted) {await this.ctx.resume();this.ramp(this.master!.gain,this.settings.masterVolume,.3);void this.refreshMusic();}
    } catch { /* A later input can resume a context interrupted by the OS. */ }
    this.report();
  }
  /** Speculative failures do not poison the real-play failure cache. */
  async preload(ids: readonly string[] = PRIORITY_SFX) {
    if(!this.ctx||this.hidden||this.settings.muted)return;
    await Promise.all(ids.filter(id=>this.catalog[id]?.kind==='sfx').map(id=>this.load(id,true)));
  }
  playInput(id: string) {
    if(this.settings.muted||this.hidden)return;
    // Start a cached sound in this event's stack, before a full UI render.
    if(this.ctx?.state==='running'){void this.play(id);return;}
    // Resume must be invoked within the gesture; preparation never blocks the UI.
    void this.unlock();
    const ready=this.activation||Promise.resolve();
    void ready.then(()=>this.play(id)).catch(()=>{});
  }
  private async load(id: string, speculative=false): Promise<AudioBuffer|null> {
    const cached=this.buffers.get(id);if(cached){this.buffers.delete(id);this.buffers.set(id,cached);return cached;}
    if(this.pending.has(id)){
      const task=this.pending.get(id)!,result=await task;
      // A real request joining a failed preload gets its own codec retry.
      if(!result&&!speculative&&!this.failed.has(id)){if(this.pending.get(id)===task)this.pending.delete(id);return this.load(id);}
      return result;
    }
    if(this.failed.has(id)||!this.ctx||!this.catalog[id])return null;
    const promise=(async()=>{
      const cue=this.catalog[id];
      for(const format of this.formats||['ogg','mp3']) {
        const file=cue.files.find(f=>f.endsWith('.'+format));if(!file)continue;
        const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
        try {
          const response=await fetch(import.meta.env.BASE_URL+'assets/audio/'+file,{signal:controller.signal});
          if(!response.ok)continue;
          const buffer=await this.ctx!.decodeAudioData(await response.arrayBuffer());
          if(cue.loop)for(let channel=0;channel<buffer.numberOfChannels;channel++)smoothLoopEdge(buffer.getChannelData(channel),Math.round(cue.duration*buffer.sampleRate),Math.round(.002*buffer.sampleRate));
          this.buffers.set(id,buffer);this.trimCache();return buffer;
        } catch { /* Try the alternate codec once. */ } finally {clearTimeout(timeout);}
      }
      if(!speculative)this.failed.add(id);this.report();return null;
    })();
    this.pending.set(id,promise);
    try{return await promise;}finally{if(this.pending.get(id)===promise)this.pending.delete(id);}
  }
  private trimCache() {
    const music=[...this.buffers.keys()].filter(k=>this.catalog[k].loop);
    while(music.length>3){const index=music.findIndex(k=>k!==this.current?.id&&k!==this.desired);if(index<0)break;this.buffers.delete(music.splice(index,1)[0]);}
  }
  setMusic(id: string|null) {
    if(id===this.desired){if(id&&!this.current&&!this.loading)void this.refreshMusic();return;}
    this.desired=id;this.musicRequest++;
    if(!id){if(this.current)this.fadeOut(this.current,.45);this.current=undefined;this.loading=false;this.report();return;}
    void this.refreshMusic();
  }
  private async refreshMusic() {
    if(!this.ctx||this.ctx.state!=='running'||this.settings.muted||this.hidden||!this.desired||this.current?.id===this.desired)return;
    // configure/sync can run while the activation preparation is still pending.
    if(this.preparation)await this.preparation;
    if(this.settings.muted||this.hidden||!this.desired||this.current?.id===this.desired)return;
    const id=this.desired,request=++this.musicRequest;this.loading=true;this.report();
    const buffer=await this.load(id);
    if(request!==this.musicRequest)return;
    this.loading=false;
    if(!buffer||this.hidden||this.settings.muted){this.report();return;}
    for(const voice of this.voices)if(this.catalog[voice.id].loop&&voice!==this.current){try{voice.source.stop();}catch{/* Ended. */}}
    if(this.current)this.fadeOut(this.current,this.catalog[id].fade);
    const cue=this.catalog[id],offset=(this.positions.get(id)||0)%Math.min(cue.duration,buffer.duration);
    this.current=this.startVoice(id,buffer,'music',0,offset);
    this.ramp(this.current.gain.gain,cue.volume,cue.fade);this.trimCache();this.report();
  }
  private startVoice(id: string, buffer: AudioBuffer, group: string, delay=0, offset=0): Voice {
    const ctx=this.ctx!,cue=this.catalog[id],source=ctx.createBufferSource(),gain=ctx.createGain();
    source.buffer=buffer;source.loop=cue.loop;source.loopStart=0;source.loopEnd=Math.min(cue.duration,buffer.duration);
    const variation=cue.variation;
    source.playbackRate.value=cue.loop?1:1+(Math.random()-.5)*variation;
    gain.gain.value=cue.loop?0:cue.volume*(1+(Math.random()-.5)*variation);
    source.connect(gain).connect(cue.loop?this.musicBus!:this.sfxBus!);
    const voice={source,gain,id,group,started:ctx.currentTime+delay,offset};this.voices.add(voice);
    this.lastCue=id;if(cue.loop)this.musicStarts++;
    source.onended=()=>{this.voices.delete(voice);source.disconnect();gain.disconnect();this.report();};
    source.start(voice.started,offset);return voice;
  }
  private fadeOut(voice: Voice, fade: number) {
    if(voice.stopping)return;voice.stopping=true;
    if(this.catalog[voice.id].loop)this.positions.set(voice.id,voice.offset+Math.max(0,this.ctx!.currentTime-voice.started));
    this.ramp(voice.gain.gain,0,fade);
    try{voice.source.stop(this.ctx!.currentTime+fade+.02);}catch{/* Already ended. */}
  }
  async play(id: string, delay=0, group='effects') {
    const ctx=this.ctx,cue=this.catalog[id];
    if(!ctx||ctx.state!=='running'||this.settings.muted||this.settings.sfxVolume===0||this.hidden||!cue||cue.loop)return;
    const now=ctx.currentTime;
    const count=[...this.voices].filter(v=>v.id===id&&!v.stopping).length+(this.pendingVoices.get(id)||0);
    if(count>=cue.limit||now-(this.lastPlayed.get(id)??-999)<cue.cooldown||(this.voices.size>=12&&cue.kind!=='stinger'))return;
    this.lastPlayed.set(id,now);this.pendingVoices.set(id,(this.pendingVoices.get(id)||0)+1);
    const epoch=this.effectEpoch,groupEpoch=this.groupEpoch.get(group)||0;
    const cached=this.buffers.get(id),buffer=cached||await this.load(id);
    this.pendingVoices.set(id,Math.max(0,(this.pendingVoices.get(id)||1)-1));
    if(!buffer||epoch!==this.effectEpoch||groupEpoch!==(this.groupEpoch.get(group)||0)||this.hidden||this.settings.muted||ctx.state!=='running')return;
    if(this.voices.size>=12&&cue.kind==='stinger') {
      const oldest=[...this.voices].find(v=>this.catalog[v.id].kind==='sfx');
      if(oldest){try{oldest.source.stop();}catch{/* Ended. */}this.voices.delete(oldest);}
    }
    if(this.voices.size>=12)return;
    if(ctx.currentTime-now>1.5&&cue.kind==='sfx')return;
    this.startVoice(id,buffer,group,delay);
    if(cue.kind==='stinger')this.duck(cue.duration+delay);
    this.report();
  }
  private duck(seconds: number) {
    const ctx=this.ctx!;this.duckUntil=Math.max(this.duckUntil,ctx.currentTime+seconds);
    this.ramp(this.duckBus!.gain,.38,.1);
    this.duckBus!.gain.setValueAtTime(.38,this.duckUntil);this.duckBus!.gain.linearRampToValueAtTime(1,this.duckUntil+.5);
  }
  stopGroup(group: string) {this.groupEpoch.set(group,(this.groupEpoch.get(group)||0)+1);for(const v of this.voices)if(v.group===group&&!this.catalog[v.id].loop)this.fadeOut(v,.08);}
  private stopEffects() {this.effectEpoch++;for(const v of this.voices)if(!this.catalog[v.id].loop)this.fadeOut(v,.03);}
  preview() {void this.play('card-guard');void this.play('heal',.4);}
}
