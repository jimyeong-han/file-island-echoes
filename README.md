# 디지몬 어드벤처 — 파일섬의 잔향

1999년 TV 애니메이션 기반의 **비공식 팬메이드 웹게임 첫 버전**입니다. 반복 현상, 사건, 육성 수치와 진화 조건은 이 게임의 창작 설정입니다. 원작 이미지·음원 추출물을 사용하지 않았습니다.

개발자와 지인 1–2명이 URL로 테스트하는 소규모 비영리 팬 프로토타입입니다. 공개 홍보를 목적으로 하지 않으며 광고, 후원, 결제, 분석 도구, 사용자 추적 기능을 넣지 않습니다.

> Unofficial, non-commercial fan project.
> This project is not affiliated with or endorsed by Bandai,
> Toei Animation, or any related rights holder.
> Third-party names and characters belong to their respective rights holders.

관련 권리자와 제휴하거나 승인을 받은 프로젝트가 아닙니다. 코드와 에셋 전체에 적용되는 오픈소스 라이선스를 추가하지 않습니다. 이 고지는 제3자 권리에 대한 허가를 뜻하지 않습니다. 게임 상단 **정보**에서도 같은 고지를 볼 수 있습니다.

## 실행

Node.js 22.12 이상 권장. 아트 재생성 명령은 Node.js 24에서 확인했습니다.

```sh
npm ci
npm run dev
```

브라우저에서 `http://127.0.0.1:3000/file-island-echoes/`을 여세요.

```sh
npm test          # 전투·진화·저장·전체 탐험 자동 검증
npm run build    # TypeScript 검사 + 정적 빌드 → dist/
npm run check:pages # 빌드 경로·크롤러 지시·일반적인 비밀정보/개인 경로 패턴 검사
npm run preview  # http://127.0.0.1:3001/file-island-echoes/에서 dist 검증
```

`dist/`만 정적 호스팅합니다. `base: '/file-island-echoes/'`이며 스크립트·CSS·이미지가 동일한 프로젝트 경로를 사용합니다. 폰트는 시스템 글꼴, 소리는 Web Audio 합성이므로 외부 주소가 없습니다. 게임 화면은 하나의 문서 내부 상태로 전환되며 `/battle` 같은 서버 경로를 만들지 않습니다. 프로젝트 URL 및 `/file-island-echoes/index.html` 직접 접근과 새로고침을 지원합니다. 새로고침 후 **이어서 탐험**으로 저장 상태를 불러옵니다.

## 저장소 구성과 GitHub Pages

저장소의 구성은 다음과 같습니다. **코드 업로드와 Pages 사이트 공개는 별도 작업입니다.** Pages 공개 활성화는 사용자의 명시적인 요청 이후에만 수행합니다.

| 항목 | 설정 |
| --- | --- |
| 저장소 | `jimyeong-han/file-island-echoes` |
| 패키지 | `file-island-echoes` (`private: true`는 npm 게시 방지이며 GitHub 접근 제한이 아님) |
| 설명 | `Small browser game prototype` |
| 기본 브랜치 | `main` |
| 공개 범위 | GitHub Free 공개 저장소 |
| 호스팅 | GitHub Pages, GitHub Actions 빌드/배포 |
| Topics / Releases | 추가·발행하지 않음 |
| Discussions / Wiki | 사용하지 않음, 비활성화 |
| 프로젝트 전체 라이선스 | 추가하지 않음. 의존성 자체의 라이선스는 별개 |

워크플로: [.github/workflows/pages.yml](.github/workflows/pages.yml). [GitHub의 Pages 공식 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)에 따라 빌드와 배포 작업을 분리합니다.

1. `main` push 또는 수동 실행으로 시작합니다. 수동으로 다른 브랜치를 선택하면 작업을 건너뜁니다.
2. Node.js 24에서 `npm ci` → `npm test` → `npm run build` → `npm run check:pages`를 실행합니다. 기본적으로 이 검증만 수행합니다.
3. 저장소 Actions 변수 `PAGES_ENABLED`를 명시적으로 `true`로 설정한 경우에만 Pages 구성, 성공한 `dist/` 아티팩트 업로드와 배포를 수행합니다. `deploy`는 성공한 `build`를 필요로 하며 `github-pages` 환경을 사용합니다. 실패한 빌드나 다른 브랜치는 배포하지 않습니다.
4. 기본 권한은 소스 읽기이며 Pages/OIDC 쓰기 권한은 배포 작업에만 부여합니다. 별도 PAT·API 키·사용자 비밀번호를 브라우저 코드나 저장소에 넣지 않습니다.

**나중에 사용자가 명시적으로 사이트 공개를 요청한 경우에만** Settings → Pages의 Source를 GitHub Actions로 설정하고, 저장소 Actions 변수 `PAGES_ENABLED=true`를 추가한 뒤 `main`의 워크플로를 수동 실행합니다. `github-pages` 환경의 허용 배포 브랜치도 `main`으로 제한합니다. 워크플로에는 Pages 자동 활성화 옵션이 없습니다. 공개 요청 전에는 코드 push만으로 사이트가 배포되지 않습니다.

배포 후 예상 주소는 `https://jimyeong-han.github.io/file-island-echoes/`입니다. **공개 저장소의 코드와 배포된 사이트는 누구나 접근할 수 있습니다.** 소수에게만 URL을 전달하더라도 접근 인원이 제한되는 것은 아닙니다. 클라이언트에 가짜 비밀번호 화면을 만들지 않습니다.

## 검색 노출 최소화의 범위

- `index.html`: `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">`
- `public/robots.txt`: `User-agent: *` / `Disallow: /` (빌드에 그대로 복사)
- sitemap, 검색엔진 등록 파일, SEO 구조화 데이터, Open Graph·소셜 홍보 메타데이터를 만들지 않습니다.

