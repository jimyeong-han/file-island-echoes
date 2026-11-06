# 전투 이펙트 ID 매핑 · v0.12

`node scripts/document-effects.mjs`로 실제 데이터에서 생성한다. 판정 횟수와 시각 발사체 수는 다르다. 엔진은 카드/적 행동당 총 피해를 한 번 계산하며 연출은 이를 늘리지 않는다. 시전은 입 앞의 점화·전기 갈래·뿌리와 잎·물 소용돌이·발톱 준비 동작·광궁·발사구·결정 파편·축복의 빛·어둠 연무·바람 압력 등 13종으로 구분한다. 얼굴·앞발·머리·하단 등 각 기술의 출발 위치도 다르게 측정한다. 이동은 색 그라데이션과 궤적을 겹친 아래 모티프, 적중은 같은 모티프의 파편과 실제 피해 총합, 피격은 짧은 변위다. 완전 방어는 방패·방어 표시, 무피해는 무효 표시이며 몸을 흔들지 않는다.

## 공격 카드

| ID / 기술 | 주체 | 대상 | 모티프 / 색 / 변형 | 시각 발사체 | 이동 / 적중 ms | 효과음 |
| --- | --- | --- | --- | --- | --- | --- |
| claw / 틈새 공격 | 현재 파트너 | 선택한 살아 있는 적 | claw / #a2c8d6 / 0 | 2 | 220 / 260 | hit-normal → enemy-hit 또는 card-guard |
| flame / 베이비 플레임 | 아구몬 | 선택한 살아 있는 적 | flame / #ff934a / 0 | 1 | 220 / 225 | attack-fire → enemy-hit 또는 card-guard |
| courage / 용기의 일격 | 아구몬 | 선택한 살아 있는 적 | fist / #ffe083 / 1 | 1 | 235 / 225 | hit-heavy → enemy-hit 또는 card-guard |
| rush / 선두 돌파 | 아구몬 | 선택한 살아 있는 적 | fist / #ff934a / 2 | 1 | 250 / 225 | hit-heavy → enemy-hit 또는 card-guard |
| ember / 불씨를 이어서 | 아구몬 | 선택한 살아 있는 적 | flame / #ff934a / 3 | 3 | 265 / 295 | attack-fire → enemy-hit 또는 card-guard |
| nova / 메가 플레임 | 아구몬 | 선택한 살아 있는 적 | flame / #ff934a / 4 | 1 | 280 / 225 | attack-fire → enemy-hit 또는 card-guard |
| missile / 기가 디스트로이어 | 아구몬 | 살아 있는 모든 적 | missile / #a2c8d6 / 5 | 3 | 295 / 295 | attack-fire → enemy-hit 또는 card-guard |
| zero / 그라운드 제로 | 아구몬 | 살아 있는 모든 적 | missile / #bd86ef / 6 | 1 | 310 / 225 | attack-dark → enemy-hit 또는 card-guard |
| blue / 파란 불꽃 | 파피몬 | 선택한 살아 있는 적 | flame / #65b9ff / 1 | 1 | 235 / 225 | attack-fire → enemy-hit 또는 card-guard |
| link / 이어지는 발톱 | 파피몬 | 선택한 살아 있는 적 | claw / #65b9ff / 2 | 2 | 250 / 260 | hit-normal → enemy-hit 또는 card-guard |
| blue-plus / 폭스 파이어 | 파피몬 | 선택한 살아 있는 적 | flame / #65b9ff / 4 | 2 | 280 / 260 | attack-fire → enemy-hit 또는 card-guard |
| wolf-claw / 우정의 연격 | 파피몬 | 선택한 살아 있는 적 | claw / #a2c8d6 / 5 | 3 | 295 / 295 | hit-normal → enemy-hit 또는 card-guard |
| feather / 매지컬 파이어 | 피요몬 | 선택한 살아 있는 적 | flame / #ee91bb / 1 | 2 | 235 / 260 | attack-fire → enemy-hit 또는 card-guard |
| wind / 날개 뒤의 바람 | 피요몬 | 선택한 살아 있는 적 | wind / #75e5e4 / 2 | 1 | 250 / 225 | card-attack → enemy-hit 또는 card-guard |
| flare-wing / 다시 펼친 날개 | 피요몬 | 선택한 살아 있는 적 | wave / #ff934a / 3 | 2 | 265 / 260 | attack-fire → enemy-hit 또는 card-guard |
| meteor-wing / 메테오 윙 | 피요몬 | 선택한 살아 있는 적 | shard / #ff934a / 4 | 3 | 280 / 295 | attack-fire → enemy-hit 또는 card-guard |
| shadow-wing / 그림자 날개 | 피요몬 | 살아 있는 모든 적 | wave / #ee91bb / 5 | 3 | 295 / 295 | attack-fire → enemy-hit 또는 card-guard |
| shock / 전기 충격 | 텐타몬 | 선택한 살아 있는 적 | bolt / #ffe083 / 0 | 1 | 220 / 225 | attack-electric → enemy-hit 또는 card-guard |
| chain / 회로의 사슬 | 텐타몬 | 살아 있는 모든 적 | bolt / #75e5e4 / 2 | 3 | 250 / 295 | attack-electric → enemy-hit 또는 card-guard |
| probe / 빈틈 검증 | 텐타몬 | 선택한 살아 있는 적 | arrow / #ffe083 / 3 | 1 | 265 / 225 | attack-electric → enemy-hit 또는 card-guard |
| mega-blaster / 메가 블래스터 | 텐타몬 | 선택한 살아 있는 적 | bolt / #75e5e4 / 4 | 1 | 280 / 225 | attack-electric → enemy-hit 또는 card-guard |
| horn-buster / 혼 버스터 | 텐타몬 | 살아 있는 모든 적 | bolt / #ffe083 / 5 | 2 | 295 / 260 | attack-electric → enemy-hit 또는 card-guard |
| ivy / 포이즌 아이비 | 팔몬 | 선택한 살아 있는 적 | vine / #bd86ef / 0 | 2 | 220 / 260 | attack-plant → enemy-hit 또는 card-guard |
| bind / 덩굴의 약속 | 팔몬 | 선택한 살아 있는 적 | vine / #86d986 / 2 | 2 | 250 / 260 | attack-plant → enemy-hit 또는 card-guard |
| garden / 모두의 정원 | 팔몬 | 살아 있는 모든 적 | vine / #ee91bb / 3 | 3 | 265 / 295 | attack-plant → enemy-hit 또는 card-guard |
| needle / 따끔한 초록 주먹 | 팔몬 | 선택한 살아 있는 적 | shard / #86d986 / 4 | 3 | 280 / 295 | attack-plant → enemy-hit 또는 card-guard |
| flower-cannon / 플라워 캐논 | 팔몬 | 선택한 살아 있는 적 | wave / #ee91bb / 5 | 1 | 295 / 225 | attack-plant → enemy-hit 또는 card-guard |
| fish / 마칭 피시즈 | 쉬라몬 | 선택한 살아 있는 적 | water / #75e5e4 / 0 | 3 | 220 / 295 | attack-water → enemy-hit 또는 card-guard |
| harpoon / 막아 낸 힘으로 | 쉬라몬 | 선택한 살아 있는 적 | arrow / #65b9ff / 2 | 1 | 250 / 225 | hit-heavy → enemy-hit 또는 card-guard |
| harpoon-plus / 하푼 발칸 | 쉬라몬 | 선택한 살아 있는 적 | missile / #65b9ff / 4 | 3 | 280 / 295 | hit-heavy → enemy-hit 또는 card-guard |
| hammer / 해머 스파크 | 쉬라몬 | 선택한 살아 있는 적 | fist / #ffe083 / 5 | 1 | 295 / 225 | attack-electric → enemy-hit 또는 card-guard |
| bubble / 에어 샷 | 파닥몬 | 선택한 살아 있는 적 | wind / #75e5e4 / 0 | 1 | 220 / 225 | card-attack → enemy-hit 또는 card-guard |
| dawn / 새벽의 한 걸음 | 파닥몬 | 선택한 살아 있는 적 | arrow / #ffe083 / 2 | 1 | 250 / 225 | attack-light → enemy-hit 또는 card-guard |
| heavens-knuckle / 헤븐즈 너클 | 파닥몬 | 선택한 살아 있는 적 | fist / #ffe083 / 4 | 1 | 280 / 225 | attack-light → enemy-hit 또는 card-guard |
| holy-gate / 헤븐즈 게이트 | 파닥몬 | 선택한 살아 있는 적 | gate / #ffe083 / 5 | 1 | 295 / 225 | attack-light → enemy-hit 또는 card-guard |
| cat / 네코 펀치 | 가트몬 | 선택한 살아 있는 적 | claw / #ee91bb / 1 | 2 | 235 / 260 | hit-normal → enemy-hit 또는 card-guard |
| moon / 어둠 속의 길 | 가트몬 | 선택한 살아 있는 적 | claw / #bd86ef / 2 | 1 | 250 / 225 | attack-light → enemy-hit 또는 card-guard |
| cat-resonant / 공명하는 발톱 | 가트몬 | 선택한 살아 있는 적 | claw / #ffe083 / 4 | 3 | 280 / 295 | attack-light → enemy-hit 또는 card-guard |
| holy-arrow / 홀리 애로우 | 가트몬 | 살아 있는 모든 적 | arrow / #ffe083 / 5 | 2 | 295 / 260 | attack-light → enemy-hit 또는 card-guard |

