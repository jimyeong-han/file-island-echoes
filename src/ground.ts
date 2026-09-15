import metrics from './ground-metrics.json';
export function groundGeometry(width:number,height:number,m:{x:number;y:number;width:number;w:number;h:number}){
 const scale=Math.min(width/m.w,height/m.h),w=m.w*scale,h=m.h*scale;
 return {x:(width-w)/2+m.x*w,y:(height-h)/2+m.y*h,width:m.width*w,height:h};
}
let frame=0;
export function syncGround(root:HTMLElement){
 if(frame)cancelAnimationFrame(frame);
 const update=()=>{let moving=false;for(const enemy of Array.from(root.querySelectorAll<HTMLElement>('.enemy'))){
  const img=enemy.querySelector<HTMLImageElement>(':scope > .sprite'),base=enemy.querySelector<HTMLElement>('.fighter-base');if(!img||!base)continue;
  const id=Array.from(img.classList).find(c=>c.startsWith('form-'))?.slice(5);const m=metrics[id as keyof typeof metrics]||{x:.5,y:.95,width:.65,w:640,h:640};
  const rect=img.getBoundingClientRect(),parent=enemy.getBoundingClientRect();const g=groundGeometry(rect.width,rect.height,m);
  base.style.cssText=`left:${rect.left-parent.left+g.x-g.width/2}px;top:${rect.top-parent.top+g.y-g.width*.07}px;width:${g.width}px;height:${g.width*.14}px;--aura-height:${g.height*.85}px`;
  moving ||= img.getAnimations().some(a=>a.playState==='running');
 }frame=moving?requestAnimationFrame(update):0;};update();
}

