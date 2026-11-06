import {mkdirSync,writeFileSync} from 'node:fs';
import {build} from 'esbuild';
mkdirSync('test-results',{recursive:true});
await build({stdin:{contents:"export * from './src/effect-data'; export {CARDS,ENEMIES,CHARACTERS} from './src/data';",resolveDir:process.cwd(),loader:'ts'},outfile:'test-results/effect-catalog.mjs',bundle:true,platform:'node',format:'esm'});
const {CARDS,ENEMIES,CHARACTERS,cardEffectSpec,enemyEffectSpec}=await import('../test-results/effect-catalog.mjs?'+Date.now());
let md='# 전투 이펙트 ID 매핑 · v0.12\n\n`node scripts/document-effects.mjs`로 실제 데이터에서 생성한다. 판정 횟수와 시각 발사체 수는 다르다. 엔진은 카드/적 행동당 총 피해를 한 번 계산하며 연출은 이를 늘리지 않는다. 시전은 입 앞의 점화·전기 갈래·뿌리와 잎·물 소용돌이·발톱 준비 동작·광궁·발사구·결정 파편·축복의 빛·어둠 연무·바람 압력 등 13종으로 구분한다. 얼굴·앞발·머리·하단 등 각 기술의 출발 위치도 다르게 측정한다. 이동은 색 그라데이션과 궤적을 겹친 아래 모티프, 적중은 같은 모티프의 파편과 실제 피해 총합, 피격은 짧은 변위다. 완전 방어는 방패·방어 표시, 무피해는 무효 표시이며 몸을 흔들지 않는다.\n\n';
md+='## 공격 카드\n\n| ID / 기술 | 주체 | 대상 | 모티프 / 색 / 변형 | 시각 발사체 | 이동 / 적중 ms | 효과음 |\n| --- | --- | --- | --- | --- | --- | --- |\n';
for(const [id,c] of Object.entries(CARDS).filter(([,c])=>c.damage)){const s=cardEffectSpec(id);md+=`| ${id} / ${c.name} | ${c.owner?CHARACTERS[c.owner].partner:'현재 파트너'} | ${c.all?'살아 있는 모든 적':'선택한 살아 있는 적'} | ${s.kind} / ${s.color} / ${s.variant} | ${s.shots} | ${s.travel} / ${s.impact} | ${s.audio} → enemy-hit 또는 card-guard |\n`;}
md+='\n## 적의 직접 공격·흡수\n\n| ID (패턴 슬롯) / 행동 | 주체 | 대상 / 타격 예고 | 모티프 / 색 / 변형 | 시각 발사체 | 이동 / 적중 ms | 효과음 |\n| --- | --- | --- | --- | --- | --- | --- |\n';
for(const [id,e] of Object.entries(ENEMIES))for(const [i,a] of e.pattern.entries())if(['attack','drain'].includes(a.type)){const s=enemyEffectSpec(id,i);md+=`| ${id}:${i} / ${a.label} | ${e.name} | 파트너 / ${a.hits||1} | ${s.kind} / ${s.color} / ${s.variant} | ${s.shots} | ${s.travel} / ${s.impact} | ${s.audio} → player-hit 또는 card-guard |\n`;}
md+='\n방어·충전·상태 이상·소환은 기존의 행동 아이콘과 상태 변화 연출을 유지한다. 화상·반동은 직접 타격과 분리되어 잘못된 발사체를 만들지 않는다. 효과음은 기존 자체 제작 파일을 재사용한다. 새 벡터 모티프는 `src/combat-effects.ts`, 연결 데이터는 `src/effect-data.ts`, 표시는 `src/combat-effects.css`에 있다. 원작 추출 에셋이나 외부 이미지/음원을 사용하지 않았다.\n';
writeFileSync('docs/combat-effect-map.md',md);
console.log('Mapped',Object.values(CARDS).filter(c=>c.damage).length,'cards and',Object.values(ENEMIES).flatMap(e=>e.pattern).filter(a=>['attack','drain'].includes(a.type)).length,'enemy attacks.');
