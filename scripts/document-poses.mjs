import {build} from 'esbuild';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
mkdirSync('test-results',{recursive:true});
await build({stdin:{contents:"export {FORMS,ENEMIES} from './src/data';export {CARD_EFFECT_ROWS,ENEMY_EFFECT_ROWS} from './src/effect-data';export {attackFrame,bodyOrigin} from './src/battle-poses';",resolveDir:process.cwd()},outfile:'test-results/pose-data.mjs',bundle:true,platform:'node',format:'esm'});
const {FORMS,ENEMIES,CARD_EFFECT_ROWS,attackFrame,bodyOrigin}=await import('../test-results/pose-data.mjs?time='+Date.now());
const poses=JSON.parse(readFileSync('src/pose-manifest.json','utf8'));
let out='# 전투 몸동작 매핑 · v0.15.1\n\n2026-11-06. `node scripts/document-poses.mjs`로 재생성한다. 엔진의 피해 판정은 변경하지 않는다.\n\n';
out+='## 프레임과 좌표\n\n각 시트는 320px 셀 3열 × 2행이다. 0 대기 / 1 준비 / 2 원거리 발사 / 3 근접 내지르기 / 4 피격 / 5 회복. 준비·발사·피격은 새로 그린 몸 자세다. 단일 그림을 관절로 잘라 만들지 않았다. 데미데블몬만 원래 개별 경로로 제작한 SVG 날개·팔·발의 피벗을 사용한다.\n\n320px 정사각 안에서 공통 배율을 유지하고 발바닥/실루엣 하단을 y=308에 맞춘다. `src/battle-poses.ts`의 BODY_ORIGINS, TECHNIQUE_POSES는 발사점(x,y), LEFT_FACING은 셀별 방향 보정이다. 화면에서 enemy는 좌우 반전하고 contain 여백을 보정한다. 가트몬 공명은 가트몬 시트를 공유한다.\n\n';
out+='## 전 체형 및 파일\n\n| ID | 이름 | 전투 파일 (public/assets/) | 용량 |\n|---|---|---|---:|\n';
for(const [id,p]of Object.entries(poses))out+=`| ${id} | ${FORMS[id]?.name||ENEMIES[id]?.name} | \`${p.path}\` | ${p.bytes.toLocaleString('en-US')} B |\n`;
out+='\n## 카드 39종\n\n기본/공용 카드는 현재 진화체의 같은 의미 포즈를 사용한다. 원거리 발사점은 현재 체형별 BODY_ORIGINS를 사용한다. 이펙트 장식의 투사체 수는 추가 피해 횟수를 의미하지 않는다. 모든 공격 카드는 한 번의 엔진 적중이다.\n\n| 카드 ID | 이펙트 | 발사 프레임 |\n|---|---|---:|\n';
for(const[id,row]of Object.entries(CARD_EFFECT_ROWS))out+=`| ${id} | ${row[0]} | ${attackFrame(row[0],id)} |\n`;
const {ENEMY_EFFECT_ROWS}=await import('../test-results/pose-data.mjs');
out+='\n## 적 공격 39패턴\n\n표의 연타는 엔진의 hits 메타데이터다. 이미 계산된 총피해/방어를 타수로 나눠 보여주며 피해를 다시 계산하거나 배수로 늘리지 않는다. 감소 모션은 한 번으로 합쳐 표시한다.\n\n| 적 | 패턴/기술 | 프레임 | 발사점 x,y | 타수 |\n|---|---|---:|---|---:|\n';
for(const[id,e]of Object.entries(ENEMIES))for(const[step,a]of e.pattern.entries())if(['attack','drain'].includes(a.type)){const key=id+':'+step,kind=ENEMY_EFFECT_ROWS[id][step][0],p=bodyOrigin(id,kind,false,1,1,key);out+=`| ${e.name} | ${key} · ${a.label} | ${attackFrame(kind,key)} | ${p.x}, ${p.y} | ${a.hits||1} |\n`;}
out+='\n## 출처와 교체\n\n47개 래스터 시트의 정확한 프롬프트·참조 파일·수정 프롬프트는 `assets/animation-sources/<id>.json`에 있다. 참조는 기존 프로젝트용 팬 일러스트이며 공식 추출물은 없다. 새 시트에 맞춰 `scripts/pack-battle-poses.py` → `scripts/pack-vector-pose.mjs`를 실행하면 manifest가 갱신된다. 생성 원본은 로컬 `test-results/pose-sources/`에 두고 배포하지 않는다. 최종 WebP/SVG 및 출처는 저장소에 포함한다.\n\n6개 키포즈 기반의 제한 애니메이션이다. 24fps 손그림 중간 동작, 관절 물리, 방향별 별도 그림은 포함하지 않는다. 생성 프레임의 작은 장식·손가락·옷 주름 차이는 남아 있으며 일부 옆모습은 런타임 좌우 반전으로 통일한다. 데미데블몬은 원래 벡터 화풍을 유지해 다른 래스터 캐릭터보다 단순하다.\n';
writeFileSync('docs/combat-pose-map.md',out);
console.log('Documented '+Object.keys(poses).length+' body atlases and all damaging techniques.');
