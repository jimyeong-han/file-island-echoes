# 디지몬: 우리들의 모험

플레이: https://jimyeong-han.github.io/file-island-echoes/

1999년 TV 애니메이션 기반의 **비공식 팬메이드 웹게임 v0.6.0**입니다. 반복 현상, 사건, 육성 수치와 진화 조건은 이 게임의 창작 설정입니다. 원작 이미지·음원 추출물을 사용하지 않았습니다.

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
npm run balance   # 8명 × 두 전략 × 고정 시드 100회, 총 1,600회 측정
npm run build    # TypeScript 검사 + 정적 빌드 → dist/
npm run check:pages # 빌드 경로·크롤러 지시·일반적인 비밀정보/개인 경로 패턴 검사
npm run preview  # http://127.0.0.1:3001/file-island-echoes/에서 dist 검증
```

`dist/`만 정적 호스팅합니다. `base: '/file-island-echoes/'`이며 스크립트·CSS·이미지가 동일한 프로젝트 경로를 사용합니다. 폰트는 시스템 글꼴, 음악과 효과음은 직접 제작한 로컬 압축 파일을 Web Audio로 재생하며 외부 주소가 없습니다. 게임 화면은 하나의 문서 내부 상태로 전환되며 `/battle` 같은 서버 경로를 만들지 않습니다. 프로젝트 URL 및 `/file-island-echoes/index.html` 직접 접근과 새로고침을 지원합니다. 새로고침 후 **이어서 탐험**으로 저장 상태를 불러옵니다.

## 저장소 구성과 GitHub Pages

2026-09-09 사용자의 명시적인 요청에 따라 GitHub Pages를 활성화했습니다. 저장소의 구성은 다음과 같습니다.

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
2. Node.js 24에서 `npm ci` → `npm test` → `npm run build` → `npm run check:pages`를 실행합니다. 이 검증이 모두 성공해야 다음 단계로 진행합니다.
3. 저장소 Actions 변수 `PAGES_ENABLED`를 명시적으로 `true`로 설정한 경우에만 Pages 구성, 성공한 `dist/` 아티팩트 업로드와 배포를 수행합니다. `deploy`는 성공한 `build`를 필요로 하며 `github-pages` 환경을 사용합니다. 실패한 빌드나 다른 브랜치는 배포하지 않습니다.
4. 기본 권한은 소스 읽기이며 Pages/OIDC 쓰기 권한은 배포 작업에만 부여합니다. 별도 PAT·API 키·사용자 비밀번호를 브라우저 코드나 저장소에 넣지 않습니다.

현재 Settings → Pages의 Source는 GitHub Actions, 저장소 Actions 변수는 `PAGES_ENABLED=true`입니다. `github-pages` 환경은 `main` 브랜치 배포만 허용합니다. 따라서 앞으로 main의 검증을 통과한 빌드는 같은 사이트에 자동 배포됩니다. 배포를 잠시 중지하려면 이 변수를 false로 바꿀 수 있습니다. 별도의 배포 API 키나 PAT를 코드에 추가할 필요가 없습니다.

현재 배포 주소는 `https://jimyeong-han.github.io/file-island-echoes/`입니다. **공개 저장소의 코드와 배포된 사이트는 누구나 접근할 수 있습니다.** 소수에게만 URL을 전달하더라도 접근 인원이 제한되는 것은 아닙니다. 클라이언트에 가짜 비밀번호 화면을 만들지 않습니다.

## 검색 노출 최소화의 범위

- `index.html`: `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">`
- `public/robots.txt`: `User-agent: *` / `Disallow: /` (빌드에 그대로 복사)
- sitemap, 검색엔진 등록 파일, SEO 구조화 데이터, Open Graph·소셜 홍보 메타데이터를 만들지 않습니다.

**noindex와 robots.txt는 보안 기능이나 접근 통제가 아닙니다.** URL 열기, 복사, 공유를 막지 않으며 검색엔진이 반드시 따르거나 기존 결과가 즉시 사라진다고 보장할 수 없습니다.

GitHub 프로젝트 페이지에서는 이 파일이 `/file-island-echoes/robots.txt`에 놓입니다. 크롤러가 표준적으로 찾는 것은 호스트 루트의 `/robots.txt`이므로, 이 저장소의 파일만으로 `jimyeong-han.github.io`의 루트 크롤링 정책을 바꾸지는 못합니다. 루트 파일 변경은 별도 사이트/저장소 권한과 요청이 필요하며 이번 작업에 포함하지 않습니다. [Google의 robots.txt 위치 안내](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt)

