import { ENEMIES, FORMS } from './data';
import manifest from './asset-manifest.json';
import type { Form } from './types';
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;
const fallbackUrl = (id: string) => `${import.meta.env.BASE_URL}art/${id}.svg`;
export function sprite(id: string, extra = '') {
  const name = Object.hasOwn(FORMS, id) ? FORMS[id as Form].name : ENEMIES[id]?.name || '디지몬';
  const path = manifest.characters[id as keyof typeof manifest.characters];
  return `<img class="sprite ${extra} form-${id}" src="${path ? assetUrl(path) : fallbackUrl('agumon')}" data-fallback="${fallbackUrl(path ? id : 'agumon')}" width="640" height="640" alt="${name}" draggable="false" decoding="async"/>`;
}
export function background(zone: number, extra = '') {
  return `<img class="scene-background ${extra}" src="${assetUrl(manifest.backgrounds[zone] || manifest.backgrounds[0])}" width="1536" height="864" alt="" draggable="false" decoding="async"/>`;
}
const pairs: Record<string, [string, string]> = {
  koushiro: ['koushiro', '장한솔과 텐타몬'], terminal: ['koushiro', '장한솔과 텐타몬'],
  joe: ['joe', '정석과 쉬라몬'], mimi: ['mimi', '이미나와 팔몬'],
  matt: ['matt', '매튜와 파피몬'], tk: ['tk', '리키와 파닥몬'],
  kari: ['kari', '신나리와 가트몬'], sora: ['sora', '한소라와 피요몬'],
  gear: ['tai', '신태일과 아구몬'], echo: ['tai', '신태일과 아구몬'], tai: ['tai', '신태일과 아구몬'],
};
export function portrait(event: string, extra = '') {
  const [id, name] = pairs[event] || pairs.tai;
  return `<div class="portrait-frame ${extra}"><img class="portrait" src="${assetUrl(manifest.portraits[id as keyof typeof manifest.portraits])}" width="640" height="640" alt="${name}" decoding="async"/><span class="portrait-fallback" aria-hidden="true">${name}</span><span class="portrait-corner"></span></div>`;
}
export function installArtFallback(root: HTMLElement) {
  root.addEventListener('error', e => {
    const image = e.target;
    if (!(image instanceof HTMLImageElement)) return;
    if (image.dataset.fallback) {
      const fallback = image.dataset.fallback;
      delete image.dataset.fallback;
      image.classList.add('fallback-art');
      image.src = fallback;
    } else {
      image.classList.add('unavailable-art');
      image.closest('.portrait-frame')?.classList.add('missing-portrait');
    }
  }, true);
}
