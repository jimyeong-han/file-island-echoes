import type { CharacterId } from './types';
// Newly drawn for a 24px grid, using the eight 1999 crest motifs.
export const CRESTS: Record<CharacterId, {id:string; motif:string; path:string}> = {
 tai:{id:'courage',motif:'중심 원과 태양의 광선',path:'<circle cx="12" cy="12" r="4"/><path d="m12 2 1 4m-1 16-1-4M2 12l4-1m16 1-4 1M5 5l3 2m11-2-2 3M5 19l2-3m12 3-3-2"/>'},
 matt:{id:'friendship',motif:'서로 마주 도는 곡선과 양옆 물결',path:'<path d="M4 9h3a6 6 0 0 1 11-1h4l-2 5h-3a6 6 0 0 1-11 3H2Z"/><path d="M13 6c5 4-6 7-2 12"/>'},
 sora:{id:'love',motif:'안으로 말린 하트',path:'<path d="M12 21 4 14C-1 8 6 1 11 6c2 3-2 5-3 3m4 12 8-9c4-6-4-11-7-6v9"/>'},
 koushiro:{id:'knowledge',motif:'크기가 다른 두 원의 연결',path:'<circle cx="7" cy="12" r="5"/><circle cx="18" cy="12" r="3.5"/><path d="M12 11h2.5M12 13h2.5"/>'},
 mimi:{id:'purity',motif:'물방울과 내부 원',path:'<path d="M12 2S4 12 4 16a8 6 0 0 0 16 0c0-4-8-14-8-14Z"/><circle cx="12" cy="16" r="3"/>'},
 joe:{id:'reliability',motif:'중앙 기둥과 대칭으로 교차하는 띠',path:'<path d="M10 2h4v5h5l-3 4h4v4h-4l3 6h-5v1h-4v-1H5l3-6H4v-4h4L5 7h5Z"/>'},
 tk:{id:'hope',motif:'위쪽 별과 아래로 이어지는 빛줄기',path:'<circle cx="12" cy="7" r="3"/><path d="M12 1v2M6 3l2 2m10-2-2 2M4 8h4m8 0h4M9 10 6 22l4-2 2 2 2-2 4 2-3-12"/>'},
 kari:{id:'light',motif:'중심에서 퍼지는 여덟 갈래 빛',path:'<path d="m12 2 2 6 6-5-4 7 6 2-6 2 4 7-6-5-2 6-2-6-6 5 4-7-6-2 6-2-4-7 6 5Z"/><circle cx="12" cy="12" r="2"/>'},
};
export const crestPaths=Object.fromEntries(Object.values(CRESTS).map(c=>['crest-'+c.id,c.path]));