또한 크롤링 자체를 차단하면 크롤러가 HTML의 noindex를 읽지 못할 수 있습니다. 따라서 두 설정을 동시에 넣었다고 검색 제외가 보장되는 것은 아닙니다. [Google의 noindex 안내](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

## 플레이 · 8명과 세 챕터

새 탐험 → 캐릭터 선택 → 전투 방식 확인 → 챕터 선택 → 개인 도입 → 지도/전투/이야기/휴식 → 진화 → 보스 → 개인 엔딩으로 이어집니다. 8명은 처음부터 모두 선택할 수 있습니다.

| 아이 / 파트너 | 전투 방식 | 성장 |
| --- | --- | --- |
| 신태일 / 아구몬 | 첫 공격 강화, 부담을 치르는 용기 | 그레이몬 → 메탈그레이몬, 경고 후 스컬그레이몬 선택 가능 |
| 매튜 / 파피몬 | 다른 카드 종류 연계, 손패 보존 | 가루몬 → 워가루몬 |
| 한소라 / 피요몬 | 첫 방어 보호, 회복·재생 | 버드라몬 → 가루다몬 |
| 장한솔 / 텐타몬 | 첫 조우 분석, 뽑기 순서 재배열 | 캅테리몬 → 아트라캅테리몬 |
| 이미나 / 팔몬 | 정화로 개화 축적·소비 | 니드몬 → 릴리몬 |
| 정석 / 쉬라몬 | 남은 에너지 비축, 부족한 자원 보충 | 원뿔몬 → 쥬드몬 |
| 리키 / 파닥몬 | 제한된 희망 축적, 생존 또는 회복 | 엔젤몬 → 홀리엔젤몬 |
| 신나리 / 가트몬 | 적 강화 제거, 빛 표식·정화 | 빛의 공명 → 엔젤우몬 |

가트몬은 성숙기로 시작합니다. 빛의 공명은 같은 종의 능력 강화이며 새로운 공식 진화체가 아닙니다. 진화 조건·예상 효과·강제 진화의 비용은 확인 화면에 표시합니다.

- 완성된 챕터: 파일섬/데블몬, 서버대륙/에테몬, 현실 세계/묘티스몬. 캐릭터별로 앞 챕터를 완료하면 다음 챕터가 열립니다. 4장은 제작하지 않았습니다.
- 각 챕터 11개 장소, 보스 포함 5회 전투. 갈림길·보상 선택과 3개의 개인 이벤트가 실제 덱·유대·부담·진화에 반영됩니다.
- 공용 카드 5종, 캐릭터별 전용 획득 카드 6종, 진화 카드 17종으로 총 70종입니다. 시작 덱은 10장/6종이며 캐릭터마다 다릅니다.
- 지속 능력 8개와 조건부 전투당 1회 문장 능력 8개. 현재 조건·중첩·봉인·사용 여부와 키워드 설명을 전투 HUD에서 확인합니다.
- 일반 적 17종, 강적 4종, 챕터 보스 3종, 지원 디지몬 4종. 조종된 적은 승리 후 오염 해제로 서술합니다.
- 매 턴 에너지 3·드로우 5장. 남은 손패는 버리고, 뽑기 더미 소진 시 버림 더미를 섞습니다. 방어는 다음 내 턴 시작에 초기화합니다. 적의 행동은 아이콘·수치로 예고합니다.
- 카드 보상 3장 중 1장 또는 건너뛰기. 보급·회복은 제한되며 보스는 장기전에서 강해집니다. 손패·예고를 읽고 방어·약화·정화를 선택해야 합니다.
- 클릭·터치·Tab/Enter 조작을 지원하며 핵심 버튼은 높이 44px 이상입니다. 모션 감소와 음소거는 설정에서 변경합니다.

정확한 카드·능력·개인 스토리·진화 조건은 [콘텐츠 문서](docs/CONTENT.md), 원작 등장 확인 범위는 [출처 기록](docs/CANON-SOURCES.md), 자동 전략의 비교는 [밸런스 기록](BALANCE.md)을 참조하세요.

## 저장과 이전 버전 이관

저장 버전은 2, 키는 `file-island-echoes:v2`입니다. 노드 진입·카드 사용·턴 종료·선택 완료·진화 확정 등 성공한 행동 직후 저장합니다. 선택 캐릭터·챕터·손패/뽑기/버림/소멸 더미·적 행동·문장 상태·개인 이야기 플래그·난수 상태가 복원됩니다.

v2가 없으면 이전 `file-island-echoes:v1`을 읽어 신태일/파일섬 탐험으로 변환합니다. 이전 도감·설정·클리어 기록을 보존하고 새 능력 필드만 기본값으로 채웁니다. 진행 중이던 이전 이벤트는 그 이벤트로 마무리할 수 있습니다. v1 원본은 삭제하지 않습니다. 새로운 카드 수치와 적 패턴은 이관 후 적용되며 진행 중 적 HP는 저장값을 유지합니다.

손상된 탐험은 설명 메시지와 함께 제외하되 복구 가능한 도감·설정을 보존합니다. 저장이 차단된 브라우저에서도 게임은 실행됩니다. 새로고침 후 타이틀의 **이어서 탐험**을 누르세요. 다른 아이의 새 탐험은 독립된 시작 상태를 사용합니다. 영구 능력치 강화·계정·클라우드 동기화는 없습니다.

## 코드와 에셋

| 위치 | 역할 |
| --- | --- |
| `src/content/characters.ts` | 8명, 문장 설명, 파트너 진화와 개인 도입/엔딩 |
| `src/content/cards.ts` | 70개 카드, 효과 필드와 키워드 설명 |
| `src/content/enemies.ts` | 적 패턴·저항·정화 여부·도감, 지원 디지몬 |
| `src/content/chapters.ts`, `stories.ts` | 챕터·노드·개인 이벤트 |
| `src/types.ts`, `engine.ts` | 상태 타입, 화면과 독립된 전투/진화 규칙 |
| `src/storage.ts` | 저장 검증·v1 이관·캐릭터별 프로필 |
| `src/main.ts`, `expansion.css` | 선택·상세·챕터·문장 HUD·게임 화면 |
| `src/asset-manifest.json`, `src/art.ts` | Pages base를 적용한 이미지 연결·fallback |
| `public/assets/` | 배경·캐릭터·초상화·UI 에셋 |

이번에 새 래스터 일러스트 41개와 SVG 캐릭터 2개를 추가했습니다. 총 66개 이미지입니다. 데미데블몬·츄몬은 이미지 생성 출력 실패로 직접 작성한 SVG를 사용하며 다른 캐릭터보다 표현이 단순합니다. [ASSETS.md](ASSETS.md)에 전체 파일·용량·교체 위치, [assets/ATTRIBUTION.md](assets/ATTRIBUTION.md)에 제작 방식과 프롬프트를 기록했습니다.

## 확인된 범위와 제한

- 29개 자동 테스트, 8명 모두의 3챕터 승리 가능성, 1,600회 전략 비교를 수행했습니다. [VALIDATION.md](VALIDATION.md)에 브라우저 조작과 결과를 기록했습니다.
- 비오디오 Pages 전송량 약 5.4MiB, 타이틀 초기 리소스 약 0.4MiB입니다. 오디오는 입력 후 지연 로딩하며 별도 전체 용량은 13.82MiB입니다. 원본 PNG와 사용하지 않는 전체 이미지 묶음을 초기 로딩하지 않습니다.
- 10~15분은 설계 목표이며 사람 대상 소요 시간·승률 조사는 아직 하지 않았습니다. 자동 전략에서 태일과 소라가 비교적 쉽습니다.
- 세 챕터가 모두 플레이 가능하지만 개인 이벤트는 공통 틀 안의 3개 장면을 재사용합니다. 후속 챕터 전용 개인 장면과 4장은 추후 콘텐츠입니다.
- 정지 일러스트와 CSS 연출을 사용하며 프레임 애니메이션·성우는 없습니다. 직접 제작한 배경음악 12곡을 포함합니다.
- Chromium의 모바일 크기에서 검증했습니다. 실제 iOS Safari/Android 기기 검증은 별도로 필요합니다.

## v0.5 오디오

타이틀에서 소리를 켜세요. 설정에서 전체·음악·효과음 음량을 각각 조절하고 미리 들을 수 있습니다. 12곡, 징글 17개, 효과음 41개를 화면·카드·속성·문장·진화·결과에 연결했습니다. 기존 탐험은 그대로 유지됩니다. [AUDIO.md](AUDIO.md)에 전체 목록, 제작 소스, 용량, 루프 검수와 브라우저 검증을 기록했습니다.

게임 표시명은 「디지몬: 우리들의 모험」입니다. 저장소·패키지와 Pages 경로의 식별자는 `file-island-echoes`를 유지합니다. 로컬 웹폰트와 교체 방법은 [TYPOGRAPHY.md](TYPOGRAPHY.md)를 참고하세요.
