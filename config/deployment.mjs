export const TARGETS=Object.freeze({pages:{target:'pages',base:'/file-island-echoes/'},vercel:{target:'vercel',base:'/'}});
export function deployment(target='pages'){
 if(!Object.hasOwn(TARGETS,target))throw new Error('Unknown deployment target: '+target);
 return TARGETS[target];
}
