# 전투 몸동작 매핑 · v0.15.1

2026-11-06. `node scripts/document-poses.mjs`로 재생성한다. 엔진의 피해 판정은 변경하지 않는다.

## 프레임과 좌표

각 시트는 320px 셀 3열 × 2행이다. 0 대기 / 1 준비 / 2 원거리 발사 / 3 근접 내지르기 / 4 피격 / 5 회복. 준비·발사·피격은 새로 그린 몸 자세다. 단일 그림을 관절로 잘라 만들지 않았다. 데미데블몬만 원래 개별 경로로 제작한 SVG 날개·팔·발의 피벗을 사용한다.

320px 정사각 안에서 공통 배율을 유지하고 발바닥/실루엣 하단을 y=308에 맞춘다. `src/battle-poses.ts`의 BODY_ORIGINS, TECHNIQUE_POSES는 발사점(x,y), LEFT_FACING은 셀별 방향 보정이다. 화면에서 enemy는 좌우 반전하고 contain 여백을 보정한다. 가트몬 공명은 가트몬 시트를 공유한다.

## 전 체형 및 파일

| ID | 이름 | 전투 파일 (public/assets/) | 용량 |
|---|---|---|---:|
| agumon | 아구몬 | `poses/agumon-poses.webp` | 116,570 B |
| andromon | 안드로몬 | `poses/andromon-poses.webp` | 110,606 B |
| angemon | 엔젤몬 | `poses/angemon-poses.webp` | 201,448 B |
| angewomon | 엔젤우몬 | `poses/angewomon-poses.webp` | 220,772 B |
| bakemon | 바케몬 | `poses/bakemon-poses.webp` | 112,352 B |
| birdramon | 버드라몬 | `poses/birdramon-poses.webp` | 280,144 B |
| biyomon | 피요몬 | `poses/biyomon-poses.webp` | 130,978 B |
| centarumon | 켄터스몬 | `poses/centarumon-poses.webp` | 158,276 B |
| cockatrimon | 코카트리몬 | `poses/cockatrimon-poses.webp` | 168,178 B |
| dark-tyrannomon | 다크티라노몬 | `poses/dark-tyrannomon-poses.webp` | 112,492 B |
| devimon | 데블몬 | `poses/devimon-poses.webp` | 209,342 B |
| elec | 에렉몬 | `poses/elec-poses.webp` | 132,694 B |
| etemon | 에테몬 | `poses/etemon-poses.webp` | 116,804 B |
| frigimon | 프리지몬 | `poses/frigimon-poses.webp` | 78,840 B |
| gabumon | 파피몬 | `poses/gabumon-poses.webp` | 139,568 B |
| garudamon | 가루다몬 | `poses/garudamon-poses.webp` | 179,350 B |
| garurumon | 가루몬 | `poses/garurumon-poses.webp` | 163,488 B |
| gatomon | 가트몬 | `poses/gatomon-poses.webp` | 134,336 B |
| gazimon | 가지몬 | `poses/gazimon-poses.webp` | 137,552 B |
| gomamon | 쉬라몬 | `poses/gomamon-poses.webp` | 107,942 B |
| greymon | 그레이몬 | `poses/greymon-poses.webp` | 138,546 B |
| ikkakumon | 원뿔몬 | `poses/ikkakumon-poses.webp` | 90,412 B |
| kabuterimon | 캅테리몬 | `poses/kabuterimon-poses.webp` | 151,160 B |
| kuwaga | 쿠가몬 | `poses/kuwaga-poses.webp` | 157,374 B |
| leomon | 레오몬 | `poses/leomon-poses.webp` | 128,166 B |
| lillymon | 릴리몬 | `poses/lillymon-poses.webp` | 135,326 B |
| magna-angemon | 홀리엔젤몬 | `poses/magna-angemon-poses.webp` | 182,830 B |
| mega-kabuterimon | 아트라캅테리몬 | `poses/mega-kabuterimon-poses.webp` | 149,534 B |
| meramon | 메라몬 | `poses/meramon-poses.webp` | 158,712 B |
| metal | 메탈그레이몬 | `poses/metal-poses.webp` | 187,364 B |
| mojyamon | 모쟈몬 | `poses/mojyamon-poses.webp` | 140,468 B |
| monochromon | 모노크로몬 | `poses/monochromon-poses.webp` | 89,836 B |
| myotismon | 묘티스몬 | `poses/myotismon-poses.webp` | 110,670 B |
| nume | 워매몬 | `poses/nume-poses.webp` | 97,538 B |
| ogre | 우가몬 | `poses/ogre-poses.webp` | 134,178 B |
| palmon | 팔몬 | `poses/palmon-poses.webp` | 132,124 B |
| patamon | 파닥몬 | `poses/patamon-poses.webp` | 83,204 B |
| phantomon | 팬텀몬 | `poses/phantomon-poses.webp` | 130,900 B |
| raremon | 레어몬 | `poses/raremon-poses.webp` | 109,894 B |
| seadramon | 시드라몬 | `poses/seadramon-poses.webp` | 134,980 B |
| shellmon | 쉘몬 | `poses/shellmon-poses.webp` | 146,006 B |
| skull | 스컬그레이몬 | `poses/skull-poses.webp` | 168,386 B |
| tentomon | 텐타몬 | `poses/tentomon-poses.webp` | 136,006 B |
| togemon | 니드몬 | `poses/togemon-poses.webp` | 117,602 B |
| unimon | 유니몬 | `poses/unimon-poses.webp` | 161,778 B |
| were-garurumon | 워가루몬 | `poses/were-garurumon-poses.webp` | 178,194 B |
| zudomon | 쥬드몬 | `poses/zudomon-poses.webp` | 124,454 B |
| demi-devimon | 데미데블몬 | `poses/demi-devimon-poses.svg` | 19,424 B |

