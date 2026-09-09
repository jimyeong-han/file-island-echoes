# 에셋 제작 출처

Unofficial, non-commercial fan project.
This project is not affiliated with or endorsed by Bandai,
Toei Animation, or any related rights holder.
Third-party names and characters belong to their respective rights holders.

이 기록은 프로젝트 전체에 적용되는 오픈소스 라이선스나 제3자 권리의 사용 허가가 아닙니다.

## 2026-09-09 · 셀 셰이딩 일러스트 적용

- 제작 도구: Codex 내장 **imagegen 이미지 생성 도구**. 별도 API/CLI 대체 경로를 사용하지 않았습니다. 도구가 모델의 세부 버전 식별자를 제공하지 않아 특정 모델명은 단정하지 않습니다.
- 각 캐릭터·지역·인물 쌍을 **각각 별도의 생성 요청**으로 만들었습니다. 이미지 시트에서 잘라 쓰지 않았습니다.
- 모든 요청은 텍스트 기반 신규 생성입니다. 외부 참조 이미지, 애니메이션 캡처, 공식 일러스트, 공식 게임 스프라이트, 공식 로고, 음원·효과음을 다운로드하거나 입력하지 않았습니다.
- 원작 인물과 종의 특징을 설명하되 특정 공식 이미지의 자세·조명·구도·선화·세부 표현을 그대로 재현하도록 요청하지 않았습니다.
- 최종 에셋은 Python/Pillow로 알파 보존, 투명 여백 정돈, 축소, WebP 인코딩을 했습니다. 캐릭터별 최대 640px, 초상화 640px, 배경 1536×864px입니다.
- 11개 전투 이미지의 실제 알파 채널과 가장자리 여백을 검사했습니다. 얼굴·손발·날개·뼈 구조·워터마크 및 작은 게임 화면의 가장자리를 육안 검토했습니다.
- 최종 파일별 크기·용도는 [ASSETS.md](../ASSETS.md), 실제 원본 프롬프트는 아래 파일에 완전한 문장으로 보관합니다.

| 최종 파일 (public/assets/) | 용도 | 원본 프롬프트 |
| --- | --- | --- |
| `characters/agumon-battle.webp` | 아구몬 | [agumon-battle.txt](prompts/agumon-battle.txt) |
| `characters/greymon-battle.webp` | 그레이몬 | [greymon-battle.txt](prompts/greymon-battle.txt) |
| `characters/metal-greymon-battle.webp` | 메탈그레이몬 | [metal-battle.txt](prompts/metal-battle.txt) |
| `characters/skull-greymon-battle.webp` | 스컬그레이몬 | [skull-battle.txt](prompts/skull-battle.txt) |
| `characters/devimon-battle.webp` | 데블몬 | [devimon-battle.txt](prompts/devimon-battle.txt) |
| `characters/kuwagamon-battle.webp` | 쿠가몬 | [kuwagamon-battle.txt](prompts/kuwagamon-battle.txt) |
| `characters/elecmon-battle.webp` | 에렉몬 | [elecmon-battle.txt](prompts/elecmon-battle.txt) |
| `characters/meramon-battle.webp` | 메라몬 | [meramon-battle.txt](prompts/meramon-battle.txt) |
| `characters/numemon-battle.webp` | 워매몬 | [numemon-battle.txt](prompts/numemon-battle.txt) |
| `characters/andromon-battle.webp` | 안드로몬 | [andromon-battle.txt](prompts/andromon-battle.txt) |
| `characters/ogremon-battle.webp` | 우가몬 | [ogremon-battle.txt](prompts/ogremon-battle.txt) |
| `backgrounds/forest-battle-background.webp` | 파일섬의 숲 | [forest-battle-background.txt](prompts/forest-battle-background.txt) |
| `backgrounds/factory-battle-background.webp` | 버려진 공장 | [factory-battle-background.txt](prompts/factory-battle-background.txt) |
| `backgrounds/mountain-battle-background.webp` | 무한산 | [mountain-battle-background.txt](prompts/mountain-battle-background.txt) |
| `backgrounds/devimon-boss-background.webp` | 데블몬 보스전 | [devimon-boss-background.txt](prompts/devimon-boss-background.txt) |
| `portraits/tai-agumon.webp` | 신태일 · 아구몬 | [tai-agumon.txt](prompts/tai-agumon.txt) |
| `portraits/koushiro-tentomon.webp` | 장한솔 · 텐타몬 | [koushiro-tentomon.txt](prompts/koushiro-tentomon.txt) |
| `portraits/joe-gomamon.webp` | 정석 · 쉬라몬 | [joe-gomamon.txt](prompts/joe-gomamon.txt) |
| `portraits/mimi-palmon.webp` | 이미나 · 팔몬 | [mimi-palmon.txt](prompts/mimi-palmon.txt) |
| `portraits/matt-gabumon.webp` | 매튜 · 파피몬 | [matt-gabumon.txt](prompts/matt-gabumon.txt) |
| `portraits/tk-patamon.webp` | 리키 · 파닥몬 | [tk-patamon.txt](prompts/tk-patamon.txt) |
| `portraits/kari-gatomon.webp` | 신나리 · 가트몬 | [kari-gatomon.txt](prompts/kari-gatomon.txt) |
| `portraits/sora-biyomon.webp` | 한소라 · 피요몬 | [sora-biyomon.txt](prompts/sora-biyomon.txt) |