**noindex와 robots.txt는 보안 기능이나 접근 통제가 아닙니다.** URL 열기, 복사, 공유를 막지 않으며 검색엔진이 반드시 따르거나 기존 결과가 즉시 사라진다고 보장할 수 없습니다.

GitHub 프로젝트 페이지에서는 이 파일이 `/file-island-echoes/robots.txt`에 놓입니다. 크롤러가 표준적으로 찾는 것은 호스트 루트의 `/robots.txt`이므로, 이 저장소의 파일만으로 `jimyeong-han.github.io`의 루트 크롤링 정책을 바꾸지는 못합니다. 루트 파일 변경은 별도 사이트/저장소 권한과 요청이 필요하며 이번 작업에 포함하지 않습니다. [Google의 robots.txt 위치 안내](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt)

또한 크롤링 자체를 차단하면 크롤러가 HTML의 noindex를 읽지 못할 수 있습니다. 따라서 두 설정을 동시에 넣었다고 검색 제외가 보장되는 것은 아닙니다. [Google의 noindex 안내](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

## 플레이

- 아구몬과 시작 덱 10장으로 출발합니다. 3구역, 11단계에서 한 경로를 고르며 보스 포함 5회 전투를 치릅니다.
- 적을 눌러 대상 선택, 카드 클릭/터치로 즉시 사용, 턴 종료로 적 행동. Tab/Enter 키도 지원합니다.
- 매 턴 에너지 3·드로우 5장, 남은 손패는 버림, 뽑기 더미 소진 시 버림 더미 재섞기.
- 방어는 다음 내 턴 시작에 초기화. 약화는 적 공격 피해 40% 감소. 오염은 턴 종료에 직접 체력 손상하며 정화 카드와 휴식으로 제거합니다.
- 전투 보상 3장 중 1장 선택 또는 건너뛰기. 완료 시 체력 5 회복. 상단 보급품은 에너지 없이 체력 18 회복.
- 지도에서 진화를 선택합니다. 그레이몬은 에너지 5, 메탈그레이몬은 그레이몬 상태에서 에너지 14·유대 7, 스컬그레이몬은 그레이몬 상태에서 에너지 12·부담 6이 필요합니다.
- 강제 진화에는 명시적 경고와 확인 단계가 있습니다. 스컬그레이몬은 매 턴 체력 2를 소모하고 전용 공격도 자기 손상을 일으킵니다. 진화 후 전용 카드와 전투 보너스가 실제 적용됩니다.
- 카드 16종, 적 6종과 데블몬, 지원 인물 7팀, 이야기 이벤트 9종과 소라의 휴식 이벤트를 제공합니다.

## 저장

`localStorage` 키는 `file-island-echoes:v1`입니다. 노드 진입·카드 사용·턴 종료·선택 완료·진화 확정 등 **성공한 행동 직후** 동일한 방식으로 저장합니다. 손패, 버림/뽑기 더미, 난수 상태, 적 행동 단계까지 저장되어 재개할 때 다시 추첨하지 않습니다.

새로고침 → 타이틀의 **이어서 탐험**으로 복귀합니다. 완료한 탐험은 재개 대상에서 제외됩니다. 새 탐험은 체력·덱·진화가 초기화되며 도감, 발견 이야기, 구역/클리어 기록, 소리·접근성 설정만 계승합니다. 영구 능력치 강화는 없습니다.

손상된 JSON, 잘못된 버전·타입·중첩 데이터·참조를 검사합니다. 잘못된 현재 탐험을 제외하고 가능한 도감과 설정을 유지합니다. 저장 차단이나 용량 초과 시 경고를 표시하며 현재 탭에서는 계속 플레이할 수 있습니다. 브라우저·주소·포트가 달라지면 저장 공간도 달라집니다.

## 코드 구성

| 파일 | 역할 |
| --- | --- |
| `src/types.ts` | 게임 상태와 콘텐츠 타입 |
| `src/data.ts` | 카드, 적 패턴, 지도, 지원 이벤트, 진화 조건 설명 |
| `src/engine.ts` | 화면과 독립된 전투·이벤트·보상·진화 규칙, 결정적 난수 |
| `src/storage.ts` | 저장 검증·복구·도감 갱신 |
| `src/main.ts` | 화면, 입력, 미리보기/경고, 상태와 화면 연결 |
| `src/style.css` | 데스크톱/모바일, 모션 감소, 카드와 전투 연출 |
| `src/art.ts`, `public/art/` | 에셋 경로와 직접 제작한 임시 SVG |
| `src/audio.ts` | 입력 이후 Web Audio 짧은 효과음, 기본 음소거 |
| `src/engine.test.ts` | 주요 위험과 전체 플레이 흐름 회귀 검사 |

임시 아트는 `public/art/`에서 교체합니다. 자세한 방법은 [ASSETS.md](ASSETS.md), 제작 출처와 원본 요청은 [assets/ATTRIBUTION.md](assets/ATTRIBUTION.md), 실행 검증 기록은 [VALIDATION.md](VALIDATION.md)를 참조하세요.

## 현재 제한

- 임시 픽셀 아트와 간단한 효과음이며 별도 고해상도 일러스트, 성우, 배경음악은 없습니다.
- 10–15분은 설계 목표이며 사람을 대상으로 한 소요 시간·난이도 조정은 아직 하지 않았습니다. 숙련 플레이는 더 짧을 수 있습니다.
- 브라우저의 모바일 화면 크기로 검증했습니다. 실제 iOS Safari/Android 기기 검증은 별도로 필요합니다.
- 클라우드 동기화, 계정, 멀티플레이, 추가 파트너/궁극체는 없습니다.
