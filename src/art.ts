import { ENEMIES, FORMS } from './data';
import type { Form } from './types';
const artBase=`${import.meta.env.BASE_URL}art/`;
export function sprite(id:string,extra='') {
 const name=Object.hasOwn(FORMS,id)?FORMS[id as Form].name:ENEMIES[id]?.name||'디지몬';
 return `<img class="sprite ${extra}" src="${artBase}${id}.svg" width="240" height="240" alt="${name} 임시 픽셀 아트" draggable="false"/>`;
}
export function island() {return `<img class="island-art" src="${artBase}file-island.svg" width="1100" height="650" alt="" draggable="false"/>`;}