## 카드 39종

기본/공용 카드는 현재 진화체의 같은 의미 포즈를 사용한다. 원거리 발사점은 현재 체형별 BODY_ORIGINS를 사용한다. 이펙트 장식의 투사체 수는 추가 피해 횟수를 의미하지 않는다. 모든 공격 카드는 한 번의 엔진 적중이다.

| 카드 ID | 이펙트 | 발사 프레임 |
|---|---|---:|
| claw | claw | 3 |
| flame | flame | 2 |
| courage | fist | 3 |
| rush | fist | 3 |
| ember | flame | 2 |
| nova | flame | 2 |
| missile | missile | 2 |
| zero | missile | 2 |
| blue | flame | 2 |
| link | claw | 3 |
| blue-plus | flame | 2 |
| wolf-claw | claw | 3 |
| feather | flame | 2 |
| wind | wind | 2 |
| flare-wing | wave | 2 |
| meteor-wing | shard | 2 |
| shadow-wing | wave | 2 |
| shock | bolt | 2 |
| chain | bolt | 2 |
| probe | arrow | 2 |
| mega-blaster | bolt | 2 |
| horn-buster | bolt | 2 |
| ivy | vine | 2 |
| bind | vine | 2 |
| garden | vine | 2 |
| needle | shard | 2 |
| flower-cannon | wave | 2 |
| fish | water | 2 |
| harpoon | arrow | 2 |
| harpoon-plus | missile | 2 |
| hammer | fist | 3 |
| bubble | wind | 2 |
| dawn | arrow | 2 |
| heavens-knuckle | fist | 3 |
| holy-gate | gate | 2 |
| cat | claw | 3 |
| moon | claw | 3 |
| cat-resonant | claw | 3 |
| holy-arrow | arrow | 2 |

## 적 공격 39패턴

표의 연타는 엔진의 hits 메타데이터다. 이미 계산된 총피해/방어를 타수로 나눠 보여주며 피해를 다시 계산하거나 배수로 늘리지 않는다. 감소 모션은 한 번으로 합쳐 표시한다.

