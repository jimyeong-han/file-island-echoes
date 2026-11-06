import manifest from './pose-manifest.json';
import type {EffectKind} from './effect-data';

export type PoseFrame = 0|1|2|3|4|5;
export type PosePhase = 'prepare'|'travel'|'impact'|'recover';
const entries:Record<string,{path:string;size:number}>=manifest;
export const poseId=(id:string)=>id==='gatomon-resonance'?'gatomon':id;
export const hasPose=(id:string)=>!!entries[poseId(id)];
export const posePath=(id:string)=>entries[poseId(id)]?.path;
// Some generated cells retain the reference's left-facing view. Normalize at render time.
const LEFT_FACING:Record<string,number[]>={
 devimon:[0,1,2,4,5],kuwaga:[0,1,4,5],elec:[0,1],shellmon:[0,1,4],seadramon:[0,1,4],monochromon:[0,1,4],unimon:[0,1,4,5],centarumon:[0,1,2,3,4,5],
 gazimon:[0,1,5],cockatrimon:[0,1,4],bakemon:[0],raremon:[0,1,3,4,5],'dark-tyrannomon':[0,1],ogre:[0,5],leomon:[0],phantomon:[0,2,4,5],etemon:[0,1,4,5],myotismon:[0,5],
};
export const frameFacing=(id:string,frame:number)=>LEFT_FACING[poseId(id)]?.includes(frame)?'left':'right';

/** Per-body release points in the registered square pose, facing right. */
export const BODY_ORIGINS:Record<string,[number,number]>={
 agumon:[.84,.43],greymon:[.84,.42],metal:[.64,.48],skull:[.58,.16],
 gabumon:[.79,.36],garurumon:[.85,.31],'were-garurumon':[.85,.43],
 biyomon:[.75,.44],birdramon:[.76,.47],garudamon:[.79,.46],
 tentomon:[.75,.36],kabuterimon:[.80,.28],'mega-kabuterimon':[.80,.29],
 palmon:[.83,.53],togemon:[.76,.48],lillymon:[.83,.48],
 gomamon:[.81,.49],ikkakumon:[.75,.24],zudomon:[.84,.53],
 patamon:[.81,.51],angemon:[.80,.44],'magna-angemon':[.79,.46],gatomon:[.84,.50],angewomon:[.84,.43],
 devimon:[.83,.44],kuwaga:[.84,.41],elec:[.76,.39],shellmon:[.82,.49],seadramon:[.84,.33],meramon:[.84,.47],nume:[.83,.55],
 monochromon:[.84,.48],unimon:[.83,.38],frigimon:[.84,.48],mojyamon:[.84,.42],centarumon:[.85,.38],bakemon:[.83,.43],
 gazimon:[.84,.47],cockatrimon:[.76,.38],raremon:[.83,.46],'dark-tyrannomon':[.83,.32],'demi-devimon':[.78,.53],
 andromon:[.84,.43],ogre:[.83,.46],leomon:[.84,.43],phantomon:[.85,.43],etemon:[.83,.42],myotismon:[.84,.45],
};
// A technique's actual limb takes precedence over its decorative effect school.
export const TECHNIQUE_POSES:Record<string,{frame:PoseFrame;origin:[number,number]}>={
 'shellmon:2':{frame:3,origin:[.84,.50]},'seadramon:2':{frame:3,origin:[.83,.76]},
 'mojyamon:2':{frame:3,origin:[.84,.44]},'leomon:0':{frame:2,origin:[.87,.35]},
 'ogre:2':{frame:2,origin:[.87,.36]},'andromon:1':{frame:3,origin:[.88,.42]},
 'phantomon:2':{frame:3,origin:[.87,.43]},'etemon:0':{frame:2,origin:[.86,.38]},
};
export function attackFrame(kind:EffectKind,key=''):PoseFrame{return TECHNIQUE_POSES[key]?.frame??(kind==='claw'||kind==='fist'?3:2);}
export function poseFrame(phase:PosePhase,kind:EffectKind,key=''):PoseFrame{
 return phase==='prepare'?1:phase==='recover'?5:attackFrame(kind,key);
}
export function bodyOrigin(id:string,kind:EffectKind,enemy:boolean,width:number,height:number,key=''){
 const point=TECHNIQUE_POSES[key]?.origin??((kind==='claw'||kind==='fist')?[.84,.50]:BODY_ORIGINS[poseId(id)]||[.76,.44]);
 const size=Math.min(width,height),left=(width-size)/2,top=(height-size)/2;
 return {x:left+(enemy?1-point[0]:point[0])*size,y:top+point[1]*size};
}
export function poseMarkup(id:string,name:string,extra:string,fallback:string){
 const entry=entries[poseId(id)];if(!entry)return fallback;
 const url=`${import.meta.env.BASE_URL}assets/${entry.path}`,s=entry.size;
 return `<span class="sprite battle-pose ${extra} form-${id}" data-pose="${poseId(id)}" data-frame="0" role="img" aria-label="${name}"><span class="pose-fallback" aria-hidden="true">${fallback}</span><svg class="pose-art" viewBox="0 0 ${s} ${s}" aria-hidden="true" focusable="false"><defs><clipPath id="pose-crop-${id}"><rect width="${s}" height="${s}"/></clipPath></defs><g clip-path="url(#pose-crop-${id})"><image href="${url}" width="${s*3}" height="${s*2}" x="0" y="0"/></g></svg></span>`;
}
export function setPose(el:Element|null,frame:PoseFrame){
 if(!el?.classList.contains('battle-pose'))return;
 const entry=entries[el.getAttribute('data-pose')||''];if(!entry)return;
 el.setAttribute('data-frame',String(frame));
  el.setAttribute('data-facing',frameFacing(el.getAttribute('data-pose')||'',frame));
 const img=el.querySelector('image');img?.setAttribute('x',String(-(frame%3)*entry.size));img?.setAttribute('y',String(-Math.floor(frame/3)*entry.size));
}
export function preparePoses(root:HTMLElement){
 root.querySelectorAll<HTMLElement>('.battle-pose').forEach(el=>{
  el.setAttribute('data-facing',frameFacing(el.dataset.pose||'',Number(el.dataset.frame||0)));
  const img=el.querySelector('image');
  img?.addEventListener('load',()=>{if(el.isConnected)el.classList.add('pose-ready');},{once:true});
  img?.addEventListener('error',()=>{el.classList.add('pose-unavailable');},{once:true});
 });
}
