# Local audio diagnostics

These pages run through `npm run dev`; Vite does not include them in `dist`.

- `/file-island-echoes/?audioDebug&audioDelay=200`: play the actual game with a local timing panel and a controlled 200 ms delay before each audio fetch. Omit `audioDelay` for normal networking. The panel keeps the last 160 events in memory; it does not transmit or save them. `inputMs` is relative to the most recent input, so allow a cold sound to finish before pressing another control. Fetch/decode entries distinguish cold requests from cache hits. This is a controlled delay, not a simulation of a particular cellular network.
- `/file-island-echoes/qa/audio-latency.html`: isolated mixer, cold/warm input, resume and explicit interactive latency-hint comparison. Every fetch has a controlled 200 ms delay. The comparison context is immediately closed.
- `/file-island-echoes/qa/audio-pointer.html`: press Run for six actual DOM PointerEvent regression checks, including cancellation, drag and disabled controls.

To compare v0.5, place the original `src/audio.ts` from commit `9807f53` at `test-results/audio-baseline.ts`, copy `src/audio-manifest.json` beside it, and add `?baseline` to the latency page. Those baseline files remain ignored. The baseline module's type-only import is stripped by Vite.

App scheduling timestamps do not measure physical speaker/headphone onset. Real iOS Safari/Android Chrome listening is still needed to verify device output latency.

## Disposable save QA

Run `node scripts/create-save-qa.mjs` to create synthetic JSON files under ignored `test-results/save-fixtures/`. Use a fresh localhost port with no real saves, then test the actual Settings → Data management file picker. `/file-island-echoes/qa/save-storage.html` provides explicit buttons to prepare an unrelated key and an empty legacy key and inspect their state. Never run this helper on an origin containing user records. Export, reset, and import the actual downloaded synthetic file; the unrelated key must remain. These helpers are not production build entries.

## Combat UI checks

`node scripts/create-visual-qa.mjs` creates the ignored local fixture page. Use a disposable port (e.g. 3008) and its `test-results/visual.html`. The visible controls choose partner, scene and enemy pattern. Run combat checks, Check enemy motions, Check evolution and results, Check card faces, and Check log scroll perform actual DOM actions and report in the page. No production hook is installed. `node scripts/verify-combat-baseline.mjs` compares against pre-v0.8 engine commit 340c57c using generated ignored files.


v0.8.1: `Check v0.8.1 layout` 버튼은 공통 팝업의 44px 닫기/스크롤/포커스, 전투 헤더, 단일 체력, 대상 전환 시 상대 좌표와 카드 대상, 이름과 효과 위치를 검사합니다. 로컬 합성 fixture에서만 실행하며 초기화를 확정하지 않습니다. 200% text와 뷰포트 변경 뒤 반복할 수 있습니다.


v0.8.2: `Check v0.8.2 layout`은 보상 카드 1/2/3장·긴 설명의 nowrap/폭/높이/포커스/휠과 덱 선택·건너뛰기를 검사합니다. 8명 HUD 및 고유 중첩 0→최대값, 사용/봉인 상태, 대상광 레이어, 상단 48/60px 높이와 소리 토글 10회의 메뉴 위치도 확인합니다. 200% text 버튼 및 viewport 변경 뒤 반복할 수 있습니다. `reward-long`, `hud-zero/rich/used/sealed`는 합성 fixture이며 배포에 포함하지 않습니다.

PWA: `npm run build` 후 `node scripts/serve-pwa-qa.mjs`로 별도 origin 3012를 사용한다. `/qa.html`은 캐시/등록 읽기, 320px·200% iframe 및 미방문 이미지 실패/복구 검사용이다. 서버 종료 중 게임 URL reload로 origin 오프라인을 재현한다. 사용자 기록이 있는 origin에서는 사용하지 않는다. `touch-preload.html`은 dev 서버에서 최초 압축 데이터 준비 전후의 AudioContext source.start 시점을 비교하며 측정용 200ms fetch 지연을 사용한다.
