# 에셋 제작 출처

Unofficial, non-commercial fan project.
This project is not affiliated with or endorsed by Bandai,
Toei Animation, or any related rights holder.
Third-party names and characters belong to their respective rights holders.

이 문서는 제작 출처 기록이며 코드·에셋 전체에 적용되는 오픈소스 라이선스나 제3자 권리에 대한 허가를 부여하지 않습니다.

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

별도의 이미지 생성 도구는 사용하지 않았습니다. 따라서 이미지 모델 전용 프롬프트나 참조 이미지가 없습니다. 언어 모델의 코드 작성은 아래 사용자 원본 요청의 관련 부분을 바탕으로 진행했습니다.

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
