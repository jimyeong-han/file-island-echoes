# 계정과 클라우드 저장 · v0.15

설정 → **계정 · 클라우드 저장**에서 아이디를 만들거나 로그인한다. 사용자 요청에 따라 이메일 확인 없이 아이디와 비밀번호로 가입한다. 로그인 없이 로컬 플레이와 JSON 백업도 계속 사용할 수 있다. 계정 기능은 공개 게임 URL을 잠그는 접근 통제가 아니다.

## 사용자 흐름

- 아이디: 영문·숫자로 시작하는 영문·숫자·밑줄 3~24자. 대소문자는 구분하지 않는다. 비밀번호는 8~72자, UTF-8 72바이트 이내다.
- Supabase Auth의 비밀번호 인증을 사용한다. 내부 식별자는 `아이디@accounts.file-island-echoes.invalid`이다. 실제 이메일 주소가 아니며 인증·복구 메일을 보내지 않는다. 비밀번호 원문을 게임 저장, 로그, JSON 백업에 넣지 않는다.
- 첫 연결 및 페이지 새로고침 후에는 기기와 클라우드를 비교하고 **올리기 / 불러오기**를 선택한다. 로그인만으로 기록을 덮어쓰지 않는다. 방향을 선택하면 그 페이지에서 이후 성공한 로컬 저장을 클라우드에도 반영한다.
- 대상은 항상 **8명 슬롯 + 활성 캐릭터 + 도감·클리어·해금·엔딩 + 설정** 전체다. 캐릭터별 합치기 기능은 없다. 교체 확인 전에 JSON 백업 버튼을 제공한다.
- 오프라인에서는 로컬에 저장한다. 연결 복귀 이벤트, 열린 페이지의 30초 재시도 또는 수동 재시도로 전송한다. 페이지를 닫으면 전송은 중단되며 다음 접속 때 다시 비교한다. 서비스 워커가 저장을 보내지 않는다.
- 다른 기기의 저장이 먼저 반영되면 충돌을 표시한다. 서버 revision으로 판정하며 시계나 저장 시각만으로 최신본을 정하지 않는다. 양쪽 8명 진행을 확인한 뒤 다시 선택한다.
- JSON 가져오기·기기 초기화·다른 탭 변경은 자동 동기화를 멈춘다. 이후 계정 화면에서 다시 선택해야 한다.

| 작업 | 기기의 게임 기록 | 클라우드 기록 | 계정 |
| --- | --- | --- | --- |
| 로그아웃 | 유지 | 유지 | 이 브라우저 세션 해제 |
| 데이터 관리에서 기기 초기화 | 삭제 | 유지 | 로그인 유지, 자동 동기화 중단 |
| 계정 화면에서 클라우드 기록 삭제 | 유지 | payload 삭제 | 로그인 유지, 자동 동기화 중단 |
| 운영자에게 계정 삭제 요청 | 별도로 직접 지워야 함 | Auth 사용자 삭제 시 함께 삭제 | 삭제 |

클라우드 삭제에는 별도 확인이 필요하다. 오래된 기기가 기록을 되살리지 못하도록 사용자 ID·revision·최종 요청 ID·갱신 시각은 삭제 표식으로 남는다. 계정 자체를 삭제하면 이 행도 제거된다. 공유 기기는 로그아웃만으로 게임 기록이 지워지지 않는다.

## 운영 프로젝트 준비

