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
