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

## 2026-09-10 · 8인 확장

새 래스터 41개는 Codex 내장 imagegen 도구로 각각 생성했습니다. 별도 API/CLI 경로는 사용하지 않았습니다. 팔몬 수정에는 기존 프로젝트 생성물 `public/assets/portraits/mimi-palmon.webp`만 색·선화 참조로 사용했습니다. 외부 공식 이미지·스프라이트·로고·음원은 입력하거나 다운로드하지 않았습니다. 모든 프롬프트는 `assets/prompts/v0.4/`에 기록했습니다. 실패한 시도의 프롬프트도 보존하며, 최종 파일과 연결한 요청은 아래와 같습니다.

데미데블몬·츄몬은 이미지 생성 출력 검사에서 반복 실패하여 새 SVG를 직접 작성했습니다. 이는 이미지 생성 결과나 공식 원본 추출물이 아닙니다. 두 파일은 향후 같은 화풍의 래스터로 교체할 수 있습니다. 전투 상태 아이콘 8개와 데이터 심볼 fallback 역시 직접 작성한 SVG입니다.

| 파일 (public/assets/) | 제작 방식 및 최종 프롬프트 |
| --- | --- |
| `characters/gabumon-battle.webp` | imagegen · [gabumon-battle.txt](prompts/v0.4/gabumon-battle.txt) |
| `characters/tentomon-battle.webp` | imagegen · [tentomon-battle.txt](prompts/v0.4/tentomon-battle.txt) |
| `characters/frigimon-battle.webp` | imagegen · [frigimon-battle-v2.txt](prompts/v0.4/frigimon-battle-v2.txt) |
| `characters/monochromon-battle.webp` | imagegen · [monochromon-battle-v2.txt](prompts/v0.4/monochromon-battle-v2.txt) |
| `characters/palmon-battle.webp` | imagegen · [palmon-battle-v2.txt](prompts/v0.4/palmon-battle-v2.txt) |
| `characters/angemon-battle.webp` | imagegen · [angemon-battle.txt](prompts/v0.4/angemon-battle.txt) |
| `characters/angewomon-battle.webp` | imagegen · [angewomon-battle.txt](prompts/v0.4/angewomon-battle.txt) |
| `characters/bakemon-battle.webp` | imagegen · [bakemon-battle.txt](prompts/v0.4/bakemon-battle.txt) |
| `characters/birdramon-battle.webp` | imagegen · [birdramon-battle.txt](prompts/v0.4/birdramon-battle.txt) |
| `characters/biyomon-battle.webp` | imagegen · [biyomon-battle.txt](prompts/v0.4/biyomon-battle.txt) |
| `characters/centarumon-battle.webp` | imagegen · [centarumon-battle.txt](prompts/v0.4/centarumon-battle.txt) |
| `characters/cockatrimon-battle.webp` | imagegen · [cockatrimon-battle.txt](prompts/v0.4/cockatrimon-battle.txt) |
| `characters/dark-tyrannomon-battle.webp` | imagegen · [dark-tyrannomon-battle.txt](prompts/v0.4/dark-tyrannomon-battle.txt) |
| `characters/etemon-battle.webp` | imagegen · [etemon-battle.txt](prompts/v0.4/etemon-battle.txt) |
| `characters/garudamon-battle.webp` | imagegen · [garudamon-battle.txt](prompts/v0.4/garudamon-battle.txt) |
| `characters/garurumon-battle.webp` | imagegen · [garurumon-battle.txt](prompts/v0.4/garurumon-battle.txt) |
| `characters/gatomon-battle.webp` | imagegen · [gatomon-battle.txt](prompts/v0.4/gatomon-battle.txt) |
| `characters/gazimon-battle.webp` | imagegen · [gazimon-battle.txt](prompts/v0.4/gazimon-battle.txt) |
| `characters/gomamon-battle.webp` | imagegen · [gomamon-battle.txt](prompts/v0.4/gomamon-battle.txt) |
| `characters/ikkakumon-battle.webp` | imagegen · [ikkakumon-battle.txt](prompts/v0.4/ikkakumon-battle.txt) |
| `characters/kabuterimon-battle.webp` | imagegen · [kabuterimon-battle.txt](prompts/v0.4/kabuterimon-battle.txt) |
| `characters/leomon-battle.webp` | imagegen · [leomon-battle.txt](prompts/v0.4/leomon-battle.txt) |
| `characters/lillymon-battle.webp` | imagegen · [lillymon-battle.txt](prompts/v0.4/lillymon-battle.txt) |
| `characters/magna-angemon-battle.webp` | imagegen · [magna-angemon-battle.txt](prompts/v0.4/magna-angemon-battle.txt) |
| `characters/mega-kabuterimon-battle.webp` | imagegen · [mega-kabuterimon-battle.txt](prompts/v0.4/mega-kabuterimon-battle.txt) |
| `characters/mojyamon-battle.webp` | imagegen · [mojyamon-battle.txt](prompts/v0.4/mojyamon-battle.txt) |
| `characters/myotismon-battle.webp` | imagegen · [myotismon-battle.txt](prompts/v0.4/myotismon-battle.txt) |
| `characters/patamon-battle.webp` | imagegen · [patamon-battle.txt](prompts/v0.4/patamon-battle.txt) |
| `characters/phantomon-battle.webp` | imagegen · [phantomon-battle.txt](prompts/v0.4/phantomon-battle.txt) |
| `characters/piccolomon-battle.webp` | imagegen · [piccolomon-battle.txt](prompts/v0.4/piccolomon-battle.txt) |
| `characters/raremon-battle.webp` | imagegen · [raremon-battle.txt](prompts/v0.4/raremon-battle.txt) |
| `characters/seadramon-battle.webp` | imagegen · [seadramon-battle.txt](prompts/v0.4/seadramon-battle.txt) |
| `characters/shellmon-battle.webp` | imagegen · [shellmon-battle.txt](prompts/v0.4/shellmon-battle.txt) |
| `characters/sukamon-battle.webp` | imagegen · [sukamon-battle.txt](prompts/v0.4/sukamon-battle.txt) |
| `characters/togemon-battle.webp` | imagegen · [togemon-battle.txt](prompts/v0.4/togemon-battle.txt) |
| `characters/unimon-battle.webp` | imagegen · [unimon-battle.txt](prompts/v0.4/unimon-battle.txt) |
| `characters/were-garurumon-battle.webp` | imagegen · [were-garurumon-battle.txt](prompts/v0.4/were-garurumon-battle.txt) |
| `characters/whamon-battle.webp` | imagegen · [whamon-battle.txt](prompts/v0.4/whamon-battle.txt) |
| `characters/zudomon-battle.webp` | imagegen · [zudomon-battle.txt](prompts/v0.4/zudomon-battle.txt) |
| `characters/chuumon-battle.svg` | 직접 작성한 벡터 일러스트. 향후 래스터 교체 후보. |
| `characters/demi-devimon-battle.svg` | 직접 작성한 벡터 일러스트. 향후 래스터 교체 후보. |
| `backgrounds/server-battle-background.webp` | imagegen · [server-battle-background.txt](prompts/v0.4/server-battle-background.txt) |
| `backgrounds/city-battle-background.webp` | imagegen · [city-battle-background.txt](prompts/v0.4/city-battle-background.txt) |

