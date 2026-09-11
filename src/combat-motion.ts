/** A bounded presentation queue. Combat is committed before this queue starts. */
export class MotionQueue {
 private generation=0;
 private pending=new Map<ReturnType<typeof setTimeout>,(ok:boolean)=>void>();
 private cleanup:(()=>void)|null=null;
 private watchdog?:ReturnType<typeof setTimeout>;
 busy=false;
 begin(cleanup:()=>void){this.finish();this.busy=true;this.cleanup=cleanup;this.watchdog=setTimeout(()=>this.finish(),4000);return ++this.generation;}
 live(token:number){return this.busy&&token===this.generation;}
 wait(ms:number,token:number):Promise<boolean>{
  if(!this.live(token))return Promise.resolve(false);
  return new Promise(resolve=>{const timer=setTimeout(()=>{this.pending.delete(timer);resolve(this.live(token));},ms);this.pending.set(timer,resolve);});
 }
 finish(){
  this.generation++;this.busy=false;
  clearTimeout(this.watchdog);
  for(const [timer,resolve] of this.pending){clearTimeout(timer);resolve(false);}this.pending.clear();
  const done=this.cleanup;this.cleanup=null;done?.();
 }
}
