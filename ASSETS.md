# 임시 에셋 교체 안내

모든 아트는 직접 작성한 SVG입니다. 원작 영상·게임에서 추출하거나 외부에서 다운로드한 에셋은 없습니다. 별도 폰트도 요청하지 않고 운영체제의 한국어 폰트를 사용합니다.

제작 출처와 원본 제작 요청은 [assets/ATTRIBUTION.md](assets/ATTRIBUTION.md)에 기록합니다. 이후 에셋을 교체할 때도 같은 문서를 갱신하세요. 공식 이미지의 구도·자세·선화·세부 표현을 그대로 복제한 생성물은 사용하지 않습니다.

| 파일 (`public/art/` 아래) | 대상 |
| --- | --- |
| `agumon.svg` | 아구몬 |
| `greymon.svg` | 그레이몬 |
| `metal.svg` | 메탈그레이몬 |
| `skull.svg` | 스컬그레이몬 |
| `kuwaga.svg` | 쿠가몬 |
| `elec.svg` | 에렉몬 |
| `meramon.svg` | 메라몬 |
| `nume.svg` | 워매몬 |
| `andromon.svg` | 안드로몬 |
| `ogre.svg` | 우가몬 |
| `devimon.svg` | 데블몬 |
| `file-island.svg` | 타이틀과 이야기의 파일섬 배경 |

캐릭터 원본은 24×24 격자의 픽셀풍이며 정사각형 캔버스·투명 배경을 사용합니다. 같은 파일명으로 SVG를 교체하면 즉시 반영됩니다. PNG/WebP를 사용할 경우 `src/art.ts`의 확장자/경로를 변경하세요. 배경은 1100×650 비율입니다. 경로는 Vite의 BASE_URL을 따릅니다.

생성 원본은 `scripts/art-source.ts`, 재생성은 `npm run art`입니다. **직접 교체한 SVG는 재생성 명령으로 덮어쓰게 되므로**, 생성 원본을 수정하거나 교체 파일을 따로 보관하세요. 생성물은 저장소에 포함되며 실행/빌드에 재생성 명령이 필수는 아닙니다.

공격·방어·지원 카드의 임시 아이콘은 `src/main.ts`의 `icon()`과 `src/style.css`의 `.card-art`입니다. 피격/진화 연출은 같은 CSS의 `hit`, `lunge`, `evolve-in` 키프레임입니다. 효과음은 `src/audio.ts`에서 실시간 합성하므로 음원 파일이 없습니다.
