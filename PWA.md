# 모바일 앱 설치와 오프라인

v0.9.0. 기존 Vite + TypeScript 구조에 작은 service worker를 직접 구현했다. 새 런타임 의존성·계정·분석·추적·푸시·백그라운드 동기화는 없다.

## 설치와 실행

- Android/Chromium: 설치 조건을 브라우저가 만족했다고 알릴 때 설정에 **앱으로 설치**가 나타난다. 브라우저 메뉴의 설치/홈 화면 추가도 사용할 수 있다. 설치하지 않아도 동일한 게임이다.
- iOS Safari: 공유 → 홈 화면에 추가. 이미 standalone으로 실행 중이면 안내를 숨긴다. 설치 성공은 prompt 수락만으로 판정하지 않는다.
- 앱과 같은 origin의 브라우저는 기록을 공유할 수 있지만 플랫폼·프로필에 따라 저장 공간이 분리될 수 있다. 앱 제거/사이트 데이터 삭제로 기록을 잃을 수 있으므로 설정 → 데이터 관리에서 JSON을 내보내 둔다.
- 공개 URL이며 noindex/robots.txt는 접근 통제가 아니다.

## 빌드와 캐시

`npm run build`는 Vite 빌드 뒤 `scripts/build-pwa.mjs`로 `sw.js`와 검사 메타데이터 `pwa-build.json`을 만든다. 프로덕션에서만 등록한다. manifest의 id/start_url/scope는 `./`이며 `/file-island-echoes/` 기준으로 해석된다. worker URL은 같은 경로의 `sw.js`, scope는 `/file-island-echoes/`다.

- shell: HTML, 해시 JS/CSS, manifest, 로컬 폰트, UI SVG와 앱 PNG. 사용자 추가 요청에 따라 터치 7종의 OGG/MP3 14개도 포함한다. 약 2.50MiB, 64파일. install이 모두 성공해야 활성화된다.
- 터치 효과음: 확인/선택/취소/거부/카드 선택/노드 선택/에너지 부족. 두 코덱 합계 63,235B. 첫 입력 전에는 지원 코덱의 압축 데이터만 미리 받고, AudioContext 생성·디코딩·재생은 기존 사용자 입력/음소거 정책을 따른다. 음악은 미리 받지 않는다.
- runtime: 방문하며 실제 요청한 그림·음악만 cache-first. URL별 콘텐츠 해시를 키에 넣어 수정된 파일은 새로 받고, 변경되지 않은 파일은 업데이트 이후에도 재사용한다. 최대 180응답; 저장 공간 부족은 게임 실행을 막지 않는다.
- shell 캐시 이름은 앱 이름 + 제품 버전 + 내용 해시. runtime은 앱 전용 v1 캐시이며 파일별 내용 해시로 구분한다. activate는 다른 앱의 캐시를 건드리지 않고 오래된 자체 shell만 제거한다.
- navigation은 해당 worker가 설치한 index.html을 반환한다. 온라인에서도 같은 빌드의 HTML과 JS를 짝지어 구버전 HTML/새 청크 혼합을 피한다. base 밖 요청, 외부 origin, GET 이외, Range 요청은 가로채지 않는다. 실패/opaque 응답은 저장하지 않는다.
- 미캐시 이미지의 오프라인 실패는 기존 이미지 fallback으로, 음악 실패는 무음으로 처리한다. 최초 방문 자체가 오프라인이면 아직 앱을 저장하지 못했으므로 실행할 수 없다. 브라우저는 저장 공간 압박으로 캐시를 제거할 수 있다.

## 업데이트와 복구

새 worker는 기다린다. 설정 → 업데이트 확인 → 저장하고 업데이트 적용을 직접 누를 때만 활성화를 요청하고 해당 탭을 한 번 reload한다. 전투·진화 연출 중에는 적용하지 않는다. 안전한 보상/지도/이벤트 등에서 저장 성공과 실제 서버 연결을 확인한다. 다른 탭을 강제로 새로고침하지 않는다.

설정의 **그림·소리 캐시 복구**는 앱 전용 runtime HTTP 캐시만 비운다. 앱 본체와 localStorage, JSON, 다른 앱 캐시는 남긴다. 다음 화면에서 필요한 파일을 다시 받는다. 초기 JS 로딩 실패에는 기록을 삭제하지 않는 재시도 화면이 있다. 무조건적인 전체 캐시/저장 초기화는 없다.

## 개발 및 검증

- `npm ci`, `npm run dev`: service worker 등록 없음. PWA를 개발 포트에 수동 등록하지 않는다.
- `npm run build`, `npm run preview`: 실제 PWA 검증. 별도 포트를 권한다. 오래된 worker를 정리하려면 DevTools Application → Service Workers에서 **이 프로젝트 scope만** unregister하고 앱 전용 HTTP 캐시만 삭제한다. Local Storage/Clear site data는 기록도 지우므로 사용하지 않는다.
- `npm test`, `npm run check:pages`, `node scripts/check-http.mjs <base-URL>`.
- `node scripts/serve-pwa-qa.mjs`: 별도 3012 포트로 dist와 `/qa.html` 진단 페이지 제공. 브라우저에서 같은 origin의 실제 게임을 조작하고 캐시·worker scope를 읽는다. 서버를 중단한 뒤 게임을 reload하면 origin 전체 연결 실패를 재현한다. 이 도구와 `qa/`는 배포하지 않는다.
- `qa/touch-preload.html`은 dev 서버에서 실행하는 200ms fetch 지연 비교다. 첫 준비 전/후 각각 새 AudioManager로 측정한다. source.start 예약 시간이며 하드웨어 청감 수치가 아니다.

모바일 레이아웃은 Chromium CSS viewport로 확인했다. 실제 Android 설치 UI, iOS 홈 화면 앱, 노치 safe area, OS 전환/재개와 스피커 출력 지연은 실기기 미검증이다. in-app browser에서는 beforeinstallprompt가 제공되지 않아 설치 버튼을 숨긴 상태를 확인했다.

참고: [Service worker lifecycle](https://web.dev/articles/service-worker-lifecycle), [beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event), [Service worker caching](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching).