| 적 | 패턴/기술 | 프레임 | 발사점 x,y | 타수 |
|---|---|---:|---|---:|
| 쿠가몬 | kuwaga:0 · 가위 연격 | 3 | 0.84, 0.5 | 2 |
| 쿠가몬 | kuwaga:2 · 급강하 | 3 | 0.84, 0.5 | 1 |
| 에렉몬 | elec:0 · 전기 충격 | 2 | 0.76, 0.39 | 1 |
| 에렉몬 | elec:2 · 방전 | 2 | 0.76, 0.39 | 1 |
| 쉘몬 | shellmon:1 · 물대포 | 2 | 0.82, 0.49 | 1 |
| 쉘몬 | shellmon:2 · 촉수 | 3 | 0.84, 0.5 | 1 |
| 시드라몬 | seadramon:1 · 얼음 화살 | 2 | 0.84, 0.33 | 1 |
| 시드라몬 | seadramon:2 · 꼬리치기 | 3 | 0.83, 0.76 | 1 |
| 메라몬 | meramon:1 · 버닝 피스트 | 3 | 0.84, 0.5 | 1 |
| 메라몬 | meramon:2 · 열기 | 2 | 0.84, 0.47 | 1 |
| 워매몬 | nume:2 · 들이받기 | 3 | 0.84, 0.5 | 1 |
| 모노크로몬 | monochromon:1 · 화산탄 | 2 | 0.84, 0.48 | 1 |
| 유니몬 | unimon:1 · 홀리 샷 | 2 | 0.83, 0.38 | 1 |
| 유니몬 | unimon:2 · 돌진 | 3 | 0.84, 0.5 | 1 |
| 프리지몬 | frigimon:0 · 얼음 펀치 | 3 | 0.84, 0.5 | 1 |
| 프리지몬 | frigimon:2 · 차가운 충격 | 2 | 0.84, 0.48 | 1 |
| 모쟈몬 | mojyamon:0 · 뼈 부메랑 | 3 | 0.84, 0.5 | 2 |
| 모쟈몬 | mojyamon:2 · 얼음 검 | 3 | 0.84, 0.44 | 1 |
| 켄터스몬 | centarumon:1 · 태양 광선 | 2 | 0.85, 0.38 | 1 |
| 바케몬 | bakemon:2 · 기습 | 2 | 0.83, 0.43 | 1 |
| 가지몬 | gazimon:1 · 날카로운 발톱 | 3 | 0.84, 0.5 | 2 |
| 가지몬 | gazimon:2 · 굴 파기 | 3 | 0.84, 0.5 | 1 |
| 코카트리몬 | cockatrimon:2 · 내려찍기 | 3 | 0.84, 0.5 | 1 |
| 레어몬 | raremon:2 · 점액 파동 | 2 | 0.83, 0.46 | 1 |
| 다크티라노몬 | dark-tyrannomon:1 · 불길 돌진 | 2 | 0.83, 0.32 | 1 |
| 데미데블몬 | demi-devimon:1 · 데미 다트 | 2 | 0.78, 0.53 | 1 |
| 안드로몬 | andromon:1 · 스파이럴 소드 | 3 | 0.88, 0.42 | 1 |
| 우가몬 | ogre:0 · 곤봉 | 3 | 0.84, 0.5 | 1 |
| 우가몬 | ogre:2 · 패왕권 | 2 | 0.87, 0.36 | 1 |
| 레오몬 | leomon:0 · 수왕권 | 2 | 0.87, 0.35 | 1 |
| 레오몬 | leomon:3 · 검격 | 3 | 0.84, 0.5 | 1 |
| 팬텀몬 | phantomon:2 · 처형 예고 | 3 | 0.87, 0.43 | 1 |
| 데블몬 | devimon:0 · 데스 클로 | 3 | 0.84, 0.5 | 1 |
| 데블몬 | devimon:2 · 어둠의 흡수 | 2 | 0.83, 0.44 | 1 |
| 데블몬 | devimon:3 · 어둠의 파동 | 2 | 0.83, 0.44 | 1 |
| 에테몬 | etemon:1 · 다크 네트워크 | 2 | 0.83, 0.42 | 1 |
| 에테몬 | etemon:3 · 콘서트 피날레 | 2 | 0.83, 0.42 | 1 |
| 묘티스몬 | myotismon:0 · 흡혈 | 2 | 0.84, 0.45 | 1 |
| 묘티스몬 | myotismon:3 · 나이트 레이드 | 2 | 0.84, 0.45 | 1 |

## 출처와 교체

47개 래스터 시트의 정확한 프롬프트·참조 파일·수정 프롬프트는 `assets/animation-sources/<id>.json`에 있다. 참조는 기존 프로젝트용 팬 일러스트이며 공식 추출물은 없다. 새 시트에 맞춰 `scripts/pack-battle-poses.py` → `scripts/pack-vector-pose.mjs`를 실행하면 manifest가 갱신된다. 생성 원본은 로컬 `test-results/pose-sources/`에 두고 배포하지 않는다. 최종 WebP/SVG 및 출처는 저장소에 포함한다.

6개 키포즈 기반의 제한 애니메이션이다. 24fps 손그림 중간 동작, 관절 물리, 방향별 별도 그림은 포함하지 않는다. 생성 프레임의 작은 장식·손가락·옷 주름 차이는 남아 있으며 일부 옆모습은 런타임 좌우 반전으로 통일한다. 데미데블몬은 원래 벡터 화풍을 유지해 다른 래스터 캐릭터보다 단순하다.
