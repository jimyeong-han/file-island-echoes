# 에셋 구성과 교체

v0.4는 이미지 66개를 사용합니다: 알파 WebP 전투/이벤트 캐릭터 50개, 직접 제작한 SVG 캐릭터 2개, WebP 배경 6개, 인물 쌍 초상화 8개. 이번 확장에서 imagegen 신규 이미지 41개와 SVG 캐릭터 2개를 추가했습니다.

매니페스트 이미지 합계: **5,579,028 bytes / 5.32 MiB**. 화면에 필요한 이미지만 요청하고 초상화와 도감은 지연 로딩합니다. 타이틀은 숲 배경과 태일 초상화만 사용합니다.

`src/asset-manifest.json`에서 경로를 관리하고 `src/art.ts`가 Vite BASE_URL을 붙입니다. `src/content/characters.ts`의 `art`는 진화체와 파일을 연결합니다. 가트몬 공명은 가트몬 파일을 공유합니다.

| 파일 (public/assets/) | 해상도 | 형식 | 용량 |
| --- | --- | --- | --- |
| `characters/agumon-battle.webp` | 630×640 | WebP 알파 | 66.6 KiB |
| `characters/greymon-battle.webp` | 640×639 | WebP 알파 | 77.6 KiB |
| `characters/metal-greymon-battle.webp` | 640×630 | WebP 알파 | 105.2 KiB |
| `characters/skull-greymon-battle.webp` | 640×624 | WebP 알파 | 111.4 KiB |
| `characters/devimon-battle.webp` | 632×640 | WebP 알파 | 68.9 KiB |
| `characters/kuwagamon-battle.webp` | 640×633 | WebP 알파 | 91.3 KiB |
| `characters/elecmon-battle.webp` | 637×640 | WebP 알파 | 79.7 KiB |
| `characters/meramon-battle.webp` | 633×640 | WebP 알파 | 88.7 KiB |
| `characters/numemon-battle.webp` | 622×640 | WebP 알파 | 56.1 KiB |
| `characters/andromon-battle.webp` | 612×640 | WebP 알파 | 74.2 KiB |
| `characters/ogremon-battle.webp` | 628×640 | WebP 알파 | 80.7 KiB |
| `characters/gabumon-battle.webp` | 640×638 | WebP 알파 | 77.3 KiB |
| `characters/tentomon-battle.webp` | 640×603 | WebP 알파 | 77.2 KiB |
| `characters/frigimon-battle.webp` | 602×640 | WebP 알파 | 40.0 KiB |
| `characters/monochromon-battle.webp` | 640×422 | WebP 알파 | 44.8 KiB |
| `characters/palmon-battle.webp` | 629×640 | WebP 알파 | 64.2 KiB |
| `characters/angemon-battle.webp` | 637×640 | WebP 알파 | 109.3 KiB |
| `characters/angewomon-battle.webp` | 637×640 | WebP 알파 | 116.2 KiB |
| `characters/bakemon-battle.webp` | 640×616 | WebP 알파 | 66.2 KiB |
| `characters/birdramon-battle.webp` | 635×640 | WebP 알파 | 131.8 KiB |
| `characters/biyomon-battle.webp` | 640×638 | WebP 알파 | 61.7 KiB |
| `characters/centarumon-battle.webp` | 634×640 | WebP 알파 | 78.6 KiB |
| `characters/cockatrimon-battle.webp` | 639×640 | WebP 알파 | 99.8 KiB |
| `characters/dark-tyrannomon-battle.webp` | 640×630 | WebP 알파 | 58.3 KiB |
| `characters/etemon-battle.webp` | 613×640 | WebP 알파 | 69.9 KiB |
| `characters/garudamon-battle.webp` | 635×640 | WebP 알파 | 117.4 KiB |
| `characters/garurumon-battle.webp` | 640×628 | WebP 알파 | 106.2 KiB |
| `characters/gatomon-battle.webp` | 640×633 | WebP 알파 | 64.5 KiB |
| `characters/gazimon-battle.webp` | 640×634 | WebP 알파 | 74.4 KiB |
| `characters/gomamon-battle.webp` | 638×640 | WebP 알파 | 62.5 KiB |
| `characters/ikkakumon-battle.webp` | 640×627 | WebP 알파 | 62.0 KiB |
| `characters/kabuterimon-battle.webp` | 640×640 | WebP 알파 | 90.3 KiB |
| `characters/leomon-battle.webp` | 633×640 | WebP 알파 | 70.5 KiB |
| `characters/lillymon-battle.webp` | 627×640 | WebP 알파 | 71.8 KiB |
| `characters/magna-angemon-battle.webp` | 640×636 | WebP 알파 | 104.0 KiB |
| `characters/mega-kabuterimon-battle.webp` | 640×640 | WebP 알파 | 93.9 KiB |
| `characters/mojyamon-battle.webp` | 623×640 | WebP 알파 | 79.0 KiB |
| `characters/myotismon-battle.webp` | 636×640 | WebP 알파 | 64.0 KiB |
| `characters/patamon-battle.webp` | 640×640 | WebP 알파 | 41.6 KiB |
| `characters/phantomon-battle.webp` | 640×640 | WebP 알파 | 67.6 KiB |
| `characters/piccolomon-battle.webp` | 620×640 | WebP 알파 | 54.8 KiB |
| `characters/raremon-battle.webp` | 640×636 | WebP 알파 | 56.9 KiB |
| `characters/seadramon-battle.webp` | 626×640 | WebP 알파 | 73.7 KiB |
| `characters/shellmon-battle.webp` | 640×606 | WebP 알파 | 75.1 KiB |
| `characters/sukamon-battle.webp` | 633×640 | WebP 알파 | 53.8 KiB |
| `characters/togemon-battle.webp` | 637×640 | WebP 알파 | 61.2 KiB |
| `characters/unimon-battle.webp` | 623×640 | WebP 알파 | 90.1 KiB |
| `characters/were-garurumon-battle.webp` | 629×640 | WebP 알파 | 85.7 KiB |
| `characters/whamon-battle.webp` | 640×595 | WebP 알파 | 65.2 KiB |
| `characters/zudomon-battle.webp` | 637×640 | WebP 알파 | 90.5 KiB |
| `characters/chuumon-battle.svg` | 640×640 viewBox | SVG 벡터 | 3.3 KiB |
| `characters/demi-devimon-battle.svg` | 640×640 viewBox | SVG 벡터 | 3.3 KiB |
| `backgrounds/forest-battle-background.webp` | 1536×864 | WebP RGB | 267.7 KiB |
| `backgrounds/factory-battle-background.webp` | 1536×864 | WebP RGB | 183.8 KiB |
| `backgrounds/mountain-battle-background.webp` | 1536×864 | WebP RGB | 191.3 KiB |
| `backgrounds/devimon-boss-background.webp` | 1536×864 | WebP RGB | 180.9 KiB |
| `backgrounds/server-battle-background.webp` | 1536×864 | WebP RGB | 113.4 KiB |
| `backgrounds/city-battle-background.webp` | 1536×864 | WebP RGB | 116.0 KiB |
| `portraits/tai-agumon.webp` | 640×640 | WebP RGB | 68.7 KiB |
| `portraits/koushiro-tentomon.webp` | 640×640 | WebP RGB | 64.7 KiB |
| `portraits/joe-gomamon.webp` | 640×640 | WebP RGB | 65.3 KiB |
| `portraits/mimi-palmon.webp` | 640×640 | WebP RGB | 66.9 KiB |
| `portraits/matt-gabumon.webp` | 640×640 | WebP RGB | 66.7 KiB |
| `portraits/tk-patamon.webp` | 640×640 | WebP RGB | 57.4 KiB |
| `portraits/kari-gatomon.webp` | 640×640 | WebP RGB | 65.2 KiB |
| `portraits/sora-biyomon.webp` | 640×640 | WebP RGB | 61.3 KiB |