1. Supabase 프로젝트를 만들고 SQL Editor에서 `supabase/migrations/202611060001_cloud_profiles.sql`을 실행한다. 새 테이블과 함수용 최초 migration이다. 기존 테이블에 반복 적용하지 않는다. SQL Editor로 적용한 프로젝트에서 나중에 CLI migration을 사용한다면 먼저 CLI에 로그인·link한 뒤 `supabase migration repair 202611060001 --status applied`로 이력을 맞춘다. DB 비밀번호나 관리 토큰은 소스·채팅에 넣지 않는다.
2. Authentication → Sign In / Providers: **Allow new users to sign up 켜짐**, **Email enabled**, **Confirm email 꺼짐**. Email의 Minimum password length는 **8**이다. Anonymous sign-ins는 사용하지 않는다. 이 설정이 켜져 있으면 URL을 아는 사람 외에도 가입 API에 접근한 사람이 가입할 수 있다. 지인 가입을 마친 후 Allow new users to sign up을 끄면 기존 사용자의 로그인은 유지된다. 클라이언트 버튼 숨기기는 가입 제한이 아니다.
3. 이메일·OAuth redirect 로그인은 쓰지 않는다. `detectSessionInUrl:false`이며 이번 인증 흐름에 callback URL이나 SMTP 설정은 필요 없다. 나중에 이메일 복구나 소셜 로그인을 도입하면 실제 소유 이메일과 Site URL/Redirect allowlist, 메일 발송 설정을 별도로 설계해야 한다.
4. 로컬 `.env.local`, Vercel Production 환경변수, GitHub Actions repository variables에 아래 **공개값**을 설정하고 재빌드한다. `.env.example`을 참고한다. 비밀 service-role/secret 키를 `VITE_` 변수에 넣지 않는다.