## 2026-09-10 · v0.5 직접 제작 오디오

음악 12곡, 징글 17개, 효과음 41개를 이 프로젝트 전용 악보와 로컬 신시사이저로 새로 제작했습니다. 공식/외부 음원, 효과음 샘플, 보이스, 특정 곡이나 작곡가 모방 요청을 사용하지 않았습니다. 파일별 용도·길이·제작 방법과 재생성 소스는 [AUDIO.md](../AUDIO.md)에 기록했습니다. `public/assets/audio/`의 모든 OGG/MP3에 적용됩니다.


## 2026-09-10 · v0.6 초상화와 서체

- `public/assets/portraits/kari-gatomon-adventure.webp`: 캐릭터 선택·상세·스토리·엔딩·도감용. 내장 imagegen으로 프로젝트 자체 생성 초상화의 얼굴·체구를 다시 그린 뒤 사용자가 제공한 이미지의 의상 색과 구성만 참고하여 재편집. 640×640 WebP로 최적화. [연령 수정 프롬프트](prompts/v0.6/kari-gatomon-young.txt), [의상 수정 프롬프트](prompts/v0.6/kari-outfit.txt). 공식 캡처/추출물을 실제 에셋으로 재사용하거나 참고 이미지의 선화·자세·구도를 트레이싱하지 않았다. 참고 이미지 자체는 배포하지 않는다. 기존 `kari-gatomon.webp`를 대체하며 추가 교체 예정 없음.
- `public/assets/fonts/galmuri11-bold.woff2`, `pretendard-variable.woff2`: 공식 공개 저장소에서 받은 SIL OFL 1.1 서체. 생성형 에셋이 아니며 각 저작자·원문 라이선스와 소스 커밋은 [TYPOGRAPHY.md](../TYPOGRAPHY.md)에 기록했다. 라이선스 원문은 파일 옆에 포함한다.
- `src/icons.ts`의 `sound-on`, `sound-off`: 24px 격자/1.8px 선 굵기로 직접 작성한 인터페이스 SVG.