## 교체 방법

1. 같은 이름의 파일을 `public/assets/`에 넣거나 매니페스트의 경로를 수정합니다. 공식 추출 에셋은 사용하지 않습니다.
2. 래스터 캐릭터는 실제 알파 배경과 최대 640px, 배경은 1536×864px를 권장합니다. 프로젝트 생성 PNG를 넣은 경우 `python scripts/optimize-assets.py --remove-copies`로 WebP를 만듭니다. 이 명령은 프로젝트 안의 PNG 사본만 제거하며 생성 원본은 건드리지 않습니다.
3. `python scripts/sync-manifest.py`로 새 파일을 매니페스트에 반영합니다. 신규 종은 콘텐츠 데이터의 `art` ID도 맞춥니다.
4. `python scripts/audit-assets.py`는 알파·크기 검사와 무시되는 `test-results/` 검수 시트를 만듭니다. Python/Pillow는 게임 실행이나 빌드에 필요하지 않습니다.
5. `npm test`, `npm run build`, `npm run check:pages`로 누락과 배포 경로를 검사합니다.

## 표현상의 제한

데미데블몬과 츄몬은 내장 이미지 생성이 반복 실패하여 직접 작성한 SVG 일러스트로 제공됩니다. 외곽선·색상·명암은 주변 에셋에 맞췄지만 다른 캐릭터보다 단순합니다. 나중에 동일 ID의 셀 셰이딩 이미지로 교체할 수 있습니다. 나머지도 공식 모델 시트의 정확한 복제품이 아닌 독자적인 팬메이드 표현입니다.

캐릭터당 정지 포즈 1개와 CSS 이동·피격·진화 효과를 사용합니다. 얼굴·손발·날개와 여백은 검수 시트 및 게임 화면에서 확인했습니다. 누락된 이미지는 종을 잘못 표시하지 않는 데이터 심볼로 대체됩니다.
