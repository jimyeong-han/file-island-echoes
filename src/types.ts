export const CHARACTER_IDS = ['tai','matt','sora','koushiro','mimi','joe','tk','kari'] as const;
export type CharacterId = typeof CHARACTER_IDS[number];
export type ChapterId = 'file'|'server'|'city';
export type Form = string;
export type CardId = string;
export type CardKind = 'attack'|'guard'|'support';
export interface Card {
 audioId?:string; name:string; cost:number; kind:CardKind; text:string; owner?:CharacterId; keywords?:string[]; rarity?:'basic'|'uncommon'|'evolved'; stage?:number;
 damage?:number; block?:number; heal?:number; draw?:number; energy?:number; weak?:number; relief?:number; cleanse?:number; self?:number; burden?:number; all?:boolean;
 burn?:number; root?:number; shock?:number; expose?:number; mark?:number; regen?:number; thorns?:number; growth?:number; stock?:number; hope?:number; dispel?:boolean;
 scaling?:'block'|'combo'|'growth'|'stock'|'hope'|'light'; exhaust?:boolean;
}
export interface CrestAbilityDefinition { audioId?:string; name:string; text:string; condition:string; modes?:{id:string;name:string;text:string}[] }
export interface CharacterDefinition {
 id:CharacterId; name:string; partner:string; crest:string; icon:string; color:string; style:string; passive:string; difficulty:string; keywords:string[];
 forms:Form[]; startDeck:CardId[]; exclusive:CardId[]; ability:CrestAbilityDefinition;
 intro:string; retry:string; ending:string; preboss:string;
}
export interface FormDefinition { name:string; tag:string; description:string; hp:number; bonus:number; stage:0|1|2; owner:CharacterId; art:string; basic:CardId; upgraded:CardId; accent:string }
export interface EvolutionDefinition { from:Form;to:Form;energy:number;bond:number;burden:number;condition:string;resonance?:boolean }
export type IntentType='attack'|'defend'|'corrupt'|'drain'|'burn'|'tax'|'weaken'|'seal'|'summon'|'charge'|'curse'|'shuffle';
export interface Intent {type:IntentType;value:number;label:string;hits?:number;extra?:IntentType;amount?:number;spawn?:string}
export interface EnemyDef {audioId?:string;name:string;hp:number;color:string;shape:string;description:string;pattern:Intent[];rank:'normal'|'elite'|'boss';chapters:ChapterId[];regions:string[];feature:string;resist:{burn:number;weak:number;root:number};purifiable:boolean;encounter:string;victory:string;art:string}
export interface Enemy {id:string;hp:number;maxHp:number;block:number;weak:number;step:number;burn:number;root:number;shock:number;exposed:number;mark:number;power:number}
export interface AbilityState {firstAttack:boolean;firstGuard:boolean;lastKind:CardKind|null;combo:number;growth:number;stock:number;hope:number;light:number;attacks:number;supports:number;crestUsed:boolean;crestBuff:number;retained:CardId[];regen:number;thorns:number;weak:number;burn:number;tax:number;sealed:number;discardNext:number;lastStand:boolean}
export interface Battle {enemies:Enemy[];hand:CardId[];draw:CardId[];discard:CardId[];exhausted:CardId[];energy:number;block:number;turn:number;target:number;log:string[];ability:AbilityState}
export type NodeType='battle'|'elite'|'event'|'rest'|'boss';
export interface MapNode {id:string;name:string;type:NodeType;note:string;enemies?:string[];pool?:string[][];event?:string}
export interface Choice {label:string;text:string;hp?:number;energy?:number;bond?:number;burden?:number;corruption?:number;card?:CardId;supplies?:number;flag?:string}
export interface Story {title:string;speaker:string;quote:string;body:string;choices:Choice[];owner?:CharacterId;portrait?:string;npc?:string[]}
export interface ChapterDefinition {id:ChapterId;name:string;subtitle:string;boss:string;previous:ChapterId|null;zones:string[];backgrounds:number[];intro:string;ending:string;map:MapNode[][]}
export interface Run {seed:number;screen:'intro'|'map'|'battle'|'event'|'rest'|'reward'|'evolution'|'result';characterId:CharacterId;chapterId:ChapterId;row:number;path:string[];node:string|null;hp:number;maxHp:number;form:Form;evoEnergy:number;bond:number;burden:number;corruption:number;supplies:number;deck:CardId[];battle:Battle|null;rewards:CardId[];won:boolean;battles:number;started:number;storyFlags:string[];evolvedFrom?:Form;legacyEvent?:string;lastEvent?:string;lastVictory?:string;outcome:'active'|'victory'|'defeat'|'retreat'}
export interface Archive {forms:Form[];enemies:string[];events:string[];zones:number[];runs:number;wins:number;best:number;clears:Partial<Record<CharacterId,ChapterId[]>>;endings:string[]}
export interface Settings {masterVolume:number;musicVolume:number;sfxVolume:number;muted:boolean;reducedMotion:boolean;guide:boolean}
export interface Save {version:2;run:Run|null;archive:Archive;settings:Settings}