## 2026-09-11 · v0.6.1

내장 imagegen으로 기존 프로젝트 팬 일러스트를 편집했다. 공식 추출 에셋은 사용하지 않았다. WebP 최적화본만 배포한다. 아래 네 파일은 이 버전의 최종 교체본이며 원본 요청과 수정 요청은 assets/prompts/v0.6.1/에 저장했다.

- `portraits/koushiro-tentomon-adventure.webp`
- `portraits/tk-patamon-adventure.webp`
- `portraits/kari-gatomon-short-hair.webp`
- `characters/angewomon-asymmetric-battle.webp`

- 한솔: koushiro-tentomon-adventure.txt → koushiro-centered-pineapple.txt (사용자 정중앙 요청).
- 리키: tk-patamon-adventure.txt → tk-hat-no-earflaps.txt (사용자 귀덮개 제거 요청).
- 나리: kari-gatomon-short-hair.txt. 이전 생성 요청의 헤어 용어는 정정하고 원문은 Git 이력에 보존했다.
- 엔젤우몬: angewomon-asymmetric-battle.txt → angewomon-alpha.txt → angewomon-chroma.txt. 투명 요청은 RGB 체커 패턴이 나와 채택하지 않았다. 최종 단색 녹색 배경 생성본에 크로마키 알파/녹색 가장자리 제거 후 640px WebP로 변환했다.
- src/crests.ts 및 public/assets/ui/crest-*-icon.svg: 24px/1.8px SVG 직접 제작. 자료 대조는 docs/CANON-SOURCES.md. device-icon.svg와 favicon.svg는 독자적인 원형 장치/산/신호선 심볼이다.

## v0.6.2 · 2026-09-11

`characters/gatomon-balanced-battle.webp`: 사용자 정정에 따라 단독 스프라이트를 내장 imagegen으로 재제작. [생성 요청](prompts/v0.6.2/gatomon-balanced-battle.txt). 단색 녹색 배경을 알파 WebP로 최적화. 공식 추출 에셋 사용 없음. 초상화는 유지.

## v0.7.1 · 2026-09-11 · 가트몬의 매끈한 셀 셰이딩

프로젝트 기존 생성 이미지를 편집 대상으로 내장 imagegen을 사용했다. 공식 이미지·음원·추출 에셋은 사용하지 않았다.

| 최종 파일 | 용도 | 생성 요청 | 후처리 |
| --- | --- | --- | --- |
| `portraits/kari-gatomon-smooth.webp` | 신나리 동반 초상화 | [원본 프롬프트](prompts/v0.7.1/kari-gatomon-smooth.txt) | 640px RGB WebP 최적화 |
| `characters/gatomon-smooth-battle.webp` | 가트몬 단독 전투·공명·도감 | [원본 프롬프트](prompts/v0.7.1/gatomon-smooth-battle.txt) | 녹색 배경을 알파로 변환하고 가장자리 녹색 제거, 640px WebP 최적화 |

가슴·목의 털 뭉치와 몸의 잔털 표현을 제거했다. 귀 끝과 꼬리의 보라색 실루엣은 유지했다. 기존 자세와 의상은 편집의 고정 조건으로 사용했다. 이전 두 파일은 위 파일로 교체했다. 추가 교체 필수 항목 없음. 생성 원본은 배포하지 않는다.

## v0.8 · 2026-09-11 · 카드 뒷면

`public/assets/ui/card-back.svg`: 프로젝트를 위해 코드로 직접 제작한 대칭 회로·육각형·원형 데이터 장치 문양. 남색·청록·금색의 전용 카드 뒷면이며 공식 카드 프레임/이미지나 로고를 사용하지 않았다. 생성형 도구를 사용하지 않은 SVG이므로 이미지 생성 프롬프트는 없다. 앞면 기술 도형은 프로젝트 SVG 아이콘과 CSS 회로를 조합한다. 교체 위치는 `src/card-ui.ts`의 공통 참조다. 추가 래스터·음원·영상 또는 런타임 의존성은 없다.

## PWA icons · 2026-09-11

`public/assets/pwa/icon-192.png`, `icon-512.png`, `maskable-192.png`, `maskable-512.png`, `apple-touch-icon.png`: existing project-authored circular device motif redrawn in Python/Pillow by `scripts/create-pwa-icons.py`, then antialiased downsampling. Design brief: navy field, cyan circular device and screen, orange data trace, central 80% safe zone, no text. No image generator, official logo or extracted artwork used. No replacement required for the prototype.
