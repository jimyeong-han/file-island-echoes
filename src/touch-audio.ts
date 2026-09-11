import ids from './touch-sfx.json';
import catalog from './audio-manifest.json';
// Encoded bytes only: this never creates/resumes an AudioContext or plays audio.
const prepared=new Map<string,Promise<ArrayBuffer|null>>();
export function prepareTouchAudio(){
 if(typeof Audio==='undefined')return;
 const format=new Audio().canPlayType('audio/ogg; codecs="vorbis"')?'ogg':'mp3';
 for(const id of ids){const cue=catalog[id as keyof typeof catalog],file=cue.files.find(f=>f.endsWith('.'+format))!;if(prepared.has(file))continue;
  prepared.set(file,fetch(import.meta.env.BASE_URL+'assets/audio/'+file,{signal:AbortSignal.timeout(5000)}).then(r=>r.ok?r.arrayBuffer():null).catch(()=>null));
 }
}
export async function preparedTouchAudio(file:string){const bytes=await prepared.get(file);return bytes?.slice(0)||null;}
