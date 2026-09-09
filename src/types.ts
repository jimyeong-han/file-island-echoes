export type Form = 'agumon' | 'greymon' | 'metal' | 'skull';
export type CardId = 'flame'|'guard'|'cheer'|'food'|'analysis'|'sora'|'light'|'courage'|'claw'|'matt'|'mimi'|'joe'|'hope'|'nova'|'missile'|'zero';
export interface Card { name:string; cost:number; kind:'attack'|'guard'|'support'; text:string; damage?:number; block?:number; heal?:number; draw?:number; energy?:number; weak?:number; relief?:number; cleanse?:number; self?:number; burden?:number; all?:boolean }
export interface Intent { type:'attack'|'defend'|'corrupt'|'drain'; value:number; label:string }
export interface EnemyDef { name:string; hp:number; color:string; shape:string; description:string; pattern:Intent[] }
export interface Enemy { id:string; hp:number; maxHp:number; block:number; weak:number; step:number }
export interface Battle { enemies:Enemy[]; hand:CardId[]; draw:CardId[]; discard:CardId[]; energy:number; block:number; turn:number; target:number; log:string[] }
export type NodeType = 'battle'|'elite'|'event'|'rest'|'boss';
export interface MapNode { id:string; name:string; type:NodeType; note:string; enemies?:string[]; event?:string }
export interface Choice { label:string; text:string; hp?:number; energy?:number; bond?:number; burden?:number; corruption?:number; card?:CardId; supplies?:number }
export interface Story { title:string; speaker:string; quote:string; body:string; choices:Choice[] }
export interface Run { seed:number; screen:'map'|'battle'|'event'|'rest'|'reward'|'evolution'|'result'; row:number; path:string[]; node:string|null; hp:number; maxHp:number; form:Form; evoEnergy:number; bond:number; burden:number; corruption:number; supplies:number; deck:CardId[]; battle:Battle|null; rewards:CardId[]; won:boolean; battles:number; started:number; evolvedFrom?:Form; lastEvent?:string }
export interface Archive { forms:Form[]; enemies:string[]; events:string[]; zones:number[]; runs:number; wins:number; best:number }
export interface Settings { muted:boolean; reducedMotion:boolean; guide:boolean }
export interface Save { version:1; run:Run|null; archive:Archive; settings:Settings }
