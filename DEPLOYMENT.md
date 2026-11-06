# Vercel와 GitHub Pages 배포

2026-11-06 기준. 게임은 정적 Vite 빌드다. v0.15부터 선택적 계정 저장에 외부 Supabase Auth/Postgres를 사용하며 자체 서버나 분석 도구는 추가하지 않는다. 저장소 공개 범위와 사이트의 접근 정책은 별개다. 이번 이전에서 저장소를 비공개로 바꾸거나 배포 인증 정책을 변경하지 않는다.

## 환경별 명령

Node.js 24, `npm ci` 후 실행한다. 두 빌드 모두 `dist/`를 새로 만들므로 마지막으로 실행한 대상만 남는다.

| 대상 | 개발 | 빌드와 검사 | 미리보기 | base |
| --- | --- | --- | --- | --- |
| Pages | `npm run dev` | `npm run build:pages && npm run check:pages` | `npm run preview` | `/file-island-echoes/` |
| Vercel | `npm run dev:vercel` | `npm run build:vercel && npm run check:vercel` | `npm run preview:vercel` | `/` |

기존 `npm run build`는 Pages다. `config/deployment.mjs`가 두 환경의 기준이며 Vite, PWA 생성, 검사 도구가 같은 값을 사용한다. `deployment.json`은 빌드 대상, `pwa-build.json`은 리소스 해시와 base를 기록한다. manifest id/start_url/scope와 worker URL도 대상에 맞게 생성한다. 그림·폰트·오디오는 Vite BASE_URL을 사용한다. `/` 또는 프로젝트 경로 및 그 안의 `index.html`로 직접 접근한다. 게임 내부 화면은 별도 서버 경로가 아니다.

Vercel 설정은 `vercel.json`에 있다. framework는 Vite, install은 `npm ci`, build는 `npm run build:vercel && npm run check:vercel`, output은 `dist`다. 모든 응답에 X-Robots-Tag를 설정하고 worker/manifest/빌드 메타데이터는 재검증하도록 한다. 비밀 환경 변수는 필요 없다. `.vercel/`, `.env*`, 로컬 QA와 원본 제작 자료는 CLI 업로드에서 제외한다. 클라이언트 빌드에는 Supabase 공개 URL/publishable 키만 설정한다. 관리 토큰이나 service-role 키는 넣지 않는다. 인증 후 사용자 세션은 SDK가 별도로 관리한다.

Pages Actions는 main에서 테스트 → Vercel 빌드 검사 → Pages 빌드 검사 후 Pages 산출물만 배포한다. `PAGES_ENABLED=true`일 때만 공개 배포하며 기존 주소를 유지한다.

## GitHub 연결

1. 사용할 Vercel 개인 계정에 로그인한다. 개인 계정 Settings → Authentication에서 GitHub `jimyeong-han` 연결을 확인한다. 프로젝트 Settings와 다른 메뉴다.
2. Vercel GitHub App에서 해당 저장소 접근을 허용한다. 저장소 선택이 가능하면 `file-island-echoes`만 허용한다.
3. Vercel 프로젝트 `file-island-echoes`의 Git 설정에서 저장소와 production branch `main`을 연결한다. 이미 프로젝트가 있으면 새 프로젝트를 중복 생성하지 않는다.
4. 이후 main의 성공한 Vercel 빌드가 production으로 배포된다. CLI로는 연결된 작업 공간에서 `vercel --prod`를 사용한다. 토큰을 채팅이나 소스에 공유할 필요가 없다.

현재 공식 조건은 다음과 같다.