```text
VITE_SUPABASE_URL=https://PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

2026-11-06 운영 프로젝트 `wuiwxrucddgbhjdebygs`에 SQL을 적용했다. 대시보드에서 RLS/강제 RLS, 읽기 권한, 직접 쓰기 차단, authenticated RPC만 허용됨을 조회했다. 사용자 확인 후 Confirm email을 껐으며 공개 Auth 설정 API에서도 signup 허용·email 활성·autoconfirm을 확인했다. Vercel Production과 Pages Actions 변수에 공개 URL/키를 등록했다. Preview에는 필요할 때 별도의 테스트 프로젝트를 연결한다.

## 저장 권한과 충돌 규칙

`fie_profiles`의 기본키는 `auth.users.id`이며 Auth 사용자를 삭제하면 CASCADE로 정리된다. SELECT는 RLS의 `auth.uid() = user_id` 조건을 통과해야 한다. anon은 행을 읽을 수 없고, 클라이언트의 직접 INSERT/UPDATE/DELETE 권한은 없다.

쓰기 RPC `fie_write_profile`은 로그인 UUID를 함수 내부에서 얻는다. 사용자 ID를 인자로 받지 않는다. SECURITY DEFINER 함수는 빈 search_path, 완전 수식 테이블명, 명시적인 auth 검사와 권한 제한을 사용한다. 사용자별 advisory transaction lock 안에서 expected revision과 현재 revision을 비교하고 일치할 때만 교체한다. 충돌 시 현재 본인 행을 반환하며 쓰지 않는다. 요청 UUID와 기대 revision·내용이 같은 재시도는 같은 결과를 돌려준다. UUID를 다른 내용에 재사용하면 거부한다.

브라우저는 한 번에 하나의 저장만 전송한다. 응답 유실 때 같은 요청 ID/스냅샷을 유지하고, 그 사이 생긴 변경은 첫 저장 확인 후 후속 요청으로 보낸다. 로그아웃·계정 전환·JSON 교체는 이전 비동기 응답을 무효화한다. 요청 직전 계정 ID를 검사하고 해당 계정의 bearer를 고정해 다른 계정 토큰으로 이전 payload를 보내지 않는다.

저장 schema는 계속 **3**, JSON formatVersion은 **2**다. 기존 v1/v2/v3 가져오기를 유지한다. 클라우드 수신은 기존 JSON 검증기를 거치며 형식 오류나 손상 슬롯 경고가 있으면 자동 복원하지 않는다. DB에도 8MiB 크기와 기본 구조 제약이 있다. 게임 화면에 나타나는 기록은 HTML escape한다.

Auth 세션은 Supabase SDK가 별도 localStorage 키에 관리한다. 이는 브라우저 사용자의 로그인 유지를 위한 토큰이며 게임 JSON에 포함되지 않는다. Auth/REST 요청은 `no-store`, 외부 도메인이다. PWA는 Authorization 요청과 외부 요청·POST·no-store를 캐시하지 않는다. 개인 저장 payload와 인증 토큰은 Cache Storage에 넣지 않는다. 광고·분석 SDK는 추가하지 않았다. Supabase는 인증 및 운영 로그를 처리하므로 익명 서비스라고 설명하지 않는다.

## 비밀번호 복구와 계정 삭제

이 버전에는 이메일 복구와 셀프 계정 삭제가 없다. 비밀번호를 잊었으면 지인이 기존 연락 채널로 운영자에게 요청한다. 아이디만 안다는 이유로 복구해 주지 말고 실제 사용자를 확인한다. Supabase Auth 관리자 API `updateUserById`를 신뢰할 수 있는 운영 환경에서 사용하거나 새 계정을 만들고 사용자가 가진 JSON을 복원한다. 관리 비밀키와 새 비밀번호를 게임 번들이나 공개 이슈에 넣지 않는다. 현재 비밀번호의 조회·복호화 기능은 없다.

계정 삭제 요청은 본인 확인 후 Authentication → Users에서 해당 내부 식별자/UUID를 다시 확인하고 삭제한다. `fie_profiles`는 외래키 cascade로 제거된다. 이미 다른 기기에 남은 로컬 기록·JSON은 원격으로 지울 수 없으므로 사용자에게 직접 삭제하도록 안내한다. 이 절차는 일반 운영 안내이며 테스트 과정에서 실제 사용자 계정을 삭제하지 않았다.

## 로컬 재현 검사

Node 24와 Docker가 필요하다. 공개 운영 프로젝트와 분리된 `file-island-echoes-qa`, API `127.0.0.1:55431`만 테스트한다.

```sh
npm ci
npx supabase start -x realtime,storage-api,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
npm run test:cloud
npm run dev:cloud -- 3040
# 별도 터미널에서 두 번째 기기 origin
npm run dev:cloud -- 3041
```

`/qa/cloud.html`에는 이 두 origin에서만 실행되는 합성 8슬롯 생성/백업 진단이 있다. 운영 빌드에 포함되지 않는다. 테스트 러너는 실제 Auth 가입, anon/다른 사용자 RLS, 직접 쓰기 차단, 8슬롯 왕복, 동시 CAS, 재시도, 잘못된 입력, 만료·잘못된 bearer, 삭제 표식을 검사한다. 생성한 테스트 사용자 UUID만 finally에서 정리하며 운영 URL에서는 시작하지 않는다. 로컬 CLI 출력의 관리 키도 커밋하지 않는다.

배포 모드의 로컬 연결 검사: `node scripts/build-cloud-qa.mjs` → `node scripts/serve-pwa-qa.mjs 3040 test-results/v015-cloud-root`. 이 테스트 산출물은 로컬 공개 키를 사용한다. 실제 배포 전에는 평소 `npm run build:vercel` / `npm run build`로 다시 빌드한다. 종료는 실행 서버 Ctrl+C 후 `npx supabase stop`이며 로컬 DB 볼륨은 유지된다.

## 요금과 공식 근거

2026-11-06 공식 요금표 기준 Free는 DB 500MB, 월 활성 사용자 50,000명, egress 5GB와 cached egress 5GB, Storage 1GB, 활성 프로젝트 2개 한도다. 비활성 프로젝트는 1주 후 중지될 수 있어 오랜만에 접속하면 운영자가 대시보드에서 재개해야 할 수 있다. Pro는 월 $25부터이며 이 작업에서 유료 요금제를 켜지 않았다. 작은 지인 테스트라도 공개 가입과 사용량을 운영자가 확인한다. [Supabase 요금](https://supabase.com/pricing)

- [비밀번호 Auth와 이메일 확인 설정](https://supabase.com/docs/guides/auth/passwords)
- [Auth signUp](https://supabase.com/docs/reference/javascript/auth-signup)
- [RLS 사용자별 권한](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [DB 함수의 security/search_path와 실행 권한](https://supabase.com/docs/guides/database/functions)
- [관리자 비밀번호 변경](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid)

실제 검증 범위와 남은 한계는 [v0.15 검증 기록](docs/v0.15-validation.md)에 기록한다.
