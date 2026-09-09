# 에셋 구성과 교체

새로 제작한 셀 셰이딩 팬메이드 일러스트 **23장**과 직접 작성한 SVG 아이콘 18개, 독자적인 데이터 심볼 파비콘을 사용합니다. 공식 이미지·음원 추출물을 다운로드하거나 사용하지 않았습니다.

캐릭터 11장, 배경 4장, 초상화 8장입니다. 정적 파일 경로는 [src/asset-manifest.json](src/asset-manifest.json) 한곳에서 관리하고, [src/art.ts](src/art.ts)가 Vite의 BASE_URL을 앞에 붙입니다. GitHub Pages 하위 경로에서도 같은 파일이 로드됩니다.

## 이미지 목록

| 파일 (public/assets/) | 용도 | 해상도 | 형식 | 크기 |
| --- | --- | --- | --- | --- |
| `characters/agumon-battle.webp` | 아구몬 | 630×640 | WebP 알파 | 66.6 KiB |
| `characters/greymon-battle.webp` | 그레이몬 | 640×639 | WebP 알파 | 77.6 KiB |
| `characters/metal-greymon-battle.webp` | 메탈그레이몬 | 640×630 | WebP 알파 | 105.2 KiB |
| `characters/skull-greymon-battle.webp` | 스컬그레이몬 | 640×624 | WebP 알파 | 111.4 KiB |
| `characters/devimon-battle.webp` | 데블몬 | 632×640 | WebP 알파 | 68.9 KiB |
| `characters/kuwagamon-battle.webp` | 쿠가몬 | 640×633 | WebP 알파 | 91.3 KiB |
| `characters/elecmon-battle.webp` | 에렉몬 | 637×640 | WebP 알파 | 79.7 KiB |
| `characters/meramon-battle.webp` | 메라몬 | 633×640 | WebP 알파 | 88.7 KiB |
| `characters/numemon-battle.webp` | 워매몬 | 622×640 | WebP 알파 | 56.1 KiB |
| `characters/andromon-battle.webp` | 안드로몬 | 612×640 | WebP 알파 | 74.2 KiB |
| `characters/ogremon-battle.webp` | 우가몬 | 628×640 | WebP 알파 | 80.7 KiB |
| `backgrounds/forest-battle-background.webp` | 파일섬의 숲 | 1536×864 | WebP RGB | 267.7 KiB |
| `backgrounds/factory-battle-background.webp` | 버려진 공장 | 1536×864 | WebP RGB | 183.8 KiB |
| `backgrounds/mountain-battle-background.webp` | 무한산 | 1536×864 | WebP RGB | 191.3 KiB |
| `backgrounds/devimon-boss-background.webp` | 데블몬 보스전 | 1536×864 | WebP RGB | 180.9 KiB |
| `portraits/tai-agumon.webp` | 신태일 · 아구몬 | 640×640 | WebP RGB | 68.7 KiB |
| `portraits/koushiro-tentomon.webp` | 장한솔 · 텐타몬 | 640×640 | WebP RGB | 64.7 KiB |
| `portraits/joe-gomamon.webp` | 정석 · 쉬라몬 | 640×640 | WebP RGB | 65.3 KiB |
| `portraits/mimi-palmon.webp` | 이미나 · 팔몬 | 640×640 | WebP RGB | 66.9 KiB |
| `portraits/matt-gabumon.webp` | 매튜 · 파피몬 | 640×640 | WebP RGB | 66.7 KiB |
| `portraits/tk-patamon.webp` | 리키 · 파닥몬 | 640×640 | WebP RGB | 57.4 KiB |
| `portraits/kari-gatomon.webp` | 신나리 · 가트몬 | 640×640 | WebP RGB | 65.2 KiB |
| `portraits/sora-biyomon.webp` | 한소라 · 피요몬 | 640×640 | WebP RGB | 61.3 KiB |

신규 이미지 총 **2,294,012 bytes (2.19 MiB)**, UI SVG 포함 **2,298,573 bytes**. 배포에는 약 0.20 MiB의 기존 SVG fallback도 포함됩니다. 전체 배포 예상 전송량은 `npm run check:pages`가 계산합니다.

## 교체 방법

1. 같은 WebP 파일명을 교체하거나 매니페스트를 변경합니다. 캐릭터는 알파 채널을 유지하고 발밑 그림자는 CSS로 처리합니다.
2. 캐릭터·초상화는 긴 변 640px, 배경은 1536×864px입니다. 전투 캐릭터의 실제 CSS 높이는 대략 95–295px, 진화는 최대 290px입니다. 초상화는 220–390px입니다.
3. 파일마다 생성 요청문, 제작 날짜, 출처를 [assets/ATTRIBUTION.md](assets/ATTRIBUTION.md)에 남깁니다.
4. `npm run build`와 `npm run check:pages` 후 실제 전투·모바일 화면을 확인합니다.

`scripts/optimize-assets.py`는 프로젝트 폴더에 **복사한** PNG를 알파 유지·여백 정돈·Lanczos 축소 후 WebP로 변환합니다. Python과 Pillow가 필요하며, 게임 실행·빌드에는 필요하지 않습니다. `--remove-copies`는 변환한 프로젝트 내 PNG 복사본만 제거합니다. 기본 제공 에셋은 이미 최적화되어 있습니다.

아이콘 원본은 `src/icons.ts`입니다. `npm run art:ui`로 `public/assets/ui/*-icon.svg`를 다시 만듭니다(Node.js 24). 모든 아이콘은 viewBox 0 0 24 24, 1.8px 둥근 선을 공유합니다. HTML에 삽입되는 작은 SVG와 파일형 SVG가 같은 원본을 사용합니다. 카드 텍스트·게임 제목은 모두 HTML이며 래스터에 포함되지 않습니다.

## 교체한 임시 요소와 fallback

- 기존 캐릭터 SVG 11종은 정상 화면에서 새 알파 WebP로 교체했습니다. `public/art/`의 작은 픽셀 SVG는 **이미지 로드 실패 시에만** 사용하는 fallback으로 보관합니다.
- 기존 `file-island.svg` 도형 지도는 타이틀·이벤트에서 제거했습니다. 기존 생성 스크립트 재현용 파일만 남아 있으며 정상 플레이에서 요청하지 않습니다.
- 문자·이모지 카드/행동/육성 아이콘과 모닥불 기호를 SVG 및 초상화로 교체했습니다.
- 이미지가 없으면 전투 캐릭터는 SVG로 대체하고, 초상화는 이름 프레임, 배경은 CSS 바탕색을 유지합니다.
- `npm run art`는 **옛 SVG fallback만** 재생성합니다. WebP 일러스트를 덮어쓰지 않습니다.

## 시각 효과

`src/style.css`는 기본 배치, `src/visual.css`는 일러스트와 게임 UI의 표현을 담당합니다. 카드 프레임은 공격·방어·지원·진화·위험 5계열이며 효과는 SVG와 본문으로도 구분합니다. 공격은 해당 대상에 피격 표시, 방어는 파트너 보호막, 회복은 녹색 빛을 사용합니다.

진화는 전후 이미지, 원형 파동, 짧은 빛, 데이터 입자로 구성합니다. 설정 또는 OS의 움직임 줄이기 요청에서는 플래시·반복 입자·확대 애니메이션을 끕니다. 큰 영상, 외부 글꼴, 오디오 파일은 없습니다.
