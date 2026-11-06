// Existing project-authored SVG: articulate its actual vector parts, not raster slices.
import {readFileSync,writeFileSync} from 'node:fs';
const source=readFileSync('public/assets/characters/demi-devimon-battle.svg','utf8');
const defs=source.match(/<defs>([\s\S]*?)<\/defs>/)[1];
const parts=source.match(/<g stroke[^>]+>([\s\S]*?)<\/g>/)[1].trim().split('\n');
const angles=[[0,0,0,0],[20,-20,-5,-18],[-18,22,5,24],[-12,18,7,35],[28,-24,-8,-18],[5,-6,-2,-6]];
const groups=angles.map(([right,left,head,arm],i)=>{
 const wingR=`<g transform="rotate(${right} 400 290)">${parts.slice(0,3).join('')}</g>`;
 const wingL=`<g transform="rotate(${left} 240 300)">${parts.slice(3,6).join('')}</g>`;
 const feet=`<g transform="rotate(${-head} 290 430)">${parts.slice(6,10).join('')}</g>`;
 const body=`<g transform="rotate(${head} 320 410)">${parts.slice(10,24).join('')}</g>`;
 const arms=`<g transform="rotate(${arm} 320 375)">${parts.slice(24).join('')}</g>`;
 // Original vector faces left; flip in each cell so the shared runtime faces right.
 return `<svg x="${i%3*320}" y="${Math.floor(i/3)*320}" width="320" height="320" viewBox="0 0 640 640" overflow="hidden"><g transform="translate(640 0) scale(-1 1)" stroke="#161c32" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${wingR}${wingL}${feet}${body}${arms}</g></svg>`;
});
const out='public/assets/poses/demi-devimon-poses.svg';
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><defs>${defs}</defs>${groups.join('')}</svg>`;
writeFileSync(out,svg);
const manifest=JSON.parse(readFileSync('src/pose-manifest.json'));
manifest['demi-devimon']={path:'poses/demi-devimon-poses.svg',size:320,frames:Array.from({length:6},()=>({bounds:[0,0,1,1]})),bytes:Buffer.byteLength(svg)};
writeFileSync('src/pose-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Articulated vector pose atlas:',Buffer.byteLength(svg),'bytes');