- Hobby는 개인·비상업 용도이며 사용량 제한이 있다. 개인 소유 Private 저장소는 지원하지만 GitHub 조직 소유 Private 저장소는 Hobby에서 지원하지 않는다. Private 저장소의 자동 배포는 커밋 작성자가 Hobby 소유 계정과 연결된 Git 계정으로 확인되어야 한다. [Hobby](https://vercel.com/docs/plans/hobby), [Git 배포](https://vercel.com/docs/git), [작성자 조건](https://vercel.com/docs/deployments/troubleshoot-project-collaboration)
- 개인 저장소를 가져오는 GitHub 계정은 저장소 소유자여야 하며 Vercel GitHub App에 저장소 접근 권한이 있어야 한다. 계정 로그인 연결과 App의 저장소 권한은 각각 확인한다. [GitHub 연결](https://vercel.com/docs/git/vercel-for-github), [계정 Authentication](https://vercel.com/docs/accounts)
- Private 저장소로 바꿔도 배포된 URL이 자동 비공개가 되는 것은 아니다. Standard Protection은 production 도메인을 제외한다. 2026-09부터 모든 요금제에서 Vercel Authentication의 All Deployments로 production도 보호할 수 있다. 이는 Vercel 로그인과 접근 허가를 요구하는 별도 설정이다. [보호 범위](https://vercel.com/docs/deployment-protection), [변경 공지](https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan)
- Hobby의 외부 사용자 접근 허가는 계정당 1명, sharable link도 계정당 1개 제한이다. 공유 링크는 소지자가 접근할 수 있어 사람별 인증과 다르다. Password Protection은 Hobby에 포함되지 않으며 Pro 추가 요금 또는 Enterprise 조건이다. 지인 2명에게 제한 접근을 제공하려면 이 제약을 먼저 검토한다. 이번 작업에서 유료 옵션이나 공유 우회 링크를 활성화하지 않는다. [Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication), [공유 링크](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/sharable-links), [요금제별 방법](https://vercel.com/docs/deployment-protection)

저장소를 나중에 Private으로 전환하면 GitHub Free Pages 지원도 별도로 확인해야 한다. 버그 신고의 GitHub 작성에는 계정과 저장소 접근 권한이 필요하다. 접근할 수 없는 지인은 게임에서 보고서를 다운로드해 개발자에게 전달할 수 있다. 자동 전송은 없다.

## 기존 기록 이전

Pages와 Vercel은 서로 다른 origin이므로 localStorage와 홈 화면 앱은 자동 이동하지 않는다.

1. 기존 Pages에서 설정 → 데이터 관리 → JSON 내보내기. 이 파일을 보관한다.
2. Vercel에 기존 기록이 있으면 그쪽에서도 먼저 별도로 내보낸다.
3. Vercel에서 데이터 관리 → JSON 불러오기 → 8명 슬롯·도감·설정 미리보기를 확인한다.
4. 사용자가 확인해야 대상 주소의 기록이 교체된다. 취소하면 그대로다. 원래 Pages 기록은 삭제하거나 변경하지 않는다.
5. 새 주소에서 이어하기를 확인한 뒤 필요하면 Vercel 주소를 홈 화면에 새로 추가한다. 기존 Pages 앱은 별도 설치로 남는다.

저장 schema는 3이며 이전 appVersion의 호환 JSON도 지원한다. JSON은 개인 백업 파일이므로 공개 이슈에 첨부할 필요가 없다. v0.15부터 같은 계정의 클라우드 저장을 통해서도 두 주소 사이 기록을 옮길 수 있다. 첫 연결마다 명시적으로 저장 방향을 선택하며, 양쪽 로컬 기록은 자동 합쳐지지 않는다. [계정 설정과 운영](CLOUD_SAVE.md)을 참고한다.

## 공개 범위와 검증

noindex, robots.txt, X-Robots-Tag는 검색 노출을 줄이기 위한 지시이며 URL 접근을 막는 보안 기능이 아니다. 소스 비공개 여부와 관계없이 브라우저가 받은 게임 코드·에셋은 사용자에게 전달된다. 가짜 비밀번호 화면은 만들지 않는다.

실제 배포 주소, Git 연결과 브라우저 검증 결과는 [v0.14 검증 기록](docs/v0.14-validation.md)에 기록한다. 설치·오프라인 제약은 [PWA.md](PWA.md)를 참고한다.

## v0.15 공개 환경변수

Vercel Production 환경변수와 GitHub Actions repository variables에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`를 등록했다. Pages 빌드 job이 이를 읽는다. 값 변경 후에는 재배포해야 한다. 두 값이 없으면 계정 기능만 준비 중으로 표시하고 로컬 게임은 실행한다. 실제 배포 검증은 [v0.15](docs/v0.15-validation.md)에 기록한다.
