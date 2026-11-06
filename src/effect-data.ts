import {CARDS, ENEMIES} from './data';

export type EffectKind = 'flame'|'bolt'|'vine'|'water'|'claw'|'arrow'|'missile'|'wave'|'fist'|'shard'|'gate'|'dark'|'wind';
export type EffectSpec = {kind:EffectKind;color:string;accent:string;shots:number;variant:number;travel:number;impact:number;audio:string};
const palettes = {
 fire:['#ff934a','#fff2b3'],blue:['#65b9ff','#e0f6ff'],gold:['#ffe083','#fffbe2'],green:['#86d986','#e5ffc5'],
 violet:['#bd86ef','#f4c6ec'],cyan:['#75e5e4','#efffff'],rose:['#ee91bb','#fff1da'],steel:['#a2c8d6','#fff4c7'],
} as const;
type Palette=keyof typeof palettes;
type Row=[EffectKind,Palette,number,number];
// ID-level art direction. Shots are visual accents; damage is always the engine's total.
export const CARD_EFFECT_ROWS:Record<string,Row>={
 claw:['claw','steel',2,0],flame:['flame','fire',1,0],courage:['fist','gold',1,1],rush:['fist','fire',1,2],ember:['flame','fire',3,3],
 nova:['flame','fire',1,4],missile:['missile','steel',3,5],zero:['missile','violet',1,6],
 blue:['flame','blue',1,1],link:['claw','blue',2,2],'blue-plus':['flame','blue',2,4],'wolf-claw':['claw','steel',3,5],
 feather:['flame','rose',2,1],wind:['wind','cyan',1,2],'flare-wing':['wave','fire',2,3],'meteor-wing':['shard','fire',3,4],'shadow-wing':['wave','rose',3,5],
 shock:['bolt','gold',1,0],chain:['bolt','cyan',3,2],probe:['arrow','gold',1,3],'mega-blaster':['bolt','cyan',1,4],'horn-buster':['bolt','gold',2,5],
 ivy:['vine','violet',2,0],bind:['vine','green',2,2],garden:['vine','rose',3,3],needle:['shard','green',3,4],'flower-cannon':['wave','rose',1,5],
 fish:['water','cyan',3,0],harpoon:['arrow','blue',1,2],'harpoon-plus':['missile','blue',3,4],hammer:['fist','gold',1,5],
 bubble:['wind','cyan',1,0],dawn:['arrow','gold',1,2],'heavens-knuckle':['fist','gold',1,4],'holy-gate':['gate','gold',1,5],
 cat:['claw','rose',2,1],moon:['claw','violet',1,2],'cat-resonant':['claw','gold',3,4],'holy-arrow':['arrow','gold',2,5],
};
// Each row follows the enemy's stable pattern slot, including non-damage actions.
export const ENEMY_EFFECT_ROWS:Record<string,Row[]>={
 kuwaga:[['claw','steel',2,0],['gate','steel',1,1],['fist','rose',1,2]],
 elec:[['bolt','gold',1,1],['bolt','violet',1,2],['bolt','cyan',3,3]],
 shellmon:[['gate','rose',1,0],['water','blue',1,4],['vine','rose',2,3]],
 seadramon:[['wave','blue',1,1],['shard','cyan',3,2],['wave','steel',1,3]],
 meramon:[['flame','fire',3,0],['fist','fire',1,1],['wave','fire',2,2]],
 nume:[['water','green',3,1],['gate','green',1,2],['fist','green',1,3]],
 monochromon:[['gate','fire',1,1],['missile','fire',2,2],['gate','steel',1,3]],
 unimon:[['wind','violet',1,1],['wave','gold',1,2],['fist','steel',1,3]],
 frigimon:[['fist','cyan',1,0],['wind','blue',2,1],['shard','blue',3,2]],
 mojyamon:[['claw','steel',2,3],['gate','cyan',1,4],['shard','cyan',1,5]],
 centarumon:[['gate','gold',1,0],['arrow','fire',1,5],['gate','steel',1,2]],
 bakemon:[['dark','violet',2,1],['claw','violet',1,2],['dark','steel',1,3]],
 gazimon:[['wave','violet',1,1],['claw','violet',2,3],['fist','steel',1,4]],
 cockatrimon:[['arrow','violet',1,1],['wave','steel',2,2],['fist','rose',1,5]],
 raremon:[['water','violet',2,1],['gate','violet',1,3],['wave','green',2,4]],
 'dark-tyrannomon':[['flame','violet',2,1],['flame','fire',1,5],['wave','violet',2,3]],
 'demi-devimon':[['wind','violet',1,1],['arrow','violet',3,3],['gate','violet',1,5]],
 andromon:[['gate','cyan',1,0],['claw','cyan',3,5],['gate','steel',1,4]],
 ogre:[['fist','steel',1,3],['wave','green',1,2],['fist','green',1,5]],
 leomon:[['fist','gold',1,2],['gate','violet',1,2],['gate','gold',1,4],['claw','gold',2,5]],
 phantomon:[['dark','violet',2,0],['claw','violet',1,1],['claw','violet',1,6]],
 devimon:[['claw','violet',3,6],['gate','violet',2,5],['dark','rose',2,4],['wave','violet',3,6]],
 etemon:[['wave','rose',3,1],['bolt','violet',3,6],['wind','violet',2,4],['wave','gold',3,5]],
 myotismon:[['dark','rose',3,5],['gate','violet',2,4],['dark','violet',2,2],['shard','violet',3,6]],
};
function spec(row:Row,audio:string):EffectSpec {
 const [kind,palette,shots,variant]=row,[color,accent]=palettes[palette];
 return {kind,color,accent,shots,variant,travel:220+variant*15,impact:190+shots*35,audio};
}
export const DEFAULT_EFFECT=spec(['wave','steel',1,0],'hit-normal');
export const cardEffectSpec=(id:string)=>CARD_EFFECT_ROWS[id]?spec(CARD_EFFECT_ROWS[id],CARDS[id]?.audioId||'hit-normal'):DEFAULT_EFFECT;
export const enemyEffectKey=(id:string,step:number)=>`${id}:${step%Math.max(1,ENEMIES[id]?.pattern.length||1)}`;
export function enemyEffectSpec(id:string,step:number){const row=ENEMY_EFFECT_ROWS[id]?.[step%Math.max(1,ENEMIES[id]?.pattern.length||1)];return row?spec(row,ENEMIES[id]?.audioId||({flame:'attack-fire',bolt:'attack-electric',vine:'attack-plant',water:'attack-water',dark:'attack-dark',arrow:'attack-light'} as Partial<Record<EffectKind,string>>)[row[0]]||'hit-normal'):DEFAULT_EFFECT;}
