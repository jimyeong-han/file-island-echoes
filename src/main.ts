import { cardFace } from './card-ui';
import { logEntries } from './combat-log';
import { MotionQueue } from './combat-motion';
import type { TurnFrame } from './engine';
import { APP_VERSION, MAX_SAVE_BYTES, exportSave, prepareImport, replaceSave, resetSave, freshSave } from './save-files';
import type { SavePreview } from './save-files';
import { dataPanel, resetPanel } from './save-files-ui';
import { HELP_CHAPTERS } from './help';
import './style.css';
import './visual.css';
import './expansion.css';
import { BOSS_RAGE, RECOVERY, CARDS, ENEMIES, FORMS, CHARACTERS, CHAPTERS, KEYWORDS, NPCS, chapterOf, sceneAt, STORIES, zoneAt } from './data';
import { crest, crestReady, harmful, retire, storyOf, bossRageBonus, cardStats, chooseEvent, endTurn, enterNode, evolve, evolutionOptions, intent, newRun, nodeOf, playCard, rest, reward, turnThreat, useSupply } from './engine';
import { chapterUnlocked, loadSave, updateArchive, writeSave } from './storage';
import { background, portrait, sprite, installArtFallback } from './art';
import { icon } from './icons';
import { AUDIO } from './audio';
import { GameAudio } from './audio-events';
import { installAudioInput } from './audio-input';
import './audio.css';
import './typography.css';
import './refinements.css';
import './combat.css';
import type { CardId, Form, Run, CharacterId, ChapterId } from './types';
if(import.meta.env.DEV&&new URLSearchParams(location.search).has('audioDebug'))void import('./audio-debug').then(m=>m.installAudioDebug());

