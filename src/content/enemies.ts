import type {EnemyDef,Intent,IntentType,ChapterId} from '../types';
const a=(type:IntentType,value:number,label:string,extra?:IntentType,amount?:number):Intent=>({type,value,label,extra,amount});
const hit=(n:number,label='공격',hits=1):Intent=>({type:'attack',value:n,label,hits});
type Row=[string,string,number,EnemyDef['rank'],ChapterId[],boolean,string,Intent[]];
const rows:Row[]=[
 ['kuwaga','쿠가몬',34,'normal',['file','server'],true,'빠른 연타. 방어를 먼저 준비하세요.',[hit(8,'가위 연격',2),a('defend',6,'갑각'),hit(12,'급강하')]],
 ['elec','에렉몬',32,'normal',['file'],true,'전류가 약화와 공격을 번갈아 만듭니다.',[hit(7,'전기 충격'),a('weaken',1,'전류 혼선'),hit(11,'방전')]],
 ['shellmon','쉘몬',38,'normal',['file'],true,'두꺼운 껍질 뒤에 큰 물대포를 준비합니다.',[a('defend',14,'껍질 숨기'),hit(16,'물대포'),hit(7,'촉수')]],
 ['seadramon','시드라몬',46,'normal',['file'],true,'물결이 다음 카드의 비용을 1 올립니다.',[a('tax',1,'차가운 물결'),hit(13,'얼음 화살'),hit(10,'꼬리치기')]],
 ['meramon','메라몬',56,'normal',['file','server'],true,'화상이 쌓입니다. 정화와 빠른 공격을 함께 준비하세요.',[a('burn',3,'불씨'),hit(14,'버닝 피스트'),hit(17,'열기')]],
 ['nume','워매몬',40,'normal',['file'],true,'공격보다 오염 누적이 위험합니다.',[a('corrupt',2,'오염 점액'),a('defend',9,'숨기'),hit(9,'들이받기')]],
 ['monochromon','모노크로몬',50,'normal',['file','server'],true,'충전한 힘은 정화로 걷어 낼 수 있습니다.',[a('charge',3,'화산 충전'),hit(15,'화산탄'),a('defend',8,'단단한 가죽')]],
 ['unimon','유니몬',53,'normal',['file'],true,'약화로 호흡을 흐트러뜨린 뒤 돌진합니다.',[a('weaken',1,'흐트러진 바람'),hit(16,'홀리 샷'),hit(11,'돌진')]],
 ['frigimon','프리지몬',49,'normal',['file'],true,'느린 얼음 공격 사이에 비용 방해를 사용합니다.',[hit(11,'얼음 펀치'),a('tax',1,'서리'),hit(16,'차가운 충격')]],
 ['mojyamon','모쟈몬',54,'normal',['file'],true,'연속 공격과 방어를 교대로 사용합니다.',[hit(14,'뼈 부메랑',2),a('defend',10,'설산의 자세'),hit(17,'얼음 검')]],
 ['centarumon','켄터스몬',57,'normal',['file','server'],true,'충전 중 방어를 갖추면 강한 빔을 버틸 수 있습니다.',[a('charge',4,'장치 충전'),hit(18,'태양 광선'),a('defend',8,'기계 장갑')]],
 ['bakemon','바케몬',44,'normal',['file','city'],false,'손패 한 장을 버리게 하는 교란을 사용합니다.',[a('shuffle',1,'유령의 장난'),a('tax',1,'그림자 손'),hit(14,'기습')]],
 ['gazimon','가지몬',37,'normal',['server'],false,'독한 숨결이 공격력을 낮춥니다.',[a('weaken',1,'마비 숨결'),hit(11,'날카로운 발톱',2),hit(9,'굴 파기')]],
 ['cockatrimon','코카트리몬',64,'normal',['server'],false,'에너지를 방해하고 크게 내려찍습니다.',[a('tax',1,'석화의 시선'),a('defend',8,'깃털 장벽'),hit(21,'내려찍기')]],
 ['raremon','레어몬',60,'normal',['city'],true,'불안정한 몸이 오염과 방어를 퍼뜨립니다.',[a('corrupt',2,'흩어진 데이터'),a('defend',12,'재구성'),hit(15,'점액 파동')]],
 ['dark-tyrannomon','다크티라노몬',69,'normal',['city'],true,'화상 뒤 무거운 일격. 부담 없이 방어할 틈을 찾으세요.',[a('burn',2,'검은 불꽃'),hit(20,'불길 돌진'),a('charge',3,'포효')]],
 ['demi-devimon','데미데블몬',34,'normal',['city','server'],false,'약화와 문장 봉인으로 기회를 빼앗습니다.',[a('weaken',1,'거짓 속삭임'),hit(10,'데미 다트'),a('seal',1,'불신의 메아리')]],
 ['andromon','안드로몬',88,'elite',['file','server'],true,'충전 뒤 강력한 소드. 강화 제거로 출력 억제가 가능합니다.',[a('charge',5,'출력 충전'),hit(23,'스파이럴 소드'),a('defend',14,'장갑 전개')]],
 ['ogre','우가몬',84,'elite',['file','server'],false,'포효할 때마다 공격력이 증가합니다.',[hit(16,'곤봉'),a('charge',4,'분노의 포효'),hit(22,'패왕권')]],
 ['leomon','레오몬',88,'elite',['file','server'],true,'검은 톱니바퀴의 명령과 자신의 의지가 교차합니다.',[hit(19,'수왕권'),a('seal',1,'톱니바퀴의 명령'),a('defend',12,'의지를 붙잡기'),hit(25,'검격')]],
 ['phantomon','팬텀몬',94,'elite',['city'],false,'저주가 남는 동안 큰 일격이 다가옵니다.',[a('curse',2,'저주'),a('charge',4,'낫을 들어 올리기'),hit(28,'처형 예고')]],
 ['devimon','데블몬',200,'boss',['file'],false,'오염과 문장 봉인. 5턴부터 4턴마다 공격 +6.',[hit(20,'데스 클로'),a('corrupt',2,'검은 톱니바퀴','seal',1),a('drain',25,'어둠의 흡수'),hit(29,'어둠의 파동')]],
 ['etemon','에테몬',184,'boss',['server'],false,'손패를 교란하고 다른 순서로 공연을 시작합니다. 행동 예고는 정확합니다.',[a('shuffle',2,'러브 세레나데'),hit(24,'다크 네트워크'),a('tax',1,'소음 폭풍'),hit(27,'콘서트 피날레')]],
 ['myotismon','묘티스몬',190,'boss',['city'],false,'흡혈과 오염, 데미데블몬 소환. 적은 최대 두 마리입니다.',[a('drain',20,'흡혈'),{type:'summon',value:1,label:'어둠의 사자',spawn:'demi-devimon'},a('corrupt',2,'밤의 장막'),hit(28,'나이트 레이드')]],
];
export const ENEMIES:Record<string,EnemyDef>=Object.fromEntries(rows.map(([id,name,hp,rank,chapters,purifiable,feature,pattern])=>[id,{name,hp,rank,chapters,purifiable,feature,pattern,art:id,color:rank==='boss'?'#bd92cc':purifiable?'#9cbfca':'#bdad88',shape:id,regions:chapters.map(c=>({file:'파일섬',server:'서버대륙',city:'현실 세계'})[c]),resist:{burn:id==='meramon'?50:0,weak:rank==='boss'?50:0,root:rank==='boss'?50:0},description:feature+' 이 조우는 손상된 데이터로 재구성된 팬게임의 독립 사건입니다.',encounter:purifiable?`${name}의 목소리에 낯선 명령이 겹칩니다. 오염을 끊어야 합니다.`:`${name}이 길을 막습니다. 다음 행동을 살피세요.`,victory:purifiable?`${name}의 오염이 풀렸습니다. “이제 내 목소리가 들려… 고마워.”`:`${name}이 물러나고 막혔던 데이터 길이 열렸습니다.`}]));
export const NPCS={sukamon:{name:'스카몬',text:'길을 어지럽혔지만 잃어버린 표지판을 기억한다.'},chuumon:{name:'츄몬',text:'작은 틈을 통과하며 안전한 길을 찾아 준다.'},piccolomon:{name:'픽콜몬',text:'서두르는 마음을 멈추고 파트너의 호흡을 듣게 한다.'},whamon:{name:'고래몬',text:'바다에 남은 신호를 듣고 다음 길로 안내한다.'}};

const enemyAudio:Record<string,string>={elec:"attack-electric",seadramon:"attack-water",shellmon:"attack-water",frigimon:"attack-water",meramon:"attack-fire","dark-tyrannomon":"attack-fire",andromon:"attack-electric",devimon:"attack-dark",myotismon:"attack-dark",phantomon:"attack-dark","demi-devimon":"attack-dark",bakemon:"attack-dark"};
for(const [id,audioId] of Object.entries(enemyAudio))ENEMIES[id].audioId=audioId;
