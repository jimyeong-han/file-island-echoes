import {mkdirSync,writeFileSync} from 'node:fs';
import {CHARACTERS,FORMS,CARDS,ENEMIES,CHAPTERS,STORIES,EVOLUTIONS} from '../src/data';
import {balanceReport} from './balance-simulation';
mkdirSync('docs',{recursive:true});
const lines=['# v0.4 콘텐츠와 규칙','', '이 문서는 `src/content/`의 실제 데이터에서 생성합니다. 반복 사건과 진화 조건은 팬게임의 독립 설계입니다.',''];
for(const c of Object.values(CHARACTERS)){
 lines.push(`## ${c.name} / ${c.partner} / ${c.crest}`,'',c.style,'',`- 지속 능력: ${c.passive}`,`- 문장: **${c.ability.name}** — ${c.ability.text}`,`- 조건: ${c.ability.condition}`,`- 난이도: ${c.difficulty}`,`- 시작 덱: ${[...new Set(c.startDeck)].map(id=>CARDS[id].name+' ×'+c.startDeck.filter(v=>v===id).length).join(', ')}`,'','| 전용 획득 카드 | 비용 | 효과 |','| --- | --- | --- |',...c.exclusive.map(id=>`| ${CARDS[id].name} | ${CARDS[id].cost} | ${CARDS[id].text} |`),'','### 성장','');
 for(const e of EVOLUTIONS.filter(e=>FORMS[e.from].owner===c.id))lines.push(`- ${FORMS[e.from].name} → ${FORMS[e.to].name}: ${e.condition}. ${FORMS[e.to].description}`);
 lines.push('','### 개인 이야기','',`도입: ${c.intro}`,'',...Object.values(STORIES).filter(s=>s.owner===c.id).map(s=>`- **${s.title}**: ${s.quote} ${s.body}`),'',`승리: ${c.ending}`,'',`패배·귀환: ${c.retry}`,'');
}
lines.push('## 챕터','','| 챕터 | 구역 | 보스 |','| --- | --- | --- |',...Object.values(CHAPTERS).map(c=>`| ${c.name} | ${c.zones.join(' → ')} | ${ENEMIES[c.boss].name} |`),'','각 챕터는 11개 장소, 5회 전투입니다. 완료는 해당 캐릭터의 다음 챕터만 해금합니다. 4장은 미구현입니다.','','## 적 도감','','| 적 | 등급 | HP | 특징 | 정화 대상 |','| --- | --- | --- | --- | --- |',...Object.values(ENEMIES).map(e=>`| ${e.name} | ${e.rank} | ${e.hp} | ${e.feature} | ${e.purifiable?'오염 해제':'격퇴'} |`),'');
writeFileSync('docs/CONTENT.md',lines.join('\n'));
const reports=balanceReport(100);writeFileSync('docs/balance-v04.json',JSON.stringify(reports,null,2)+'\n');
console.log(`Wrote ${Object.keys(CHARACTERS).length} characters, ${Object.keys(CARDS).length} cards, ${Object.keys(ENEMIES).length} enemies and 1,600 simulations.`);