## 적의 직접 공격·흡수

| ID (패턴 슬롯) / 행동 | 주체 | 대상 / 타격 예고 | 모티프 / 색 / 변형 | 시각 발사체 | 이동 / 적중 ms | 효과음 |
| --- | --- | --- | --- | --- | --- | --- |
| kuwaga:0 / 가위 연격 | 쿠가몬 | 파트너 / 2 | claw / #a2c8d6 / 0 | 2 | 220 / 260 | hit-normal → player-hit 또는 card-guard |
| kuwaga:2 / 급강하 | 쿠가몬 | 파트너 / 1 | fist / #ee91bb / 2 | 1 | 250 / 225 | hit-normal → player-hit 또는 card-guard |
| elec:0 / 전기 충격 | 에렉몬 | 파트너 / 1 | bolt / #ffe083 / 1 | 1 | 235 / 225 | attack-electric → player-hit 또는 card-guard |
| elec:2 / 방전 | 에렉몬 | 파트너 / 1 | bolt / #75e5e4 / 3 | 3 | 265 / 295 | attack-electric → player-hit 또는 card-guard |
| shellmon:1 / 물대포 | 쉘몬 | 파트너 / 1 | water / #65b9ff / 4 | 1 | 280 / 225 | attack-water → player-hit 또는 card-guard |
| shellmon:2 / 촉수 | 쉘몬 | 파트너 / 1 | vine / #ee91bb / 3 | 2 | 265 / 260 | attack-water → player-hit 또는 card-guard |
| seadramon:1 / 얼음 화살 | 시드라몬 | 파트너 / 1 | shard / #75e5e4 / 2 | 3 | 250 / 295 | attack-water → player-hit 또는 card-guard |
| seadramon:2 / 꼬리치기 | 시드라몬 | 파트너 / 1 | wave / #a2c8d6 / 3 | 1 | 265 / 225 | attack-water → player-hit 또는 card-guard |
| meramon:1 / 버닝 피스트 | 메라몬 | 파트너 / 1 | fist / #ff934a / 1 | 1 | 235 / 225 | attack-fire → player-hit 또는 card-guard |
| meramon:2 / 열기 | 메라몬 | 파트너 / 1 | wave / #ff934a / 2 | 2 | 250 / 260 | attack-fire → player-hit 또는 card-guard |
| nume:2 / 들이받기 | 워매몬 | 파트너 / 1 | fist / #86d986 / 3 | 1 | 265 / 225 | hit-normal → player-hit 또는 card-guard |
| monochromon:1 / 화산탄 | 모노크로몬 | 파트너 / 1 | missile / #ff934a / 2 | 2 | 250 / 260 | hit-normal → player-hit 또는 card-guard |
| unimon:1 / 홀리 샷 | 유니몬 | 파트너 / 1 | wave / #ffe083 / 2 | 1 | 250 / 225 | hit-normal → player-hit 또는 card-guard |
| unimon:2 / 돌진 | 유니몬 | 파트너 / 1 | fist / #a2c8d6 / 3 | 1 | 265 / 225 | hit-normal → player-hit 또는 card-guard |
| frigimon:0 / 얼음 펀치 | 프리지몬 | 파트너 / 1 | fist / #75e5e4 / 0 | 1 | 220 / 225 | attack-water → player-hit 또는 card-guard |
| frigimon:2 / 차가운 충격 | 프리지몬 | 파트너 / 1 | shard / #65b9ff / 2 | 3 | 250 / 295 | attack-water → player-hit 또는 card-guard |
| mojyamon:0 / 뼈 부메랑 | 모쟈몬 | 파트너 / 2 | claw / #a2c8d6 / 3 | 2 | 265 / 260 | hit-normal → player-hit 또는 card-guard |
| mojyamon:2 / 얼음 검 | 모쟈몬 | 파트너 / 1 | shard / #75e5e4 / 5 | 1 | 295 / 225 | hit-normal → player-hit 또는 card-guard |
| centarumon:1 / 태양 광선 | 켄터스몬 | 파트너 / 1 | arrow / #ff934a / 5 | 1 | 295 / 225 | attack-light → player-hit 또는 card-guard |
| bakemon:2 / 기습 | 바케몬 | 파트너 / 1 | dark / #a2c8d6 / 3 | 1 | 265 / 225 | attack-dark → player-hit 또는 card-guard |
| gazimon:1 / 날카로운 발톱 | 가지몬 | 파트너 / 2 | claw / #bd86ef / 3 | 2 | 265 / 260 | hit-normal → player-hit 또는 card-guard |
| gazimon:2 / 굴 파기 | 가지몬 | 파트너 / 1 | fist / #a2c8d6 / 4 | 1 | 280 / 225 | hit-normal → player-hit 또는 card-guard |
| cockatrimon:2 / 내려찍기 | 코카트리몬 | 파트너 / 1 | fist / #ee91bb / 5 | 1 | 295 / 225 | hit-normal → player-hit 또는 card-guard |
| raremon:2 / 점액 파동 | 레어몬 | 파트너 / 1 | wave / #86d986 / 4 | 2 | 280 / 260 | hit-normal → player-hit 또는 card-guard |
| dark-tyrannomon:1 / 불길 돌진 | 다크티라노몬 | 파트너 / 1 | flame / #ff934a / 5 | 1 | 295 / 225 | attack-fire → player-hit 또는 card-guard |
| demi-devimon:1 / 데미 다트 | 데미데블몬 | 파트너 / 1 | arrow / #bd86ef / 3 | 3 | 265 / 295 | attack-dark → player-hit 또는 card-guard |
| andromon:1 / 스파이럴 소드 | 안드로몬 | 파트너 / 1 | claw / #75e5e4 / 5 | 3 | 295 / 295 | attack-electric → player-hit 또는 card-guard |
| ogre:0 / 곤봉 | 우가몬 | 파트너 / 1 | fist / #a2c8d6 / 3 | 1 | 265 / 225 | hit-normal → player-hit 또는 card-guard |
| ogre:2 / 패왕권 | 우가몬 | 파트너 / 1 | fist / #86d986 / 5 | 1 | 295 / 225 | hit-normal → player-hit 또는 card-guard |
| leomon:0 / 수왕권 | 레오몬 | 파트너 / 1 | fist / #ffe083 / 2 | 1 | 250 / 225 | hit-normal → player-hit 또는 card-guard |
| leomon:3 / 검격 | 레오몬 | 파트너 / 1 | claw / #ffe083 / 5 | 2 | 295 / 260 | hit-normal → player-hit 또는 card-guard |
| phantomon:2 / 처형 예고 | 팬텀몬 | 파트너 / 1 | claw / #bd86ef / 6 | 1 | 310 / 225 | attack-dark → player-hit 또는 card-guard |
| devimon:0 / 데스 클로 | 데블몬 | 파트너 / 1 | claw / #bd86ef / 6 | 3 | 310 / 295 | attack-dark → player-hit 또는 card-guard |
| devimon:2 / 어둠의 흡수 | 데블몬 | 파트너 / 1 | dark / #ee91bb / 4 | 2 | 280 / 260 | attack-dark → player-hit 또는 card-guard |
| devimon:3 / 어둠의 파동 | 데블몬 | 파트너 / 1 | wave / #bd86ef / 6 | 3 | 310 / 295 | attack-dark → player-hit 또는 card-guard |
| etemon:1 / 다크 네트워크 | 에테몬 | 파트너 / 1 | bolt / #bd86ef / 6 | 3 | 310 / 295 | attack-electric → player-hit 또는 card-guard |
| etemon:3 / 콘서트 피날레 | 에테몬 | 파트너 / 1 | wave / #ffe083 / 5 | 3 | 295 / 295 | hit-normal → player-hit 또는 card-guard |
| myotismon:0 / 흡혈 | 묘티스몬 | 파트너 / 1 | dark / #ee91bb / 5 | 3 | 295 / 295 | attack-dark → player-hit 또는 card-guard |
| myotismon:3 / 나이트 레이드 | 묘티스몬 | 파트너 / 1 | shard / #bd86ef / 6 | 3 | 310 / 295 | attack-dark → player-hit 또는 card-guard |

방어·충전·상태 이상·소환은 기존의 행동 아이콘과 상태 변화 연출을 유지한다. 화상·반동은 직접 타격과 분리되어 잘못된 발사체를 만들지 않는다. 효과음은 기존 자체 제작 파일을 재사용한다. 새 벡터 모티프는 `src/combat-effects.ts`, 연결 데이터는 `src/effect-data.ts`, 표시는 `src/combat-effects.css`에 있다. 원작 추출 에셋이나 외부 이미지/음원을 사용하지 않았다.
