import type {Card,CardId,CharacterId} from '../types';
export const KEYWORDS:Record<string,string>={
 '화상':'적은 행동을 마친 뒤 화상 수치만큼 피해를 받고 화상이 1 감소합니다. 자신의 화상은 적 행동 전에 적용됩니다.',
 '약화':'적의 공격·흡수 피해가 40% 감소합니다. 내 약화는 공격 카드 피해를 25% 줄입니다.',
 '속박':'적의 공격·흡수 피해가 속박 1당 2 감소하고 행동 후 1 감소합니다.',
 '감전':'적의 공격·흡수 피해가 감전 수치만큼 감소하고 행동 후 1 감소합니다.',
 '노출':'다음 직접 피해가 노출 1당 추가 피해 2를 주고 노출을 모두 소비합니다.',
 '표식':'다음 직접 피해가 표식 1당 추가 피해 2를 주고 표식을 모두 소비합니다.',
 '연계':'다른 종류의 카드를 이어 쓰면 연계가 쌓입니다. 같은 종류를 쓰면 연계가 0으로 돌아갑니다. 최대 4.',
 '보존':'문장으로 보관한 카드는 다음 턴에 손으로 돌아옵니다. 새 드로우는 그 장수만큼 줄어듭니다.',
 '재생':'다음 내 턴 시작에 재생 수치만큼 회복하고 재생이 1 감소합니다.',
 '반격':'적의 공격·흡수 행동 직후 (완전히 방어해도 적용), 반격 수치만큼 되돌려 줍니다. 다음 내 턴에 사라집니다.',
 '개화':'미나가 정화할 때마다 1 획득합니다. 일부 카드로도 획득하며 최대 6, 전투 종료 시 초기화됩니다.',
 '비축':'정석은 턴 종료의 남은 에너지를 최대 2만큼 비축합니다. 최대 3, 문장이나 카드의 연계 자원입니다.',
 '희망':'리키는 턴 시작 시 체력 40% 이하이거나 공격 카드가 없으면 1 획득합니다. 턴당 1, 최대 3.',
 '빛':'나리가 오염·약화를 정화하거나 적 방어·강화를 제거한 행동마다 1 획득합니다. 최대 6.',
 '정화':'자신의 오염·화상·약화를 각각 표시한 수치만큼 제거합니다.',
 '소멸':'사용한 카드를 이번 전투 동안 덱 순환에서 제외합니다. 다음 전투에는 돌아옵니다.',
 '추가 비용':'다음 카드의 에너지 비용이 1 증가합니다. 카드 한 장을 사용하면 중첩이 1 감소합니다.',
 '교란':'다음 턴 드로우 직후 표시 수만큼 손패를 버립니다.',
 '봉인':'표시된 내 턴 동안 문장 능력을 사용할 수 없습니다.',
};
export function describeCard(c:Card):string {
 const out:string[]=[];
 if(c.damage)out.push(`${c.all?'모든 적':'선택한 적'}에게 피해 ${c.damage}${c.scaling?' (중첩·방어 연계 포함)':''}.`);
 if(c.block)out.push(`방어도 ${c.block}.`);if(c.heal)out.push(`체력 ${c.heal} 회복.`);
 if(c.draw)out.push(`카드 ${c.draw}장 뽑기.`);if(c.energy)out.push(`에너지 +${c.energy}.`);
 for(const [key,label] of [['weak','약화'],['burn','화상'],['root','속박'],['shock','감전'],['expose','노출'],['mark','표식']] as const)if(c[key])out.push(`${c.all?'모든 적':'선택한 적'}에게 ${label} ${c[key]}.`);
 if(c.cleanse)out.push(`정화 ${c.cleanse}.`);if(c.dispel)out.push(`${c.all?'모든 적':'선택한 적'}의 방어·강화 제거.`);
 for(const [key,label] of [['regen','재생'],['thorns','반격'],['growth','개화'],['stock','비축'],['hope','희망']] as const)if(c[key])out.push(`${label} +${c[key]}.`);
 if(c.relief)out.push(`부담 -${c.relief}.`);if(c.burden)out.push(`부담 +${c.burden}.`);if(c.self)out.push(`체력 ${c.self} 소모.`);if(c.exhaust)out.push('소멸.');
 return out.join(' ');
}
const make=(name:string,cost:number,kind:Card['kind'],effects:Omit<Partial<Card>,'name'|'cost'|'kind'|'text'>):Card=>{const c:Card={name,cost,kind,text:'',...effects};c.text=describeCard(c);return c;};
export const CARDS:Record<CardId,Card>={
 guard:make('몸으로 막기',1,'guard',{block:7,rarity:'basic'}),
 cheer:make('파트너의 격려',0,'support',{draw:1,rarity:'basic'}),
 food:make('비상 식량',1,'support',{heal:5,rarity:'basic'}),
 light:make('데이터 정화',1,'support',{cleanse:3,heal:3,keywords:['정화']}),
 claw:make('틈새 공격',1,'attack',{damage:8,draw:1}),
};
const add=(owner:CharacterId,id:string,name:string,cost:number,kind:Card['kind'],effects:Partial<Card>,keywords:string[]=[])=>{CARDS[id]=make(name,cost,kind,{owner,rarity:'uncommon',keywords,...effects});};
// Six obtainable cards per child, plus evolution replacements. Effects are data, not UI callbacks.
add('tai','flame','베이비 플레임',1,'attack',{damage:7});
add('tai','courage','용기의 일격',2,'attack',{damage:20,burden:1},['위험 보상']);
add('tai','rush','선두 돌파',1,'attack',{damage:9,draw:1,self:2},['돌진']);
add('tai','ember','불씨를 이어서',1,'attack',{damage:4,burn:3},['화상']);
add('tai','resolve','책임의 방패',1,'guard',{block:8,relief:1});
add('tai','pressure','한 번 더 앞으로',0,'support',{energy:1,burden:2,self:2,exhaust:true},['소멸']);
add('tai','nova','메가 플레임',1,'attack',{damage:10,burn:1,stage:1,rarity:'evolved'},['화상']);
add('tai','missile','기가 디스트로이어',2,'attack',{damage:18,block:4,all:true,stage:2,rarity:'evolved'});
add('tai','zero','그라운드 제로',2,'attack',{damage:33,self:5,burden:2,all:true,stage:2,rarity:'evolved'},['위험 보상']);
add('matt','blue','파란 불꽃',1,'attack',{damage:7});
add('matt','matt','매튜의 대비',1,'guard',{block:7,draw:1},['연계']);
add('matt','feint','한 발 비켜서',0,'support',{draw:1,block:2});
add('matt','counter','친구의 빈틈을 지켜',1,'guard',{block:6,thorns:4},['반격']);
add('matt','link','이어지는 발톱',1,'attack',{damage:6,scaling:'combo'},['연계']);
add('matt','howl','멀리 닿는 울음',1,'support',{draw:2,relief:2},['보존']);
add('matt','blue-plus','폭스 파이어',1,'attack',{damage:11,stage:1,rarity:'evolved'});
add('matt','wolf-claw','우정의 연격',2,'attack',{damage:19,draw:1,scaling:'combo',stage:2,rarity:'evolved'},['연계']);
add('sora','feather','매지컬 파이어',1,'attack',{damage:7});
add('sora','sora','소라의 보호',1,'guard',{block:8,relief:1});
add('sora','regen','따뜻한 둥지',1,'support',{regen:3,draw:1},['재생']);
add('sora','wind','날개 뒤의 바람',1,'attack',{damage:5,scaling:'block'},['보호']);
add('sora','embrace','나도 쉬어 갈게',1,'support',{heal:6,relief:2,exhaust:true},['소멸']);
add('sora','flare-wing','다시 펼친 날개',2,'attack',{damage:15,block:8});
add('sora','meteor-wing','메테오 윙',1,'attack',{damage:10,block:3,stage:1,rarity:'evolved'});
add('sora','shadow-wing','그림자 날개',2,'attack',{damage:17,block:6,all:true,stage:2,rarity:'evolved'});
add('koushiro','shock','전기 충격',1,'attack',{damage:6,shock:1},['감전']);
add('koushiro','analysis','한솔의 분석',1,'support',{weak:1,draw:1},['약화']);
add('koushiro','scan','비상 차폐',1,'guard',{block:7,expose:1},['노출']);
add('koushiro','chain','회로의 사슬',2,'attack',{damage:10,shock:2,all:true},['감전']);
add('koushiro','expose','아직 모르는 답',0,'support',{expose:2,draw:1,exhaust:true},['노출','소멸']);
add('koushiro','probe','빈틈 검증',1,'attack',{damage:8,draw:1});
add('koushiro','mega-blaster','메가 블래스터',1,'attack',{damage:10,shock:1,stage:1,rarity:'evolved'},['감전']);
add('koushiro','horn-buster','혼 버스터',2,'attack',{damage:19,block:3,expose:2,all:true,stage:2,rarity:'evolved'},['노출']);
add('mimi','ivy','포이즌 아이비',1,'attack',{damage:5,burn:2},['화상']);
add('mimi','mimi','미나의 돌봄',1,'support',{heal:6,cleanse:2},['정화','개화']);
add('mimi','bloom','작은 꽃봉오리',1,'guard',{block:7,growth:1},['개화']);
add('mimi','bind','덩굴의 약속',1,'attack',{damage:5,root:2},['속박']);
add('mimi','seed','씨앗의 시간',0,'support',{growth:2,draw:1,exhaust:true},['개화','소멸']);
add('mimi','garden','모두의 정원',2,'attack',{damage:9,scaling:'growth',all:true},['개화']);
add('mimi','needle','따끔한 초록 주먹',1,'attack',{damage:9,root:1,stage:1,rarity:'evolved'},['속박']);
add('mimi','flower-cannon','플라워 캐논',2,'attack',{damage:15,scaling:'growth',cleanse:2,stage:2,rarity:'evolved'},['개화','정화']);
add('joe','fish','마칭 피시즈',1,'attack',{damage:7});
add('joe','joe','정석의 보급',0,'support',{heal:3});
add('joe','stock','꼼꼼한 점검',1,'guard',{block:7,stock:1},['비축']);
add('joe','shell','든든한 방벽',1,'guard',{block:10,relief:1});
add('joe','harpoon','막아 낸 힘으로',1,'attack',{damage:5,scaling:'block'},['방어']);
add('joe','ration','비축 식량',1,'support',{heal:5,draw:1,stock:1},['비축']);
add('joe','harpoon-plus','하푼 발칸',1,'attack',{damage:10,block:2,stage:1,rarity:'evolved'});
add('joe','hammer','해머 스파크',2,'attack',{damage:18,block:5,scaling:'stock',stage:2,rarity:'evolved'},['비축']);
add('tk','bubble','에어 샷',1,'attack',{damage:7});
add('tk','hope','리키의 희망',1,'guard',{block:8,relief:1});
add('tk','prayer','작은 기도',1,'support',{heal:4,draw:1});
add('tk','dawn','새벽의 한 걸음',1,'attack',{damage:6,scaling:'hope'},['희망']);
add('tk','resolve-hope','포기하지 않을게',1,'guard',{block:6,hope:1,exhaust:true},['희망','소멸']);
add('tk','gate','빛을 기다리며',2,'support',{heal:8,cleanse:3},['정화']);
add('tk','heavens-knuckle','헤븐즈 너클',1,'attack',{damage:11,stage:1,rarity:'evolved'});
add('tk','holy-gate','헤븐즈 게이트',2,'attack',{damage:20,heal:6,hope:1,scaling:'hope',stage:2,rarity:'evolved'},['희망']);
add('kari','cat','네코 펀치',1,'attack',{damage:7});
add('kari','light-mark','빛의 흔적',1,'guard',{block:7,mark:1},['표식']);
add('kari','purge','정화의 시선',1,'support',{cleanse:2,dispel:true,draw:1},['정화','빛']);
add('kari','moon','어둠 속의 길',1,'attack',{damage:6,scaling:'light'},['빛']);
add('kari','radiance','빛을 나누다',1,'support',{mark:2,all:true,draw:1},['표식']);
add('kari','mercy','남아 있는 목소리',1,'support',{heal:5,cleanse:2,exhaust:true},['정화','소멸']);
add('kari','cat-resonant','공명하는 발톱',1,'attack',{damage:10,mark:1,stage:1,rarity:'evolved'},['표식']);
add('kari','holy-arrow','홀리 애로우',2,'attack',{damage:20,block:5,dispel:true,all:true,stage:2,rarity:'evolved'},['빛']);
export const COMMON_CARDS=['guard','cheer','food','light','claw'];
