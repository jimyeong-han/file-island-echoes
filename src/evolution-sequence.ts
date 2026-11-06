export type EvolutionPhase='device'|'signal'|'data'|'reveal'|'complete';
/** The score uses these same cue points: 150 BPM, two beats per opening stage. */
export const EVOLUTION_TIMING={signal:800,data:1600,reveal:3200,complete:5600} as const;
export interface EvolutionPorts {
  score: (forced:boolean,signal:AbortSignal)=>Promise<boolean>;
  stopScore:()=>void;
  frame:(phase:EvolutionPhase)=>void;
}
/** Presentation only: no Run, RNG, evolution cost, or storage access. */
export class EvolutionSequence {
  phase:EvolutionPhase='complete';
  running=false;
  private generation=0;
  private abort?:AbortController;
  private timers:ReturnType<typeof setTimeout>[]=[];
  constructor(private ports:EvolutionPorts){}
  private frame(phase:EvolutionPhase){this.phase=phase;this.ports.frame(phase);}
  async start(forced=false,reduced=false){
    this.finish();const token=++this.generation;this.running=true;this.abort=new AbortController();
    this.frame('device');
    if(reduced){this.timers.push(setTimeout(()=>this.finish(),180));return;}
    // Audio starts on decode completion; its matching visual clock starts in this microtask.
    // Locked/muted/failed/slow audio returns promptly and never holds up the reveal.
    try{await this.ports.score(forced,this.abort.signal);}catch{/* Visual progression remains available. */}
    if(token!==this.generation)return;
    for(const [phase,delay] of Object.entries(EVOLUTION_TIMING))this.timers.push(setTimeout(()=>{
      if(token!==this.generation)return;
      if(phase==='complete')this.finish();else this.frame(phase as EvolutionPhase);
    },delay));
  }
  finish(){
    this.generation++;this.abort?.abort();this.abort=undefined;
    this.timers.forEach(clearTimeout);this.timers=[];this.running=false;
    this.ports.stopScore();this.frame('complete');
  }
}
