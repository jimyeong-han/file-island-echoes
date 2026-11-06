import {EVOLUTIONS,FORMS} from '../src/data';
import {newRun,evolve} from '../src/engine';
import {freshSave} from '../src/save-files';
import {saveRun,writeSave,loadSave} from '../src/storage';
const select=document.querySelector('select')!,output=document.querySelector('pre')!;
select.innerHTML=EVOLUTIONS.map(e=>`<option value="${e.to}">${e.from} → ${e.to}</option>`).join('');
document.querySelector<HTMLButtonElement>('#seed')!.onclick=()=>{
 const e=EVOLUTIONS.find(e=>e.to===select.value)!,s=freshSave(),r=newRun(13,FORMS[e.from].owner);r.screen='map';r.evoEnergy=50;r.bond=15;
 if(FORMS[e.from].stage===1){evolve(r,e.from);r.screen='map';}r.burden=e.burden;
 s.settings.muted=false;saveRun(s,r);writeSave(s);output.textContent='Saved disposable fixture: '+r.form+' · energy '+r.evoEnergy;
};
document.querySelector<HTMLButtonElement>('#inspect')!.onclick=()=>{const s=loadSave().save;output.textContent=JSON.stringify(s.runs,null,2);};