const loaded=loadSave();const save=loaded.save;
const gameAudio=new GameAudio(save.settings);
let currentAction='';
let warning=loaded.warning,view:'title'|'game'|'select'|'detail'|'chapters'='title',modal='',pendingForm:Form|null=null,notice='',attack=false,enemyActing=false,cardEffect='support',impactTarget=-1;
let filePreview:SavePreview|null=null, dataMessage='', fileReading=false, fileRequest=0;
let helpChapter=0;
let mapZone:number|null=null;
let selected:CharacterId='tai', order:number[]=[];
const motion=new MotionQueue();
let presented:Run|null=null,dealStart=-1,motionLabel='',enemyMotion:TurnFrame|null=null,hpFeedback='';
const prefersMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced=()=>save.settings.reducedMotion||prefersMotion.matches;
const root=document.querySelector<HTMLDivElement>('#app')!;
installArtFallback(root);
installAudioInput(root,()=>{void gameAudio.mixer.unlock();},(id,disabled)=>{
 if(motion.busy)return;
 if(disabled){gameAudio.mixer.playInput(id.startsWith('card:')?'energy-low':'ui-denied');return;}
 // Muting must be silent; enabling gives feedback after the setting changes.
 if(id==='sound')return;
 const [action,value]=id.split(':');gameAudio.action(action,value);
});
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const btn=(label:string,action:string,cls='',attrs='')=>`<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const kindName=(type:string)=>({battle:'전투',elite:'강적',event:'이야기',rest:'휴식',boss:'최종 보스',attack:'공격',guard:'방어',support:'지원'} as Record<string,string>)[type]||type;
function persist(previous:Run|null) {updateArchive(save,previous);if(!writeSave(save))warning='이 브라우저에서 저장할 수 없습니다. 새로고침하면 진행 상황이 사라질 수 있습니다.';}
function act(fn:(r:Run)=>void) {if(!save.run)return;const before=structuredClone(save.run);const discovered=save.archive.forms.length+save.archive.enemies.length+save.archive.events.length;fn(save.run);persist(before);render();gameAudio.transition(before,save.run,currentAction,discovered<save.archive.forms.length+save.archive.enemies.length+save.archive.events.length);if(before.screen==='battle'&&save.run.screen==='battle'&&save.run.battle!.hand.length>(before.battle?.hand.length||0))void dealHand(before.battle!.hand.length);}
function meter(value:number,max:number,cls='') {return `<div class="meter ${cls}"><i style="width:${Math.max(0,Math.min(100,value/max*100))}%"></i></div>`;}
function header(){return `<header class="topbar"><button data-action="home" class="brand" aria-label="타이틀로">${icon('device')}<span>우리들의 모험</span></button><nav class="top-actions" aria-label="게임 메뉴">${btn(icon('archive')+'<span>도감</span>','archive','quiet','aria-label="도감" title="도감"')}${btn(`${icon(save.settings.muted?'sound-off':'sound-on')}<span>${save.settings.muted?'음소거':'소리 켜짐'}</span>`,'sound','quiet',`aria-label="${save.settings.muted?'소리 켜기':'음소거하기'}" aria-pressed="${!save.settings.muted}"`)}${btn(icon('help')+'<span>도움말</span>','help','quiet','aria-label="도움말" title="도움말"')}${btn(icon('settings')+'<span>설정</span>','settings','quiet','aria-label="설정" title="설정"')}</nav></header>`;}
function title(){const r=save.run;return `<main class="title-screen">
 ${background(0,'title-landscape')}<div class="title-illustration">${portrait('tai','hero-portrait')}</div>
 <div class="title-copy"><div class="logo-emblem" aria-hidden="true">${icon('device')}</div><p class="series-title">디지몬 어드벤처 · 비공식 팬게임</p><h1 aria-label="디지몬: 우리들의 모험">우리들의<em>모험</em></h1><p class="intro">검은 톱니바퀴가 다시 움직인다.<br/>여덟 개의 마음, 서로 다른 모험.</p>
 <div class="title-audio">${btn(save.settings.muted?'소리 켜기':'소리 끄기','sound','audio-start',`aria-pressed="${!save.settings.muted}"`)}<small>이 모험을 위해 만든 음악과 효과음</small></div><div class="start-actions">${r&&r.screen!=='result'?btn(`<span>이어서 탐험</span><small>${chapterOf(r).zones[zoneAt(r.row)]} · ${r.row+1}번째 장소</small>`,'continue','title-menu'):''}${btn('<span>새 탐험</span><small>아이와 파트너 선택 →</small>','new','title-menu')}${btn('<span>탐험 안내</span><small>카드 전투와 진화</small>','help','title-menu')}</div><p class="playtime">한 판은 약 10~15분이며, 진행 상황은 자동으로 저장됩니다.</p></div>
 <footer class="title-footer"><span>FILE ISLAND ECHOES <b>${APP_VERSION}</b></span><p>비공식 · 비영리 팬 프로젝트<br/>사건과 진화 조건은 이 게임을 위한 창작 설정입니다.</p></footer></main>`;}

function partnerHealth(r:Run,compact=false){return `<div class="partner-health ${compact?'compact-health':''} ${r.hp<=r.maxHp*.25?'health-danger':''}" aria-label="${FORMS[r.form].name} 체력"><span>${compact?FORMS[r.form].name+' · ':''}<b>${r.hp}</b> / ${r.maxHp}${r.hp<=r.maxHp*.25?' · 위험':''}</span><meter min="0" max="${r.maxHp}" value="${r.hp}" low="${r.maxHp*.25}" optimum="${r.maxHp}" aria-label="${FORMS[r.form].name} 남은 체력"></meter></div>`;}
function beginMotion(){
 return motion.begin(()=>{presented=null;enemyMotion=null;hpFeedback='';dealStart=-1;motionLabel='';attack=false;enemyActing=false;root.ownerDocument.querySelectorAll('.card-flight').forEach(e=>e.remove());gameAudio.mixer.stopGroup('combat');render();});
}
async function dealHand(start:number,token?:number){
 const r=save.run;if(!r?.battle||r.screen!=='battle'||start>=r.battle.hand.length)return;
 const own=token===undefined;if(own){token=beginMotion();void gameAudio.mixer.play('card-draw',0,'combat');}
 presented=null;dealStart=reduced()?-1:start;motionLabel='기술 카드를 받는 중';render();
 if(!await motion.wait(reduced()?50:460+Math.min(r.battle.hand.length-start-1,9)*75,token!))return;
 dealStart=-1;motionLabel='';if(own)motion.finish();else render();
}
async function animateCard(index:number){
 const r=save.run;
 if(motion.busy||r?.screen!=='battle'||!r.battle||index<0||!r.battle.hand[index])return;
 const source=root.querySelector<HTMLButtonElement>(`[data-action="card:${index}"]`),rect=source?.getBoundingClientRect();
 const clone=source?.cloneNode(true) as HTMLElement|undefined;
 const before=structuredClone(r),c=cardStats(r,r.battle.hand[index]);
 if(!playCard(r,index))return;
 persist(before);const after=structuredClone(r),token=beginMotion();
 presented=before;motionLabel=c.name+' 사용';render();
 if(clone&&rect&&!reduced()){
  clone.removeAttribute('data-action');clone.removeAttribute('aria-label');clone.setAttribute('aria-hidden','true');clone.inert=true;
  clone.classList.add('card-flight');clone.classList.remove('card-selected');clone.style.cssText=`left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;`;
  document.body.append(clone);
  clone.animate([{transform:'translateY(0) scale(1)',opacity:1},{transform:'translateY(-56px) scale(1.05)',opacity:1,offset:.45},{transform:'translateY(-76px) scale(.98)',opacity:0}],{duration:340,easing:'ease-out',fill:'forwards'});
 }
 if(!await motion.wait(reduced()?0:145,token))return;
 presented=structuredClone(after);if(presented.battle)presented.battle.hand=[...before.battle!.hand];if(before.screen==='battle'&&after.screen!=='battle')presented.screen='battle';
 attack=true;cardEffect=c.damage?'attack':c.block?'guard':c.heal?'heal':'support';impactTarget=c.all?-1:before.battle!.target;
 hpFeedback=after.hp<before.hp?'health-hit':after.hp>before.hp?'health-heal':'';render();const used=root.querySelector<HTMLElement>(`[data-action="card:${index}"]`);if(used){used.style.visibility='hidden';used.setAttribute('aria-hidden','true');}gameAudio.transition(before,after,`card:${index}`);
 if(!await motion.wait(reduced()?50:195,token))return;
 document.querySelectorAll('.card-flight').forEach(e=>e.remove());attack=false;
 const drawn=after.battle?after.battle.hand.length-(before.battle!.hand.length-1):0;
 if(drawn>0&&after.screen==='battle')await dealHand(after.battle!.hand.length-drawn,token);
 if(motion.live(token)){motion.finish();if(after.screen!=='battle')window.scrollTo(0,0);}
}
async function animateTurn(){
 const r=save.run;if(motion.busy||r?.screen!=='battle')return;
 const before=structuredClone(r),frames:TurnFrame[]=[];endTurn(r,frames);persist(before);
 const token=beginMotion();presented=before;motionLabel='상대의 행동';render();
 if(before.battle!.hand.length)void gameAudio.mixer.play('card-discard',0,'combat');
 if(!await motion.wait(reduced()?0:90,token))return;
 let previous=before;
 for(const frame of frames){
  if(!motion.live(token))return;
  presented=frame.run;enemyMotion=frame.action?frame:null;
  hpFeedback=frame.run.hp<previous.hp?'health-hit':frame.run.hp>previous.hp?'health-heal':'';
  motionLabel=frame.action?ENEMIES[frame.run.battle!.enemies[frame.enemy].id].name+' · '+frame.action.label+(frame.action.hits?' · '+frame.action.hits+'연타':'')+(frame.action.extra?' · '+effectName(frame.action.extra):''):'턴 종료 · 남은 상태 효과';
  render();
  if(frame.action){const a=frame.action;void gameAudio.mixer.play(a.type==='defend'?'block-gain':a.type==='drain'?'attack-dark':a.type==='attack'?ENEMIES[frame.run.battle!.enemies[frame.enemy].id].audioId||'hit-normal':'status-apply',0,'combat');}
  if(frame.run.hp<previous.hp)void gameAudio.mixer.play('player-hit',0,'combat');
  if(frame.action?.type==='drain')void gameAudio.mixer.play('heal',.1,'combat');
  if(!await motion.wait(reduced()?40:frame.action?350:80,token))return;
  previous=frame.run;
 }
 enemyMotion=null;hpFeedback=r.hp>previous.hp?'health-heal':'';presented=null;
 if(r.screen==='battle'){void gameAudio.mixer.play('card-draw',0,'combat');await dealHand(0,token);}
 if(motion.live(token)){motion.finish();if(r.screen!=='battle')window.scrollTo(0,0);}
}

function focusBattle(){const heading=root.querySelector<HTMLElement>('.battle-heading');if(!heading)return;heading.scrollIntoView({block:'start',behavior:'instant'});heading.querySelector<HTMLElement>('h1')?.focus({preventScroll:true});}
function status(r:Run){return `<section class="statusbar ${r.screen==='battle'?'combat-status':''}" aria-label="파트너 상태">
 <div class="status-partner">${sprite(r.form)}<strong>${FORMS[r.form].name}<small>${CHARACTERS[r.characterId].name} · ${FORMS[r.form].tag}</small></strong></div>
 <div class="health"><span>체력 <b>${r.hp}<small> / ${r.maxHp}</small></b></span>${meter(r.hp,r.maxHp)}</div>
 <div class="stat">${icon('energy')}<small>진화</small><b>${r.evoEnergy}</b></div><div class="stat">${icon('bond')}<small>유대</small><b>${r.bond}</b></div><div class="stat ${r.burden>=6?'orange':''}">${icon('burden')}<small>부담</small><b>${r.burden}</b></div><div class="stat ${r.corruption?'polluted':''}">${icon('corruption')}<small>오염</small><b>${r.corruption}</b></div>
 ${btn(`보급 ${r.supplies}<small>체력 +${RECOVERY.supply}</small>`,'supply','supply',`${r.supplies===0||r.hp===r.maxHp||!['map','battle','event','rest'].includes(r.screen)?'disabled':''}`)}${btn(`덱 ${r.deck.length}`,'deck','quiet')}${btn('귀환','retire','quiet')}</section>`;}
function map(r:Run){
 const zi=mapZone??zoneAt(r.row), rows=chapterOf(r).map.map((nodes,row)=>({nodes,row})).filter(x=>zoneAt(x.row)===zi);
 const x=(length:number,index:number)=>length===1?50:index===0?25:75;
 const lines=rows.slice(1).flatMap((item,i)=>rows[i].nodes.flatMap((from,fi)=>item.nodes.map((to,ti)=>`<path class="${r.path.includes(from.id)&&r.path.includes(to.id)?'traveled':''}" d="M ${x(rows[i].nodes.length,fi)} ${(i+.5)/rows.length*100} L ${x(item.nodes.length,ti)} ${(i+1.5)/rows.length*100}"/>`))).join('');
 return `<main class="game-content"><div class="section-heading"><div><p class="eyebrow">탐험 ${r.row+1} / 11</p><h1>${chapterOf(r).zones[zi]}</h1></div><p>${zi===zoneAt(r.row)?'다음 장소를 선택하세요.':'아직 갈 수 없는 구역 · 경로 미리보기'}</p></div><div class="map-layout"><section class="route-map">${background(chapterOf(r).backgrounds[zi],'map-landscape')}
 <div class="zone-index">${chapterOf(r).zones.map((z,i)=>`<button data-action="view-zone:${i}" class="${zi===i?'current':''}" aria-pressed="${zi===i}"><small>0${i+1}${zoneAt(r.row)===i?' · 현재':''}</small>${z}</button>`).join('')}</div>
 <div class="node-rows"><svg class="route-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${rows.map(({nodes,row})=>`<div class="node-row ${row===r.row?'current-row':''}">${nodes.map(n=>`<button class="map-node ${n.type} ${r.path.includes(n.id)?'visited':''} ${row===r.row?'available':''}" data-action="node:${n.id}" ${row!==r.row?'disabled':''}><span class="node-icon">${icon(r.path.includes(n.id)?'check':n.type)}</span><strong>${n.name}</strong><small>${row===r.row?n.note:kindName(n.type)}</small></button>`).join('')}</div>`).join('')}</div>
 <div class="journey-progress" aria-label="탐험 진행">${chapterOf(r).map.map((_,i)=>`<span class="${i<r.row?'done':i===r.row?'here':''}">${i+1}</span>`).join('')}</div><p class="route-caption">${icon('attack')} 전투 ${icon('event')} 이야기 ${icon('rest')} 휴식 ${icon('boss')} 보스</p></section>
 <aside class="partner-panel"><div class="partner-stage">${sprite(r.form)}</div><p class="eyebrow">${CHARACTERS[r.characterId].name}의 파트너</p><h2>${FORMS[r.form].name}</h2><p class="partner-quote">${r.burden>=6?'“조금 힘들어. 함께 쉬어 갈까?”':r.hp<r.maxHp*.4?'“잠깐 쉬었다 가자.”':'“어느 쪽으로 함께 갈까?”'}</p><div class="evolution-list">${evolutionOptions(r).map(e=>btn(`<small>${e.form==='skull'?'강제 진화':e.form==='gatomon-resonance'?'공명 강화':'진화'}</small><strong>${FORMS[e.form].name} →</strong><span>${e.condition}</span>`,`preview:${e.form}`,`evolve-option ${e.form==='skull'?'risky':''}`,!e.ready?'disabled':'')).join('')||'<p class="complete-form">'+icon('evolution')+' 완전체 · 전용 카드 적용 중</p>'}</div><details class="journey-log"><summary>지나온 길 · ${r.path.length}곳</summary><ol>${r.path.map(id=>`<li>${chapterOf(r).map.flat().find(n=>n.id===id)?.name||id}</li>`).join('')||'<li>이곳에서 첫 발을 내딛습니다.</li>'}</ol></details></aside></div></main>`;
}
function card(id:CardId,action:string,r:Run,disabled=false){return cardFace(id,action,r,disabled);}
function battle(r:Run){const b=r.battle!;const {incoming,recoil,damage}=turnThreat(r);const rage=bossRageBonus(b.turn);return `<main class="battle-content"><div class="battle-heading"><div><div class="eyebrow">${chapterOf(r).zones[zoneAt(r.row)]} / ${kindName(nodeOf(r)!.type)}</div><h1 tabindex="-1">${nodeOf(r)!.name}</h1></div><div class="turn-info">턴 <b>${String(b.turn).padStart(2,'0')}</b>${btn('전투 안내','help','quiet')}</div></div>${save.settings.guide&&b.turn===1?'<div class="guide-banner">① 적을 눌러 대상 선택 → ② 카드를 눌러 바로 사용 → ③ 턴 종료. 적 머리 위의 예고를 먼저 확인하세요.</div>':''}<div class="battlefield ${nodeOf(r)?.type==='boss'?'boss-field':''} ${attack?'action-flash effect-'+cardEffect:''} ${enemyActing?'enemy-action':''}">${background(nodeOf(r)?.type==='boss'&&r.chapterId==='file'?3:sceneAt(r))}${nodeOf(r)?.type==='boss'?`<div class="boss-clock">${icon('burden')} ${rage?`폭주 · 공격 +${rage}`:'폭주 전'}<span>${BOSS_RAGE.turn}턴부터 ${BOSS_RAGE.interval}턴마다 공격 +${BOSS_RAGE.damage}</span></div>`:''}<div class="data-particles" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="fighter player ${hpFeedback}"><div class="fighter-label">${FORMS[r.form].name} <span>${icon('guard')} 방어 ${b.block}</span></div>${sprite(r.form,'player-sprite')}<div class="fighter-base"></div>${partnerHealth(r)}<div class="status-tags">${playerStates(r)}${r.corruption?`<span>${icon('corruption')} 오염 ${r.corruption} · 턴 종료 체력 소모</span>`:''}${r.form==='skull'?'<span>반동 · 턴 종료 체력 -2</span>':''}</div></div><div class="enemy-group">${b.enemies.map((e,i)=>{const a=enemyMotion?.enemy===i&&enemyMotion.action?enemyMotion.action:intent(r,i);return `<button class="fighter enemy ${enemyMotion?.enemy===i?'acting-enemy intent-'+enemyMotion.action?.type:''} ${b.target===i?'targeted':''} ${attack&&cardEffect==='attack'&&(impactTarget===i||impactTarget===-1)?'hit-target':''} ${e.hp<=0?'defeated':''}" data-action="target:${i}" ${e.hp<=0?'disabled':''} aria-label="${ENEMIES[e.id].name} 대상으로 선택"><div class="intent ${a.type}">${e.hp<=0?'정화 완료':`${icon(a.type)} ${a.label} <b>${a.value}</b>${a.hits&&a.hits>1?' · '+a.hits+'연타':''}${a.extra?' · '+effectName(a.extra)+' '+a.amount:''}`}</div>${enemyMotion?.enemy===i&&enemyMotion.action?`<span class="enemy-effect" aria-hidden="true">${icon(enemyMotion.action.type)}${Array.from({length:Math.min(enemyMotion.action.hits||1,8)},(_,h)=>`<i style="--pulse-delay:${h*65}ms"></i>`).join('')}</span>`:''}${sprite(e.id)}<div class="fighter-base"></div><strong>${ENEMIES[e.id].name}</strong><div class="enemy-health"><span>${e.hp} / ${e.maxHp}</span><meter min="0" max="${e.maxHp}" value="${e.hp}" aria-label="${ENEMIES[e.id].name} 체력"></meter></div><div class="enemy-badges">${e.block?`${icon('guard')} ${e.block} `:''}${enemyStates(e)}</div><span class="target-label">${e.hp<=0?'전투 불능':b.target===i?icon('target')+' 선택한 대상':'대상 선택'}</span></button>`;}).join('')}</div></div>${crestHUD(r)}<div class="combat-anchor">${partnerHealth(r,true)}<p class="motion-status" role="status" aria-live="polite">${motionLabel}</p></div><div class="hand-toolbar"><div class="energy-orb">${b.energy}<small>에너지</small></div><div class="threat-readout ${damage>=r.hp?'lethal':''}"><small>이번 턴 예상 피해</small><strong>${damage}${damage>=r.hp?' · 쓰러질 위험':''}</strong><span>공격 ${incoming} − 방어 ${Math.min(incoming,b.block)}${recoil?` + 오염·반동 ${recoil}`:''}</span></div><div class="pile-counts">뽑기 <b>${b.draw.length}</b><span> / </span>버림 <b>${b.discard.length}</b></div>${btn('턴 종료 →','end','primary end-turn')}</div><div class="hand" aria-label="손패" aria-busy="${motion.busy}">${b.hand.map((id,i)=>{let html=card(id,`card:${i}`,r,cardStats(r,id).cost>b.energy);if(dealStart>=0&&i>=dealStart)html=html.replace('class="game-card','aria-hidden="true" inert style="--deal-delay:'+Math.min(i-dealStart,9)*75+'ms" class="game-card is-dealing');return html;}).join('')||'<p class="empty-hand">손패를 모두 사용했습니다. 턴을 종료하세요.</p>'}</div><details class="battle-log"><summary>전투 기록 · ${esc(logEntries(b.log).at(-1)?.text||'')}</summary><ol>${logEntries(b.log).map(l=>`<li value="${l.number}">${esc(l.text)}</li>`).join('')}</ol></details></main>`;}
function eventScreen(r:Run){const s=storyOf(r);return `<main class="story-screen"><div class="story-art">${background(sceneAt(r))}${storyPortrait(r)}<span class="eyebrow">${chapterOf(r).zones[zoneAt(r.row)]}</span></div><div class="story-copy"><div class="eyebrow">${icon('event')} 이야기 이벤트</div><h1>${s.title}</h1><p class="speaker">${s.speaker}</p><blockquote>${s.quote}</blockquote><p>${s.body}</p><div class="choices">${s.choices.map((c,i)=>btn(`<strong>${c.label}<span>→</span></strong><small>${c.text}</small>`,`choice:${i}`,'choice')).join('')}</div></div></main>`;}
function restScreen(r:Run){return `<main class="center-screen rest-screen">${background(sceneAt(r),'page-backdrop')}<div class="eyebrow">휴식</div><div class="camp-art">${portrait(r.characterId)}<div class="camp-partner">${sprite(r.form)}</div></div><h1 tabindex="-1">${nodeOf(r)!.name}</h1><p class="speaker">${CHARACTERS[r.characterId].name} · ${CHARACTERS[r.characterId].partner}</p><blockquote>“서로의 숨소리가 들릴 만큼, 잠깐 쉬어 가자.”</blockquote><div class="choices rest-choices">${btn(`<strong>파트너와 푹 쉰다 →</strong><small>체력 +${RECOVERY.rest} · 부담 -4 · 오염 -2 · 유대 +2</small>`,'rest:rest','choice')}${btn(`<strong>짧게 쉬고 함께 훈련한다 →</strong><small>체력 +${RECOVERY.train} · 진화 에너지 +5 · 부담 +2</small>`,'rest:train','choice')}</div></main>`;}
function rewardScreen(r:Run){return `<main class="center-screen reward-screen">${background(sceneAt(r),'page-backdrop')}<div class="eyebrow">전투 승리</div><p class="purification">${esc(r.lastVictory||'막혔던 길이 열렸습니다.')}</p><h1>어떤 기술을 기억할까?</h1><p>덱에 추가할 카드 1장을 선택하세요. 넘어가도 괜찮습니다.</p><div class="reward-summary">${icon('energy')} 진화 에너지 +${nodeOf(r)?.type==='elite'?7:5} <span>${icon('bond')} 유대 +1</span></div><div class="reward-cards">${r.rewards.map(id=>card(id,`reward:${id}`,r)).join('')}</div>${btn('카드를 받지 않고 계속 →','skip','secondary')}</main>`;}
function evolutionScreen(r:Run){return `<main class="center-screen evolution-screen ${r.form==='skull'?'forced-evolution':''}"><div class="evolution-rays"></div><div class="eyebrow">${r.form==='skull'?'강제 진화':r.form==='gatomon-resonance'?'빛의 공명':'파트너 진화'}</div><p>${FORMS[r.evolvedFrom||CHARACTERS[r.characterId].forms[0]].name}, ${r.form==='gatomon-resonance'?'빛을 모아!':'진화!'}</p><div class="evolution-chamber"><div class="data-ring ring-one"></div><div class="data-ring ring-two"></div><div class="evolution-before">${sprite(r.evolvedFrom||CHARACTERS[r.characterId].forms[0])}</div><div class="evolution-sprite">${sprite(r.form)}</div><div class="evolution-flash"></div><div class="data-particles" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div><h1>${FORMS[r.form].name}</h1><span class="form-tag">${FORMS[r.form].tag}</span><p class="evolution-effect">${FORMS[r.form].description}</p>${btn('함께 앞으로 →','evolution-done','primary large')}</main>`;}
function resultScreen(r:Run){return `<main class="center-screen result-screen ${r.won?'victory':'defeat'}">${background(r.won?0:2,'page-backdrop')}<div class="eyebrow">${r.won?'탐험 완료':'탐험 종료'}</div><div class="result-companion">${r.won?portrait(r.characterId,'ending-portrait'):''}${sprite(r.form)}<span class="result-seal">${icon(r.won?'evolution':'bond')}</span></div><h1>${r.won?'다시 이어진 목소리':'모험은 아직 끝나지 않았어'}</h1><blockquote>${r.won?CHARACTERS[r.characterId].ending:CHARACTERS[r.characterId].retry}</blockquote><p>${r.won?chapterOf(r).ending:'파트너를 데리고 안전한 곳으로 돌아왔습니다.<br/>발견한 도감과 이야기는 다음 모험에도 남습니다.'}</p><div class="result-stats"><div><b>${r.path.length}</b><span>완료한 장소</span></div><div><b>${r.battles}</b><span>전투 승리</span></div><div><b>${FORMS[r.form].name}</b><span>도달 진화체</span></div></div><p class="checkpoint">${icon('check')} 도감과 탐험 기록 저장 완료 · 다음 탐험은 선택한 파트너의 시작 덱으로 출발합니다.</p><div class="result-actions">${btn('다음 챕터 · 재도전 →','chapters','primary')}${btn('다른 아이 선택','new','secondary')}${btn('도감 보기','archive','secondary')}${btn('타이틀로','home','quiet')}</div></main>`;}
function abilityCopy(id:CharacterId){const c=CHARACTERS[id];return `<dl class="ability-copy"><dt>지속 능력</dt><dd>${c.passive}</dd><dt>${c.ability.name}</dt><dd>${c.ability.text}</dd><dt>발동 조건</dt><dd class="ability-condition">${c.ability.condition}</dd></dl>`;}
function help(){const chapter=HELP_CHAPTERS[helpChapter];return `<h2>모험 안내서</h2><div class="help-tabs" role="tablist" aria-label="도움말 책갈피">${HELP_CHAPTERS.map((ch,i)=>btn(ch.title,'help-tab:'+i,'',`id="help-tab-${i}" role="tab" aria-selected="${i===helpChapter}" aria-controls="help-panel" tabindex="${i===helpChapter?0:-1}"`)).join('')}</div><section class="help-panel" id="help-panel" role="tabpanel" aria-labelledby="help-tab-${helpChapter}" tabindex="0"><h3 aria-live="polite">${chapter.title}</h3>${chapter.items.map(([name,text])=>`<section><h3>${name}</h3><p>${text}</p></section>`).join('')}${helpChapter===1?Object.values(CHARACTERS).map(c=>`<section class="help-character"><h3>${icon(c.icon)} ${c.crest} · ${c.name}</h3>${abilityCopy(c.id)}</section>`).join(''):''}</section><p class="muted">반복 사건과 진화 조건은 팬게임의 창작 설정입니다.</p>`;}
root.addEventListener('keydown',e=>{const tab=(e.target as HTMLElement).closest('[role="tab"]');if(!tab||modal!=='help')return;const key=e.key;if(!['ArrowLeft','ArrowRight','Home','End'].includes(key))return;e.preventDefault();helpChapter=key==='Home'?0:key==='End'?2:(helpChapter+(key==='ArrowRight'?1:2))%3;render();root.querySelector<HTMLButtonElement>('#help-tab-'+helpChapter)?.focus();});
function modalContent(){const r=save.run;if(modal==='data')return dataPanel(filePreview,dataMessage,fileReading);if(modal==='data-reset')return resetPanel(dataMessage);if(modal==='ability'&&r)return abilityModal(r);if(modal==='keywords')return keywordModal();if(modal==='retire'&&r)return `<h2>안전한 곳으로 돌아갈까요?</h2><p>${CHARACTERS[r.characterId].retry}</p>${btn('탐험을 마치고 돌아가기','retire-confirm','danger wide')}`;if(modal==='help')return help();if(modal==='new')return `<h2>새 탐험을 시작할까요?</h2><p>새 캐릭터와 챕터를 확정하면 현재 탐험이 교체됩니다. 도감과 설정은 유지됩니다.</p>${btn('새 탐험 시작','confirm-new','primary wide')}${btn('현재 탐험 유지','close','quiet wide')}`;
 if(modal==='credits')return `<h2>게임 정보 · 크레딧</h2><p>개발자와 지인 1–2명이 함께 테스트하는 소규모 비영리 팬 프로토타입입니다.</p><p lang="en">Unofficial, non-commercial fan project.<br/>This project is not affiliated with or endorsed by Bandai, Toei Animation, or any related rights holder.<br/>Third-party names and characters belong to their respective rights holders.</p><p>반다이, 토에이 애니메이션 및 관련 권리자와 제휴하거나 승인을 받은 프로젝트가 아닙니다. 제3자의 이름과 캐릭터에 관한 권리는 각 권리자에게 있습니다.</p><h3>제작</h3><p>캐릭터·배경·초상화는 이 프로젝트를 위해 이미지 생성 도구로 새로 제작한 팬메이드 일러스트입니다. UI 아이콘과 효과는 SVG·CSS로 직접 작성했습니다. 제작 요청문과 출처는 저장소의 assets/ATTRIBUTION.md에 기록했습니다. 음악과 효과음은 원본 악보와 로컬 신시사이저로 직접 제작했습니다. 공식 음악을 사용하거나 모방하지 않았으며 제작 방식은 AUDIO.md에 기록했습니다. 재생은 Web Audio 믹서를 사용하고, 한국어 제목은 Galmuri 11 Bold, 본문과 수치는 Pretendard를 사용합니다. 두 서체는 SIL OFL 1.1 라이선스의 로컬 웹폰트이며 출처와 라이선스는 TYPOGRAPHY.md 및 assets/fonts에 기록했습니다. 영상 캡처, 게임 추출 스프라이트, 공식 로고·음원은 사용하지 않았습니다.</p><h3>이 모험에 대하여</h3><p>1999년 「디지몬 어드벤처」를 바탕으로 합니다. 반복 현상, 독립 사건과 진화 조건은 팬게임을 위한 창작 설정입니다.</p><h3>공유와 저장</h3><p>공개 URL은 누구나 열 수 있습니다. 검색 제외 요청은 접근 통제가 아닙니다. 광고, 후원, 결제, 분석 도구와 사용자 추적 기능은 없습니다. 게임 기록은 이 브라우저에만 저장됩니다.</p>`;
 if(modal==='settings')return `<h2>디지바이스 설정</h2><section class="audio-settings"><h3>모험의 소리</h3><div class="setting-row"><div><b>전체 음소거</b><p>음악과 효과음을 함께 제어합니다.</p></div>${btn(save.settings.muted?'음소거 중':'소리 켜짐','sound','toggle',`aria-pressed="${save.settings.muted}"`)}</div>${(['masterVolume','musicVolume','sfxVolume'] as const).map((key,i)=>`<label class="volume-control" for="audio-${key}"><span>${['전체 음량','음악 음량','효과음 음량'][i]}</span><output for="audio-${key}" data-volume-output="${key}">${Math.round(save.settings[key]*100)}%</output><input id="audio-${key}" data-volume="${key}" type="range" min="0" max="100" step="1" value="${Math.round(save.settings[key]*100)}" aria-valuetext="${Math.round(save.settings[key]*100)}퍼센트"></label>`).join('')}${btn('효과음 미리 듣기','audio-test','secondary wide')}<p class="audio-status" data-audio-status></p><meter class="audio-level" min="0" max="0.15" value="0" aria-label="소리 출력 수준"></meter><p class="muted">음악은 첫 입력 후 시작합니다. 다른 탭을 보는 동안 멈추며 돌아오면 이어집니다.</p></section><div class="setting-row"><div><b>움직임 줄이기</b><p>부유 효과와 진화 애니메이션 끄기</p></div>${btn(save.settings.reducedMotion?'켜짐':'꺼짐','motion','toggle',`aria-pressed="${save.settings.reducedMotion}"`)}</div><div class="setting-row"><div><b>첫 턴 안내</b><p>다음 탐험에서도 표시할 수 있어요</p></div>${btn(save.settings.guide?'켜짐':'꺼짐','guide','toggle',`aria-pressed="${save.settings.guide}"`)}</div><p>설정과 기록은 이 브라우저에 저장됩니다.</p>${btn('데이터 관리 · 백업과 복원','data','secondary wide')}`;
 if(modal==='archive')return archiveScreen(); if(modal==='deck'&&r)return `<h2>파트너 덱 · ${r.deck.length}장</h2><p>진화로 바뀐 카드는 다음 전투부터 사용됩니다.</p><div class="deck-list">${[...new Set(r.deck)].map(id=>`<div><span class="cost">${CARDS[id].cost}</span><div><b>${CARDS[id].name} × ${r.deck.filter(c=>c===id).length}</b><p>${CARDS[id].text}</p></div></div>`).join('')}</div>`;
 if(modal==='evo'&&r&&pendingForm){const f=FORMS[pendingForm],o=evolutionOptions(r).find(e=>e.form===pendingForm)!;return `<div class="eyebrow">${pendingForm==='skull'?icon('burden')+' 강제 진화 경고':'진화 미리보기'}</div><h2>${f.name}${pendingForm==='gatomon-resonance'?'으로 강화':'으로 진화'}</h2><div class="modal-sprite">${sprite(pendingForm)}</div><p>${f.description}</p>${pendingForm==='skull'?'<div class="danger-note"><b>이 진화는 이번 탐험 동안 되돌릴 수 없습니다.</b><p>매 턴 종료 체력 2 소모. 전용 공격은 추가로 체력 5를 소모합니다. 자기 손상으로 패배할 수 있으며 메탈그레이몬 경로를 선택할 수 없게 됩니다.</p></div>':''}<p>비용: 진화 에너지 ${o.cost} · 현재 ${r.evoEnergy}<br/>진화 후 에너지 ${r.evoEnergy-o.cost} · 최대 체력 ${f.hp}</p><p class="muted">팬게임용 진화 조건이며 공식 진화 규칙이 아닙니다.</p>${btn(pendingForm==='skull'?'위험을 이해하고 강제 진화':pendingForm==='gatomon-resonance'?'빛의 공명 시작':'파트너와 함께 진화','evolve',pendingForm==='skull'?'danger wide':'primary wide')}${btn('아직은 기다린다','close','quiet wide')}`;}return '';}
function render(){
 const r=presented||save.run;
 gameAudio.mixer.configure(save.settings);gameAudio.sync(view,modal,r,mapZone);
 const focusedAction=(document.activeElement as HTMLElement|null)?.dataset.action;
 const handScroll=root.querySelector('.hand')?.scrollLeft||0;
 const oldLog=root.querySelector<HTMLDetailsElement>('.battle-log'),oldList=oldLog?.querySelector('ol');
 const logOpen=oldLog?.open,logTop=oldList?.scrollTop||0,followLog=!oldList||oldList.scrollHeight-oldList.clientHeight-oldList.scrollTop<20;
 document.body.classList.toggle('reduced-motion',reduced());
 root.innerHTML=header()+(warning?`<div class="save-warning" role="status">${warning}</div>`:'')+
  (view==='select'?selection():view==='detail'?detail():view==='chapters'?chapters():view==='title'||!r?title():status(r)+({intro:introScreen,map:map,battle:battle,event:eventScreen,rest:restScreen,reward:rewardScreen,evolution:evolutionScreen,result:resultScreen}[r.screen])(r))+
  `<footer class="game-footer"><p>디지몬: 우리들의 모험 · v${APP_VERSION}<br/>비공식 · 비영리 팬 프로젝트</p>${btn('정보 · 크레딧','credits','quiet')}</footer>`+
  (notice?`<div class="toast" role="status">${esc(notice)}</div>`:'')+
  (modal?`<dialog aria-label="${modal==='evo'?'진화 미리보기':modal.startsWith('data')?'저장 데이터 관리':'게임 메뉴'}"><div class="dialog-top">${btn(icon('close'),'close','close-button','aria-label="닫기"')}</div>${modalContent()}</dialog>`:'');
 if(modal){
  const dialog=root.querySelector('dialog')!;
  dialog.showModal();
  dialog.addEventListener('cancel',e=>{e.preventDefault();cancelFileRead();gameAudio.action('close');modal='';render();});
 }
 const scope=modal?root.querySelector('dialog')!:root;
 const nextFocus=Array.from(scope.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')).find(b=>b.dataset.action===focusedAction);
 if(nextFocus)nextFocus.focus({preventScroll:true});
 else if(focusedAction?.startsWith('card:'))root.querySelector<HTMLButtonElement>('[data-action="end"]')?.focus({preventScroll:true});
 const hand=root.querySelector('.hand');if(hand)hand.scrollLeft=handScroll;
 const newLog=root.querySelector<HTMLDetailsElement>('.battle-log'),newList=newLog?.querySelector('ol');if(newLog&&logOpen)newLog.open=true;if(newList)newList.scrollTop=followLog?newList.scrollHeight:logTop;
 root.dataset.combatBusy=String(motion.busy);
 if(motion.busy)root.querySelectorAll<HTMLButtonElement>('.hand button,[data-action="end"],[data-action="supply"],[data-action="crest"],.enemy').forEach(b=>b.disabled=true);
 updateAudioStatus();
}
function start(ch:ChapterId){if(!chapterUnlocked(save,selected,ch))return;mapZone=null;save.run=newRun(Date.now()>>>0,selected,ch);view='game';modal='';persist(null);render();window.scrollTo(0,0);}
root.addEventListener('click',e=>{const el=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');if(!el)return;if(el.disabled)return;const [action,value]=el.dataset.action!.split(':');currentAction=el.dataset.action!;
 if(motion.busy){if(['card','end','target','supply','crest','retain','crest-mode','order-confirm'].includes(action))return;motion.finish();}
 if(handleDataAction(action))return;
 if(action==='help-tab'){helpChapter=Math.max(0,Math.min(2,Number(value)));render();root.querySelector<HTMLButtonElement>('#help-tab-'+helpChapter)?.focus();return;}
 if(action==='audio-test'){void gameAudio.mixer.unlock().then(()=>gameAudio.mixer.preview());return;}
 if(extraAction(action,value))return;
 if(action==='close'){cancelFileRead();modal='';render();return;}if(action==='home'){view='title';modal='';render();return;}if(action==='new'){if(save.run&&save.run.screen!=='result'){modal='new';render();}else{view='select';render();}return;}if(action==='confirm-new'){modal='';view='select';render();return;}if(action==='continue'){mapZone=null;view='game';render();if(save.run?.screen==='battle'){void dealHand(0);focusBattle();}return;}
 if(['settings','archive','deck','help','credits'].includes(action)){modal=action;render();return;}
 if(['sound','motion','guide'].includes(action)){const k=action==='sound'?'muted':action==='motion'?'reducedMotion':'guide';save.settings[k]=!save.settings[k];persist(save.run);gameAudio.mixer.configure(save.settings);if(k==='muted'&&!save.settings.muted)gameAudio.mixer.playInput('ui-confirm');render();return;}
 if(action==='preview'){pendingForm=value as Form;modal='evo';render();return;}
 if(action==='evolve'){modal='';act(r=>{if(pendingForm)evolve(r,pendingForm);});window.scrollTo(0,0);return;}
 if(action==='evolution-done'){act(r=>{if(r.screen==='evolution')r.screen='map';});return;}
 if(action==='view-zone'){if(['0','1','2'].includes(value)){mapZone=+value;render();}return;}
 if(action==='node'){mapZone=null;act(r=>enterNode(r,value));window.scrollTo(0,0);if(save.run?.screen==='battle'){void dealHand(0);focusBattle();}return;}
 if(action==='target'){act(r=>{if(r.screen==='battle'&&r.battle&&(r.battle.enemies[+value]?.hp??0)>0)r.battle.target=+value;});return;}
 if(action==='card'){void animateCard(+value);return;}
 if(action==='end'){void animateTurn();return;}if(action==='supply'){const old=save.run?.supplies;act(useSupply);if(old!==save.run?.supplies){notice=`보급품으로 체력을 ${RECOVERY.supply} 회복했습니다.`;render();setTimeout(()=>{notice='';root.querySelector('.toast')?.remove();},2200);}return;}
 if(action==='choice'){act(r=>chooseEvent(r,+value));window.scrollTo(0,0);return;}if(action==='rest'){act(r=>rest(r,value as 'rest'|'train'));window.scrollTo(0,0);return;}if(action==='reward'||action==='skip'){act(r=>reward(r,action==='skip'?undefined:value as CardId));window.scrollTo(0,0);}
});
render();
function selection(){return `<main class="selection-screen"><div class="section-heading"><div><p class="eyebrow">새 탐험 · 8명의 선택받은 아이</p><h1>누구와 함께 떠날까?</h1></div>${btn('타이틀로','home','quiet')}</div><p>어떤 캐릭터로 플레이할지 골라 보세요. 파트너 디지몬과 문장에 따라 플레이 스타일이 달라집니다.</p><div class="character-grid">${Object.values(CHARACTERS).map(c=>`<article class="character-card" style="--character-accent:${c.color}">${portrait(c.id)}<div class="character-copy"><small>${icon(c.icon)} ${c.crest}의 문장 · ${c.difficulty}</small><h2>${c.name} <span>/ ${c.partner}</span></h2><p>${c.style}</p><p class="keywords">${c.keywords.join(' · ')}</p><details><summary>지속 능력 · 문장 능력</summary>${abilityCopy(c.id)}</details><small class="form-line">${c.forms.map(id=>FORMS[id].name).join(' → ')}</small>${btn('전투 방식 확인 →','select:'+c.id,'primary wide')}<span class="character-progress">완료 ${save.archive.clears[c.id]?.length||0} / 3 챕터</span></div></article>`).join('')}</div></main>`;}
function detail(){const c=CHARACTERS[selected];return `<main class="character-detail"><div class="detail-art">${portrait(c.id)}</div><section><p class="eyebrow">${icon(c.icon)} ${c.crest}의 문장 · ${c.difficulty}</p><h1>${c.name} <small>/ ${c.partner}</small></h1><p class="lead">${c.style}</p>${abilityCopy(c.id)}${c.ability.modes?.map(m=>`<p><b>${m.name}</b> — ${m.text}</p>`).join('')||''}<h2>파트너의 성장</h2><p>${c.forms.map(id=>FORMS[id].name).join(' → ')}</p>${selected==='tai'?'<p>높은 부담에서는 위험을 확인한 뒤 스컬그레이몬 강제 진화를 선택할 수 있습니다.</p>':''}${selected==='kari'?'<p>가트몬은 성숙기로 시작합니다. 빛의 공명은 같은 종의 카드·능력 강화이며 새로운 진화체가 아닙니다.</p>':''}<h2>시작 덱 · 10장</h2><div class="deck-list">${[...new Set(c.startDeck)].map(id=>`<div><span class="cost">${CARDS[id].cost}</span><div><b>${CARDS[id].name} ×${c.startDeck.filter(v=>v===id).length}</b><p>${CARDS[id].text}</p></div></div>`).join('')}</div><h2>전용 획득 카드 6종</h2><p>${c.exclusive.map(id=>CARDS[id].name).join(' · ')}</p><div class="detail-actions">${btn('이 파트너와 챕터 선택 →','chapters','primary')}${btn('다시 고르기','selection','quiet')}${btn('키워드 설명','keywords','quiet')}</div></section></main>`;}
function chapters(){const c=CHARACTERS[selected];return `<main class="chapter-screen"><p class="eyebrow">${icon(c.icon)} ${c.name} · ${c.partner}</p><h1>오늘은 어디까지 갈까?</h1><p>각 챕터는 시작 덱과 기본 파트너로 새로 출발합니다. 이전 챕터를 끝내면 다음 장소가 열립니다.</p><div class="chapter-grid">${Object.values(CHAPTERS).map(ch=>`<article class="chapter-card">${background(ch.backgrounds[0])}<div><p class="eyebrow">${ch.subtitle}</p><h2>${ch.name}</h2><p>${ch.intro}</p><small>보스 ${ENEMIES[ch.boss].name} · 11곳 · 전투 5회</small>${btn(save.archive.clears[selected]?.includes(ch.id)?'다시 탐험 →':chapterUnlocked(save,selected,ch.id)?'이곳으로 출발 →':'앞 챕터를 먼저 완료하세요','begin:'+ch.id,'primary wide',chapterUnlocked(save,selected,ch.id)?'':'disabled')}</div></article>`).join('')}</div><p class="future-chapter">다음 여정: 어둠의 사천왕 · 아직 제작되지 않은 챕터입니다.</p>${save.run&&save.run.screen!=='result'?'<p class="save-warning">출발을 누르면 현재 진행 중인 탐험이 새 탐험으로 교체됩니다. 도감과 설정은 유지됩니다.</p>':''}${btn('캐릭터 선택으로','selection','quiet')}</main>`;}
function introScreen(r:Run){const c=CHARACTERS[r.characterId];return `<main class="story-screen intro-story"><div class="story-art">${background(sceneAt(r))}${portrait(c.id)}</div><div class="story-copy"><p class="eyebrow">${icon(c.icon)} ${chapterOf(r).subtitle} · ${c.crest}</p><h1>${c.name}의 이야기</h1><blockquote>${c.intro}</blockquote><p>${chapterOf(r).intro}</p><p class="muted">반복 사건과 데이터 이상은 팬게임의 독립 시나리오입니다.</p>${btn('파트너와 첫걸음 →','intro-done','primary large')}${save.settings.guide?btn('전투 안내 보기','help','quiet'):''}</div></main>`;}
function effectName(s:string){return ({attack:'공격',defend:'방어',drain:'흡수',corrupt:'오염',burn:'화상',tax:'다음 카드 비용 +1',weaken:'약화',seal:'문장 봉인',charge:'공격 강화',curse:'저주·오염',shuffle:'손패 교란',summon:'소환'} as Record<string,string>)[s]||s;}
function enemyStates(e:NonNullable<Run['battle']>['enemies'][number]){return (['weak','burn','root','shock','exposed','mark','power'] as const).filter(k=>e[k]>0).map(k=>`${({weak:'약화',burn:'화상',root:'속박',shock:'감전',exposed:'노출',mark:'표식',power:'강화'})[k]} ${e[k]}`).join(' · ');}
function playerStates(r:Run){const s=r.battle!.ability;return (['weak','burn','tax','sealed'] as const).filter(k=>s[k]>0).map(k=>`<span>${({weak:'약화',burn:'화상',tax:'추가 비용',sealed:'문장 봉인'})[k]} ${s[k]}</span>`).join('');}
function crestHUD(r:Run){const c=CHARACTERS[r.characterId],s=r.battle!.ability;return `<section class="crest-hud" style="--character-accent:${c.color}" aria-label="문장 능력"><div class="crest-symbol">${icon(c.icon)}</div><div class="crest-readout"><strong>${c.name} · ${c.crest}</strong><small>${s.crestUsed?'이번 전투 사용 완료':s.sealed?'봉인 중 · '+s.sealed+'턴':crestReady(r)?'사용 가능':c.ability.condition}</small><span>${(['combo','growth','stock','hope','light','regen','thorns'] as const).filter(k=>s[k]>0).map(k=>({combo:'연계',growth:'개화',stock:'비축',hope:'희망',light:'빛',regen:'재생',thorns:'반격'})[k]+' '+s[k]).join(' · ')||'중첩 없음'}${s.lastStand?' · 치명 피해 보호 대기':''}${s.crestBuff?' · 공격 +'+s.crestBuff:''}</span></div>${btn(icon(c.icon)+c.ability.name,'crest','crest-button',crestReady(r)?'':'disabled')}${btn('능력 · 적 분석','ability','quiet')}</section>`;}
function abilityModal(r:Run){const c=CHARACTERS[r.characterId],b=r.battle!;return `<h2>${icon(c.icon)} ${c.crest} · ${c.name}</h2>${abilityCopy(c.id)}${r.characterId==='matt'&&crestReady(r)?`<h3>다음 턴에 받을 카드 선택</h3><p>지금 손패에서 빠집니다. 다음 턴 새 카드 4장과 함께 받습니다.</p>${b.hand.map((id,i)=>btn(CARDS[id].name,'retain:'+i,'choice wide')).join('')}`:''}${r.characterId==='koushiro'&&crestReady(r)?`<h3>뽑을 순서 선택</h3><p>첫 번째로 누른 카드가 다음에 뽑힙니다.</p>${b.draw.slice(-3).reverse().map((id,i)=>btn(`${order.includes(i)?(order.indexOf(i)+1)+'. ':''}${CARDS[id].name}`,'order:'+i,'choice wide',order.includes(i)?'disabled':'')).join('')}${btn('이 순서로 문장 사용','order-confirm','primary wide',order.length===Math.min(3,b.draw.length)?'':'disabled')}${btn('순서 다시 선택','order-reset','quiet')}`:''}${c.ability.modes&&crestReady(r)?c.ability.modes.map(m=>btn(`<b>${m.name}</b><small>${m.text}</small>`,'crest-mode:'+m.id,'choice wide')).join(''):''}<h3>적 상세 분석</h3>${b.enemies.filter(e=>e.hp>0).map(e=>{const i=b.enemies.indexOf(e),a=intent(r,i),next=intent(r,i,1),def=ENEMIES[e.id];return `<div class="enemy-analysis"><b>${def.name}</b><p>${def.feature}</p><p>현재: ${a.label} ${a.value}${a.extra?' + '+effectName(a.extra)+' '+a.amount:''}</p>${r.characterId==='koushiro'?`<p>다음: ${next.label} ${next.value} · 현재 상태 기준 예상</p>`:''}<small>저항: 화상 ${def.resist.burn}% · 약화 ${def.resist.weak}% · 속박 ${def.resist.root}% (적용 중첩 올림)<br/>${def.purifiable?'오염 해제 대상':'적대 데이터 · 격퇴 대상'}</small></div>`;}).join('')}`;}
function keywordModal(){return `<h2>전투 키워드</h2><dl class="keyword-list">${Object.entries(KEYWORDS).map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><p>피해 수치에는 현재 진화·연계 효과가 반영됩니다. 노출·표식은 대상에게 남아 있는 만큼 첫 피해에 추가됩니다. 정화는 오염·화상·약화를 각각 표시 수치만큼 제거합니다.</p>`;}
function storyPortrait(r:Run){const s=storyOf(r);return s.npc?`<div class="npc-pair">${s.npc.map(id=>sprite(id)).join('')}</div>`:portrait(s.portrait||r.characterId);}
function archiveScreen(){const a=save.archive;return `<p class="eyebrow">모험 도감</p><h2>여덟 갈래의 기록</h2><p>탐험 종료 ${a.runs}회 · 클리어 ${a.wins}회</p><h3>캐릭터별 진행</h3><div class="progress-list">${Object.values(CHARACTERS).map(c=>`<div>${portrait(c.id,'archive-portrait')}${icon(c.icon)}<strong>${c.name} · ${c.partner}</strong><span>${Object.values(CHAPTERS).map(ch=>(a.clears[c.id]?.includes(ch.id)?'완료':'미완료')+' '+ch.subtitle.slice(0,2)).join(' / ')}</span>${a.endings.filter(k=>k.startsWith(c.id+':')).length?`<details><summary>엔딩 기록</summary><p>${c.ending}</p></details>`:''}</div>`).join('')}</div><h3>발견한 진화 · ${a.forms.length} / ${Object.keys(FORMS).length}</h3><div class="archive-grid">${Object.entries(FORMS).map(([id,f])=>`<div class="archive-item ${a.forms.includes(id)?'':'locked'}">${a.forms.includes(id)?sprite(id):icon('data')}<strong>${a.forms.includes(id)?f.name:'미발견'}</strong><small>${CHARACTERS[f.owner].name} · ${a.forms.includes(id)?f.tag:'???'}</small></div>`).join('')}</div><h3>만난 적 · ${a.enemies.length} / ${Object.keys(ENEMIES).length}</h3><div class="archive-enemies">${Object.entries(ENEMIES).map(([id,e])=>`<div class="archive-enemy">${a.enemies.includes(id)?sprite(id):icon('data')}<div><strong>${a.enemies.includes(id)?e.name:'미발견 디지몬'}</strong><p>${a.enemies.includes(id)?e.description:'탐험에서 만나면 기록됩니다.'}</p>${a.enemies.includes(id)?`<small>${e.regions.join(' · ')} / ${e.rank==='boss'?'보스':e.rank==='elite'?'강적':'일반'} / 체력 ${e.hp}<br/>${e.purifiable?'오염 해제 대상':'적대 데이터'}</small>`:''}</div></div>`).join('')}</div><h3>길에서 만난 안내자</h3>${Object.values(NPCS).map(n=>`<p><b>${n.name}</b> — ${n.text}</p>`).join('')}<h3>발견한 이야기 · ${a.events.length}</h3>${a.events.map(id=>`<details><summary>${STORIES[id]?.title||id}</summary><p>${STORIES[id]?.quote||''}</p></details>`).join('')||'<p>파트너의 목소리를 따라가 보세요.</p>'}`;}
function extraAction(action:string,value:string){if(action==='selection'){view='select';modal='';render();return true;}if(action==='select'&&Object.hasOwn(CHARACTERS,value)){selected=value as CharacterId;view='detail';render();window.scrollTo(0,0);return true;}if(action==='chapters'){if(view==='game'&&save.run)selected=save.run.characterId;view='chapters';modal='';render();window.scrollTo(0,0);return true;}if(action==='begin'&&Object.hasOwn(CHAPTERS,value)){start(value as ChapterId);return true;}if(action==='intro-done'){act(r=>{if(r.screen==='intro')r.screen='map';});return true;}if(['ability','keywords','retire'].includes(action)){modal=action;order=[];render();return true;}if(action==='retire-confirm'){modal='';act(retire);return true;}if(action==='crest'){const r=save.run;if(r&&crestReady(r)){if(['matt','koushiro','tk','kari'].includes(r.characterId)){order=[];modal='ability';render();}else act(r=>crest(r));}return true;}if(action==='retain'||action==='crest-mode'){act(r=>{if(crest(r,action==='retain'?+value:value))modal='';});return true;}if(action==='order'){if(!order.includes(+value))order.push(+value);render();return true;}if(action==='order-reset'){order=[];render();return true;}if(action==='order-confirm'){act(r=>{if(crest(r,order))modal='';});return true;}return false;}

function updateAudioStatus(){
 const state=gameAudio.mixer.status,node=root.querySelector<HTMLElement>('[data-audio-status]');
 root.dataset.audioContext=state.context;root.dataset.audioTrack=state.playing;root.dataset.audioVoices=String(state.voices);root.dataset.audioCue=state.lastCue;root.dataset.audioMusicStarts=String(state.musicStarts);
 if(!node)return;
 node.textContent=save.settings.muted?'음소거 중':state.context==='locked'?'소리를 켜거나 미리 듣기를 눌러 주세요.':state.context==='suspended'?'잠시 멈춤':state.loading?'음악을 준비하고 있어요.':state.playing?'재생 중 · '+AUDIO[state.playing]?.label:'음악이 쉬어 가는 중';
 if(state.failed)node.textContent+=' · 일부 소리를 불러오지 못했습니다. 게임은 계속할 수 있어요.';
 node.dataset.context=state.context;node.dataset.voices=String(state.voices);node.dataset.musicVoices=String(state.musicVoices);node.dataset.track=state.playing;node.dataset.level=String(state.level);const meter=root.querySelector<HTMLMeterElement>(".audio-level");if(meter)meter.value=state.level;
}
gameAudio.mixer.onStatus=updateAudioStatus;
root.addEventListener('input',e=>{
 const input=e.target as HTMLInputElement,key=input.dataset.volume;
 if(!['masterVolume','musicVolume','sfxVolume'].includes(key||''))return;
 const n=Math.max(0,Math.min(100,Number(input.value)));save.settings[key as 'masterVolume']=n/100;
 input.setAttribute('aria-valuetext',n+'퍼센트');const out=root.querySelector(`[data-volume-output="${key}"]`);if(out)out.textContent=n+'%';
 gameAudio.mixer.configure(save.settings);void gameAudio.mixer.unlock();persist(save.run);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)motion.finish();void gameAudio.mixer.visibility(document.hidden);});
prefersMotion.addEventListener('change',()=>{motion.finish();render();});
window.addEventListener('pagehide',()=>{motion.finish();void gameAudio.mixer.visibility(true);});
window.addEventListener('pageshow',()=>void gameAudio.mixer.visibility(document.hidden));

setInterval(()=>{if(modal==="settings"&&!document.hidden)updateAudioStatus();},250);

function cancelFileRead(){fileRequest++;fileReading=false;filePreview=null;}
function applyFileState(next:typeof save,message:string){
 motion.finish();cancelFileRead();gameAudio.resetScene();Object.assign(save,next);warning='';view='title';modal='';mapZone=null;selected='tai';order=[];pendingForm=null;attack=false;enemyActing=false;dataMessage=message;notice=message;render();window.scrollTo(0,0);
}
function handleDataAction(action:string){
 if(action==='data'){cancelFileRead();modal='data';render();return true;}
 if(action==='save-export'){
  let url='';try{const file=exportSave(save);url=URL.createObjectURL(new Blob([file.text],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=file.filename;document.body.append(a);a.click();a.remove();dataMessage='다운로드를 요청했습니다. 기기의 다운로드 폴더에서 JSON 파일을 확인하세요.';}catch{dataMessage='저장 파일을 내보내지 못했습니다. 현재 기록은 유지됩니다.';}finally{if(url)setTimeout(()=>URL.revokeObjectURL(url),1000);}render();return true;
 }
 if(action==='save-import-cancel'){cancelFileRead();dataMessage='불러오기를 취소했습니다. 현재 기록은 유지됩니다.';render();return true;}
 if(action==='save-import-confirm'){
  if(!filePreview)return true;
  if(!replaceSave(filePreview)){dataMessage='저장 공간에 기록하지 못했습니다. 현재 기록은 유지됩니다.';render();return true;}
  const next=filePreview.save;applyFileState(next,next.run&&next.run.screen!=='result'?'저장 파일을 불러왔습니다. 이어하기에서 모험을 계속할 수 있습니다.':'저장 파일의 도감과 설정을 불러왔습니다. 새 탐험을 시작할 수 있습니다.');return true;
 }
 if(action==='save-reset'){cancelFileRead();dataMessage='';modal='data-reset';render();return true;}
 if(action==='save-reset-confirm'){
  if(!resetSave()){dataMessage='초기화하지 못했습니다. 현재 화면의 기록은 유지됩니다. 백업 후 다시 시도하세요.';render();return true;}
  applyFileState(freshSave(),'모든 게임 기록을 초기화했습니다.');return true;
 }
 return false;
}
root.addEventListener('change',async e=>{
 const input=e.target as HTMLInputElement;if(input.id!=='save-import')return;
 const file=input.files?.[0];cancelFileRead();if(!file){render();return;}
 const request=fileRequest;fileReading=true;dataMessage='저장 파일을 확인하고 있습니다.';render();
 try{
  if(file.size>MAX_SAVE_BYTES)throw new Error('저장 파일은 1MB 이하만 불러올 수 있습니다.');
  if(!file.name.toLowerCase().endsWith('.json'))throw new Error('JSON 파일을 선택하세요.');
  const text=await file.text();if(request!==fileRequest||modal!=='data')return;
  filePreview=prepareImport(text,file.size);dataMessage='파일 확인 완료. 아래 내용을 확인한 뒤 교체 여부를 선택하세요.';
 }catch(error){if(request!==fileRequest||modal!=='data')return;dataMessage=error instanceof Error?error.message:'파일을 읽지 못했습니다. 현재 기록은 유지됩니다.';}
 finally{if(request===fileRequest&&modal==='data'){fileReading=false;render();}}
});
