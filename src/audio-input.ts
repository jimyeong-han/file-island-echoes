/** Click confirms committed actions. Pointer tracking only supplies disabled-button
 * feedback (native disabled buttons do not click); a cancelled/dragged touch is silent. */
export class AudioInput {
  private pointer?: {id:number; target:object; x:number; y:number; cancelled:boolean};
  private confirmed?: {target:object; time:number};
  constructor(private unlock:()=>void, private sound:(action:string,disabled:boolean)=>void) {}
  down(id:number,target:object,x:number,y:number) {
    this.unlock();
    if(this.pointer){this.pointer.cancelled=true;return;}
    this.confirmed=undefined;this.pointer={id,target,x,y,cancelled:false};
  }
  move(id:number,x:number,y:number) {
    const p=this.pointer;if(p?.id===id&&Math.hypot(x-p.x,y-p.y)>10)p.cancelled=true;
  }
  cancel(id:number){if(this.pointer?.id===id)this.pointer=undefined;}
  up(id:number,target:object,action:string,disabled:boolean,time:number) {
    const p=this.pointer;if(p?.id!==id)return;this.pointer=undefined;
    if(!p.cancelled&&p.target===target&&disabled){this.sound(action,true);this.confirmed={target,time};}
  }
  click(target:object,action:string,disabled:boolean,time:number,detail:number) {
    const duplicate=detail>0&&this.confirmed?.target===target&&time-this.confirmed.time<700;
    this.confirmed=undefined;
    if(!duplicate)this.sound(action,disabled);
  }
}

export function installAudioInput(root:HTMLElement, unlock:()=>void, sound:(action:string,disabled:boolean)=>void) {
  const input=new AudioInput(unlock,sound);
  const button=(e:Event)=>(e.target as Element).closest<HTMLButtonElement>('button[data-action]');
  root.addEventListener('pointerdown',e=>{const b=button(e);if(b&&e.button===0)input.down(e.pointerId,b,e.clientX,e.clientY);});
  root.ownerDocument.addEventListener('pointermove',e=>input.move(e.pointerId,e.clientX,e.clientY));
  root.ownerDocument.addEventListener('pointercancel',e=>input.cancel(e.pointerId));
  root.ownerDocument.addEventListener('pointerup',e=>{const b=button(e);input.move(e.pointerId,e.clientX,e.clientY);if(b&&root.contains(b))input.up(e.pointerId,b,b.dataset.action!,b.disabled,e.timeStamp);else input.cancel(e.pointerId);});
  // Capture runs before the game click handler replaces its buttons.
  root.addEventListener('click',e=>{const b=button(e);if(b)input.click(b,b.dataset.action!,b.disabled,e.timeStamp,e.detail);},true);
  return input;
}
