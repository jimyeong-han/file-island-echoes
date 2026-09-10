# v0.6 — 디지몬: 우리들의 모험

게임 표시명은 「디지몬: 우리들의 모험」이다. `file-island-echoes`는 기존 저장소·패키지·Pages 경로의 식별자로 유지한다. 저장 키나 탐험 규칙은 바꾸지 않았다.

## 선택한 서체

`qa/typography.html`에서 Galmuri 제목 + Pretendard 본문, Pretendard 단독 조합을 실제 Chromium으로 비교했다. 갈무리는 짧은 제목에 데이터 화면의 각진 인상을 주고, 긴 설명은 Pretendard가 더 빠르게 읽혀 역할을 나누었다. 공식 로고나 디지몬 게임 전용 서체를 사용하지 않았다.

| 역할 | 파일 | 용량 | 범위 |
| --- | --- | ---: | --- |
| Display · 제목, 챕터, 진화명, 주요 버튼 | `public/assets/fonts/galmuri11-bold.woff2` | 166,352 B | 현대 한글 11,172자, 전체 cmap 12,695자, Bold |
| Body · 카드, 대사, 설정, 도감 | `public/assets/fonts/pretendard-variable.woff2` | 2,057,688 B | 현대 한글 11,172자, 전체 cmap 14,336자, 가변 굵기 |
| Numeric · HP, 비용, 피해량 | Body 재사용 | 추가 0 B | tabular-nums/lining-nums |

두 파일 합계 2,224,040 B(2.12 MiB). 폰트는 프로젝트에서 서브셋하거나 변형하지 않았고, 긴 도감 문장과 동적 이름을 위해 전체 현대 한글을 유지했다. fontTools로 실제 cmap을 확인한 결과는 `docs/font-measurements.json`에 있다. `font-display:swap`과 시스템 한글 fallback을 사용하며 외부 CDN 요청은 없다.

## 출처와 라이선스

- [Galmuri 공식 저장소](https://github.com/quiple/galmuri), 커밋 `71e1cacf1437a11220307120e63e30bc275312d4`, `dist/Galmuri11-Bold.woff2`. 저작자 Lee Minseo. [공식 라이선스](https://github.com/quiple/galmuri/blob/71e1cacf1437a11220307120e63e30bc275312d4/dist/LICENSE.txt) 원문을 `public/assets/fonts/galmuri-LICENSE.txt`에 포함했다.
- [Pretendard 공식 저장소](https://github.com/orioncactus/pretendard), 커밋 `7aeb0698819be2b4097dae8ec8fe6a795e5cf3ae`, `packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`. 저작자 Kil Hyung-jin 및 원문 명시 기여자. [공식 라이선스](https://github.com/orioncactus/pretendard/blob/7aeb0698819be2b4097dae8ec8fe6a795e5cf3ae/LICENSE) 원문을 `public/assets/fonts/pretendard-LICENSE.txt`에 포함했다.

두 서체에만 SIL OFL 1.1이 적용된다. 게임 코드·캐릭터·일러스트 전체에 대한 라이선스를 부여하는 문서가 아니다. 공식 배포처의 파일과 재배포 조건은 2026-09-10에 확인했다.

## 화면 적용과 교체

`src/typography.css`의 `--font-display`, `--font-body`, `--font-numeric`에서 역할을 중앙 관리한다. WOFF2 교체 시 같은 파일의 출처/라이선스를 함께 갱신하고 `@font-face`와 글리프·용량 측정도 수정한다. Vite가 CSS의 공용 에셋 경로에 `/file-island-echoes/` base를 적용한다.

기존 CSS의 글자 크기를 rem으로 전환하고 작은 안내도 최소 12px 기준으로 조정했다. 카드 설명은 14px/1.65, 이름은 16px/1.45다. 한글 keep-all + 필요한 경우 overflow-wrap, 짧은 제목의 자간, 숫자 정렬과 버튼 줄바꿈을 정리했다. 200% 글자 확대 시 상태창은 여러 줄로 늘어나며, 손패는 기존의 가로 스크롤 방식이다. 상단 소리 버튼은 본문 서체와 직접 그린 스피커 SVG를 사용해 상태를 `음소거 / 소리 켜짐`으로 표시한다.

신나리 초상화는 작은 어깨, 큰 머리 비율, 부드러운 얼굴로 다시 생성하고 사용자가 제공한 의상 모티프(연노란 상의, 분홍 스카프·반바지, 호루라기)를 적용했다. 기존 자세를 축소하는 방식 대신 얼굴·체구를 다시 그렸다. 사용자 참고 이미지 자체는 저장소나 배포 에셋에 포함하지 않았다. 최종 `kari-gatomon-adventure.webp`는 640×640, 74,312 B이며 원본 프롬프트는 `assets/prompts/v0.6/`에 있다.

## 화면 검증 도구

`node scripts/create-visual-qa.mjs` 실행 후 개발 서버의 `/file-island-echoes/test-results/visual.html`을 연다. 실제 화면 코드를 복사한 합성 상태로 각 화면, 200% 글자, 의도적인 폰트 404 fallback을 확인한다. 생성 파일은 Git에서 제외되고 `dist`에도 포함되지 않는다. 사용자의 실제 저장을 검사 fixture로 커밋하지 않는다. 실제 새 게임·버튼 조작은 별도의 프로덕션 미리보기에서 검증한다.
