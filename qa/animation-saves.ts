// Only served on a disposable localhost origin, never part of the game bundle.
import {newRun,enterNode} from '../src/engine';
import {freshSave} from '../src/save-files';
import {saveRun,writeSave,loadSave} from '../src/storage';
document.querySelector('#seed')!.addEventListener('click',()=>{const save=freshSave(),r=newRun(123,'tai');r.screen='map';enterNode(r,'0a');r.battle!.enemies.forEach(e=>e.hp=1);r.battle!.hand=['flame'];saveRun(save,r);writeSave(save);document.querySelector('pre')!.textContent='Disposable battle: enemy HP 1; player '+r.hp;});
document.querySelector('#inspect')!.addEventListener('click',()=>{document.querySelector('pre')!.textContent=JSON.stringify(loadSave().save.runs,null,2);});