## 코드로 제작한 요소

- `public/assets/ui/*-icon.svg`: 공격, 방어, 회복, 드로우, 에너지, 유대, 부담, 오염, 지원, 이야기, 휴식, 보스, 진화, 확인, 대상, 닫기, 신호, 데이터. 2026-09-09 Codex 코드 작성 지원으로 신규 제작, 원본 `src/icons.ts`.
- `public/assets/ui/favicon.svg`: 같은 날짜에 육각 데이터 회로와 원형 코어로 신규 제작. 공식 로고가 아닙니다.
- UI 프레임·게이지·연결선·입자·진화 효과: CSS, `src/visual.css`.
- 효과음: 기존 `src/audio.ts`의 Web Audio 오실레이터 합성. 외부 오디오 샘플 없음.
- 글꼴: 운영체제 시스템 글꼴. 외부 폰트 다운로드 없음.

## 추가 교체가 필요한 항목

정상 플레이에 임시 픽셀 아트가 나타나는 항목은 없습니다. 남겨 둔 `public/art/`는 장애 시 fallback입니다. 생성된 그림은 독자적인 팬메이드 해석이며 원작 설정 자료나 공식 디자인 가이드가 아닙니다. 전투 아트는 캐릭터별 정지 포즈 1장이므로, 향후 필요할 때 같은 화풍의 별도 대기·공격 포즈를 추가할 수 있습니다.

---

## 첫 버전 출처 기록 (보존)

## 2026-09-09 · 첫 버전

| 산출물 | 제작 방식과 원본 위치 |
| --- | --- |
| `public/art/agumon.svg`, `greymon.svg`, `metal.svg`, `skull.svg` | Codex의 코드 작성 지원으로 만든 24×24 격자 픽셀풍 파트너 임시 아트. 원본: `scripts/art-source.ts` |
| `public/art/kuwaga.svg`, `elec.svg`, `meramon.svg`, `nume.svg`, `andromon.svg`, `ogre.svg`, `devimon.svg` | 같은 방식으로 제작한 적 임시 아트. 실루엣과 색상으로 구분. 원본: `scripts/art-source.ts` |
| `public/art/file-island.svg` | 이 프로젝트의 숲·공장·산을 표현하도록 새로 작성한 SVG 배경. 원본: `scripts/art-source.ts` |
| 앱 표식, 카드 아이콘과 전투·진화 효과 | 문자/기하 도형 및 CSS. 원본: `src/main.ts`, `src/style.css`. 공식 디지몬 로고가 아님 |
| 효과음 | `src/audio.ts`의 Web Audio 오실레이터로 실시간 합성. 음원 파일·외부 샘플 없음 |
| 글꼴 | 사용자 기기의 시스템 글꼴. 외부 폰트 다운로드·재배포 없음 |

SVG 생성 스크립트: `scripts/export-art.mjs`. 재생성: `npm run art`. 교체 위치와 파일 목록: [ASSETS.md](../ASSETS.md).

## 원본 제작 요청과 프롬프트 기록

**첫 버전 제작 시점에는** 별도의 이미지 생성 도구를 사용하지 않았습니다. 따라서 이미지 모델 전용 프롬프트나 참조 이미지가 없습니다. 언어 모델의 코드 작성은 아래 사용자 원본 요청의 관련 부분을 바탕으로 진행했습니다.

> 짙은 남색 바탕에 밝은 청록과 주황색 포인트
>
> 픽셀풍 또는 단정한 2D 일러스트풍 중 하나로 통일
>
> 캐릭터, 적, 공격, 피격, 진화가 시각적으로 구분될 것
>
> 이미지가 없어도 사용할 수 있는 일관된 임시 아트 제공
>
> 공식 게임이나 애니메이션에서 추출한 이미지·음원을 임의로 다운로드하지 않는다.

이 요청에서 픽셀풍을 선택해 직접 도형과 격자 데이터를 작성했습니다. 특정 공식 이미지의 자세, 구도, 선화와 세부 표현을 복사하기 위한 참조 이미지를 사용하지 않았습니다. 등장인물과 작품 명칭의 제3자 권리는 위 고지와 같이 별도로 존중합니다.

이후 생성형 이미지나 오디오를 추가하면 **파일명, 제작 날짜, 도구/모델, 실제 원본 프롬프트, 참조 자료의 출처**를 이 문서에 추가합니다. 생성물이라는 사실만으로 제3자 권리가 소멸하거나 프로젝트 전체에 사용 허가가 생긴다고 설명하지 않습니다.
