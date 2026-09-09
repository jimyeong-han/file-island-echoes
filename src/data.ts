import type { Card, CardId, EnemyDef, Form, MapNode, Story } from './types';
export const CARDS:Record<CardId,Card> = {
 flame:{name:'베이비 플레임',cost:1,kind:'attack',text:'적 하나에게 피해 7.',damage:7},
 guard:{name:'몸으로 막기',cost:1,kind:'guard',text:'방어도 7 획득.',block:7},
 cheer:{name:'태일의 응원',cost:0,kind:'support',text:'카드 1장 뽑기. 에너지를 소비하지 않습니다.',draw:1},
 food:{name:'비상 식량',cost:1,kind:'support',text:'체력 5 회복.',heal:5},
 analysis:{name:'한솔의 분석',cost:1,kind:'support',text:'적 하나에게 약화 1턴. 카드 1장 뽑기. 약화: 공격 피해 40% 감소.',weak:1,draw:1},
 sora:{name:'소라의 보호',cost:1,kind:'guard',text:'방어도 10 획득. 부담 1 감소.',block:10,relief:1},
 light:{name:'정화의 빛',cost:1,kind:'support',text:'오염 3 제거. 체력 5 회복.',cleanse:3,heal:5},
 courage:{name:'용기의 일격',cost:2,kind:'attack',text:'피해 19. 부담 1 증가.',damage:19,burden:1},
 claw:{name:'날카로운 발톱',cost:1,kind:'attack',text:'피해 9. 카드 1장 뽑기.',damage:9,draw:1},
 matt:{name:'매튜의 대비',cost:1,kind:'guard',text:'방어도 8 획득. 카드 1장 뽑기.',block:8,draw:1},
 mimi:{name:'미나의 돌봄',cost:1,kind:'support',text:'체력 7 회복. 오염 1 제거.',heal:7,cleanse:1},
 joe:{name:'정석의 보급',cost:0,kind:'support',text:'체력 3 회복. 에너지를 소비하지 않습니다.',heal:3},
 hope:{name:'리키의 희망',cost:1,kind:'guard',text:'방어도 12 획득. 부담 2 감소.',block:12,relief:2},
 nova:{name:'메가 플레임',cost:1,kind:'attack',text:'피해 12. 그레이몬의 강화 기술.',damage:12},
 missile:{name:'기가 디스트로이어',cost:2,kind:'attack',text:'모든 적에게 피해 22. 방어도 8 획득.',damage:22,block:8,all:true},
 zero:{name:'그라운드 제로',cost:2,kind:'attack',text:'모든 적에게 피해 34. 체력 5 소모, 부담 2 증가.',damage:34,self:5,burden:2,all:true},
};
export const START_DECK:CardId[]=['flame','flame','flame','flame','guard','guard','guard','cheer','cheer','food'];
export const REWARD_POOL:CardId[]=['flame','guard','cheer','food','analysis','sora','light','courage','claw','matt','mimi','joe','hope'];
export const FORMS:Record<Form,{name:string;tag:string;description:string;hp:number;bonus:number}>={
 agumon:{name:'아구몬',tag:'성장기',description:'“태일아, 모험도 좋지만 밥은 먹고 가자!”',hp:64,bonus:0},
 greymon:{name:'그레이몬',tag:'성숙기',description:'베이비 플레임 → 메가 플레임. 최대 체력 +16, 체력 16 회복.',hp:80,bonus:0},
 metal:{name:'메탈그레이몬',tag:'완전체 · 유대',description:'메가 플레임 2장 → 기가 디스트로이어. 모든 공격 +3, 방어 카드 방어도 +3. 최대 체력 +20, 체력 20 회복.',hp:100,bonus:3},
 skull:{name:'스컬그레이몬',tag:'완전체 · 강제 진화',description:'메가 플레임 2장 → 그라운드 제로. 모든 공격 +5. 턴 종료마다 체력 2 소모. 최대 체력 +10, 체력 10 회복.',hp:90,bonus:5},
};
// Game-specific rules; these do not describe canonical species attributes.
export const EVOLUTIONS:{from:Form;to:Form;energy:number;bond:number;burden:number;condition:string}[]=[
 {from:'agumon',to:'greymon',energy:5,bond:0,burden:0,condition:'진화 에너지 5'},
 {from:'greymon',to:'metal',energy:14,bond:7,burden:0,condition:'진화 에너지 14 · 유대 7 이상'},
 {from:'greymon',to:'skull',energy:12,bond:0,burden:6,condition:'진화 에너지 12 · 부담 6 이상'},
];
const hit=(value:number,label='공격')=>({type:'attack' as const,value,label});
export const ENEMIES:Record<string,EnemyDef>={
 kuwaga:{name:'쿠가몬',hp:34,color:'#ed634c',shape:'beetle',description:'톱니바퀴에 흔들린 숲의 곤충형 디지몬. 방어 뒤 강한 공격을 준비한다.',pattern:[hit(7,'가위손'),{type:'defend',value:7,label:'갑각 방어'},hit(12,'급강하')]},
 elec:{name:'에렉몬',hp:34,color:'#f28283',shape:'beast',description:'방전과 재충전을 반복한다. 정화하면 다시 숲으로 돌아간다.',pattern:[hit(7,'전기 충격'),{type:'corrupt',value:1,label:'혼선'},hit(12,'스파클링 썬더')]},
 meramon:{name:'메라몬',hp:64,color:'#ff984a',shape:'flame',description:'오염된 열이 점점 커진다. 불꽃 공격과 데이터 오염을 반복한다.',pattern:[{type:'corrupt',value:2,label:'오염된 열'},hit(16,'버닝 피스트'),hit(19,'열 폭주')]},
 nume:{name:'워매몬',hp:42,color:'#9abc6b',shape:'slime',description:'낮은 공격력 대신 오염을 쌓고 몸을 숨긴다.',pattern:[{type:'corrupt',value:2,label:'오염 점액'},{type:'defend',value:10,label:'숨기'},hit(10,'들이받기')]},
 andromon:{name:'안드로몬',hp:96,color:'#a4bdce',shape:'robot',description:'공장의 명령 오류에 갇혔다. 장갑과 강한 공격을 번갈아 사용한다.',pattern:[{type:'defend',value:14,label:'장갑 전개'},hit(24,'스파이럴 소드'),hit(16,'개틀링 어택')]},
 ogre:{name:'우가몬',hp:88,color:'#94b36e',shape:'ogre',description:'힘으로 길을 가로막는다. 큰 일격 사이 방어의 틈을 노리자.',pattern:[hit(18,'곤봉'),hit(26,'패왕권'),{type:'defend',value:8,label:'자세 잡기'}]},
 devimon:{name:'데블몬',hp:200,color:'#b093d1',shape:'devil',description:'무한산에 모인 톱니바퀴를 조종한다. 공격과 오염, 체력 흡수를 순환한다. 5턴부터 4턴마다 공격·흡수 피해가 6씩 증가한다.',pattern:[hit(20,'데스 클로'),{type:'corrupt',value:2,label:'검은 톱니바퀴'},{type:'drain',value:26,label:'어둠의 흡수'},hit(32,'어둠의 파동')]},
};
export const ZONES=['파일섬의 숲','버려진 공장','무한산'];
export const zoneAt=(row:number)=>Math.min(2,Math.floor(row/4));
export const MAP:MapNode[][]=[
 [{id:'0a',name:'뒤틀린 숲길',type:'battle',note:'쿠가몬 · 첫 전투',enemies:['kuwaga']}],
 [{id:'1a',name:'작은 신호',type:'event',note:'한솔과 텐타몬의 흔적',event:'koushiro'},{id:'1b',name:'강가의 식량',type:'event',note:'정석과 쉬라몬의 보급',event:'joe'}],
 [{id:'2a',name:'전류가 흐르는 숲',type:'battle',note:'에렉몬 두 마리',enemies:['elec','elec']},{id:'2b',name:'타오르는 공터',type:'battle',note:'메라몬',enemies:['meramon']}],
 [{id:'3a',name:'소라의 모닥불',type:'rest',note:'휴식 · 체력과 부담 회복'},{id:'3b',name:'친구의 손길',type:'event',note:'미나와 팔몬',event:'mimi'}],
 [{id:'4a',name:'녹슨 배수로',type:'battle',note:'워매몬과 에렉몬',enemies:['nume','elec']},{id:'4b',name:'과열된 동력실',type:'elite',note:'안드로몬 · 진화 에너지 보너스',enemies:['andromon']}],
 [{id:'5a',name:'끊어진 다리',type:'event',note:'매튜와 파피몬의 판단',event:'matt'},{id:'5b',name:'검은 동력원',type:'event',note:'태일과 아구몬 · 위험과 힘',event:'gear'}],
 [{id:'6a',name:'희망의 통신',type:'event',note:'리키와 파닥몬',event:'tk'},{id:'6b',name:'오염된 제어실',type:'event',note:'한솔과 텐타몬',event:'terminal'}],
 [{id:'7a',name:'공장 밖의 쉼터',type:'rest',note:'소라와 피요몬 · 마지막 보급'}],
 [{id:'8a',name:'산기슭의 문지기',type:'battle',note:'우가몬',enemies:['ogre']},{id:'8b',name:'불꽃의 능선',type:'elite',note:'메라몬과 워매몬',enemies:['meramon','nume']}],
 [{id:'9a',name:'빛이 머무는 곳',type:'event',note:'나리와 가트몬',event:'kari'},{id:'9b',name:'메아리의 절벽',type:'event',note:'태일과 아구몬 · 마지막 선택',event:'echo'}],
 [{id:'10a',name:'무한산 정상',type:'boss',note:'데블몬 · 오염의 근원',enemies:['devimon']}],
];
export const STORIES:Record<string,Story>={
 koushiro:{title:'숲속에서 수신된 메시지',speaker:'장한솔 · 텐타몬',quote:'“지형 데이터가 반복되고 있어요. 하지만 우리 선택까지 정해진 건 아니에요.”',body:'텐타몬이 부서진 표지판 위에 앉는다. 한솔은 친구들이 지나간 방향을 복원하려 한다.',choices:[{label:'함께 신호를 복원한다',text:'유대 +2 · 진화 에너지 +2 · 한솔의 분석 획득',bond:2,energy:2,card:'analysis'},{label:'위험 구역을 먼저 조사한다',text:'진화 에너지 +5 · 부담 +2',energy:5,burden:2}]},
 joe:{title:'누구 몫도 빠뜨리지 않게',speaker:'정석 · 쉬라몬',quote:'“잠깐! 식량 확인부터 하자. 무턱대고 가면 쓰러진다고!”',body:'쉬라몬이 물 밖으로 보급 주머니를 밀어 올린다. 아구몬의 눈이 반짝인다.',choices:[{label:'아구몬과 도시락을 나눈다',text:'체력 +12 · 유대 +2 · 정석의 보급 획득',hp:12,bond:2,card:'joe'},{label:'산에 가져갈 식량을 챙긴다',text:'보급품 +2 · 진화 에너지 +3',supplies:2,energy:3}]},
 mimi:{title:'작은 잎으로 만든 그늘',speaker:'이미나 · 팔몬',quote:'“아프면 아프다고 말해야지! 팔몬, 여기 그늘 좀 만들어 줘.”',body:'팔몬은 지친 아구몬에게 부드러운 잎을 내민다. 숲의 소음이 잠시 잦아든다.',choices:[{label:'함께 쉬며 상태를 살핀다',text:'체력 +18 · 오염 -2 · 유대 +2 · 미나의 돌봄 획득',hp:18,corruption:-2,bond:2,card:'mimi'},{label:'다친 디지몬을 먼저 돕는다',text:'체력 -5 · 유대 +3 · 진화 에너지 +3',hp:-5,bond:3,energy:3}]},
 matt:{title:'서두르는 발걸음',speaker:'매튜 · 파피몬',quote:'“태일, 앞만 보고 달리지 마. 아구몬 상태도 보라고.”',body:'다리 아래로 잘못된 데이터가 흐른다. 파피몬이 안전한 우회로의 냄새를 찾는다.',choices:[{label:'매튜와 안전한 길을 찾는다',text:'유대 +2 · 부담 -2 · 매튜의 대비 획득',bond:2,burden:-2,card:'matt'},{label:'내가 먼저 뛰어넘는다',text:'체력 -7 · 진화 에너지 +6 · 부담 +3',hp:-7,energy:6,burden:3}]},
 gear:{title:'검은 동력원의 유혹',speaker:'신태일 · 아구몬',quote:'“이 힘이면 더 빨리 갈 수 있어….” “태일아, 난 조금 불안해.”',body:'부서진 톱니바퀴에서 에너지가 새어 나온다. 강한 힘에는 분명한 대가가 따른다.',choices:[{label:'아구몬의 말을 듣고 물러난다',text:'유대 +3 · 부담 -2 · 진화 에너지 +2',bond:3,burden:-2,energy:2},{label:'위험을 감수하고 힘을 끌어온다',text:'진화 에너지 +9 · 부담 +6 · 오염 +2. 강제 진화 조건에 가까워집니다.',energy:9,burden:6,corruption:2}]},
 tk:{title:'아직 포기하지 않았어',speaker:'리키 · 파닥몬',quote:'“형도, 태일이 형도 기다리고 있어. 우리 꼭 다시 만나자.”',body:'작은 통신기에서 파닥몬의 목소리가 들린다. 혼자가 아니라는 사실만으로 발걸음이 가벼워진다.',choices:[{label:'모두 함께 돌아가자고 약속한다',text:'유대 +3 · 부담 -1 · 리키의 희망 획득',bond:3,burden:-1,card:'hope'},{label:'친구들에게 길을 알려 준다',text:'진화 에너지 +4 · 체력 +8',energy:4,hp:8}]},
 terminal:{title:'멈추지 않는 제어실',speaker:'장한솔 · 텐타몬',quote:'“출력은 올릴 수 있어요. 하지만 파트너가 견딜 수 있을까요?”',body:'화면에 복원과 과부하 두 명령이 남아 있다. 이 장치는 종족을 바꾸지 않지만 몸에 큰 부담을 준다.',choices:[{label:'오염된 데이터를 복구한다',text:'오염 -3 · 유대 +2 · 진화 에너지 +3',corruption:-3,bond:2,energy:3},{label:'과부하 출력을 사용한다',text:'진화 에너지 +8 · 부담 +5 · 체력 -6',energy:8,burden:5,hp:-6}]},
 kari:{title:'검은 틈 사이의 빛',speaker:'신나리 · 가트몬',quote:'“오빠, 아구몬의 목소리를 들어 봐. 아직 빛이 남아 있어.”',body:'가트몬이 길목의 톱니바퀴를 부순다. 희미한 빛이 산 정상으로 이어진다.',choices:[{label:'아구몬과 나란히 빛을 따라간다',text:'오염 모두 제거 · 유대 +3 · 체력 +12 · 정화의 빛 획득',corruption:-99,bond:3,hp:12,card:'light'},{label:'정화 에너지를 나눠 받는다',text:'진화 에너지 +6 · 오염 -2 · 부담 -2',energy:6,corruption:-2,burden:-2}]},
 echo:{title:'다시 들려오는 약속',speaker:'신태일 · 아구몬',quote:'“내가 너무 서둘렀지?” “그래도 난 태일이를 믿어.”',body:'같은 바람, 같은 절벽. 이번에는 서로의 눈을 보며 앞으로 나아간다.',choices:[{label:'함께 속도를 맞춘다',text:'체력 +20 · 부담 -3 · 유대 +3',hp:20,burden:-3,bond:3},{label:'마지막 힘을 끌어낸다',text:'진화 에너지 +7 · 부담 +4 · 용기의 일격 획득',energy:7,burden:4,card:'courage'}]},
};

// Shared recovery rules keep interface descriptions and combat in sync.
export const RECOVERY = { supply: 12, rest: 20, train: 6 } as const;
export const BOSS_RAGE = { turn: 5, interval: 4, damage: 6 } as const;
