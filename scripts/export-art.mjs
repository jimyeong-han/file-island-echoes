import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { sprite, island } from './art-source.ts';
const output=new URL('../public/art/',import.meta.url);
await mkdir(output,{recursive:true});
for(const id of ['agumon','greymon','metal','skull','kuwaga','elec','meramon','nume','andromon','ogre','devimon','file-island']){
 const svg=(id==='file-island'?island():sprite(id)).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
 await writeFile(new URL(`${id}.svg`,output),svg);
}
console.log(`12 original SVG assets written to ${fileURLToPath(output)}`);
