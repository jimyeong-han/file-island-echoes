import type {ChapterDefinition,ChapterId,MapNode,Run} from '../types';
import {ENEMIES} from './enemies';
const fight=(id:string,name:string,pool:string[][],type:MapNode['type']='battle'):MapNode=>({id,name,type,pool,note:[...new Set(pool.flat())].map(id=>ENEMIES[id].name).join(' · ')+(type==='elite'?' / 강적 보상':' 중 조우')});
const event=(id:string,name:string,event:string):MapNode=>({id,name,event,type:'event',note:event.startsWith('personal')?'파트너와의 이야기':'이야기와 선택'});
const camp=(id:string):MapNode=>({id,name:'잠시 머무는 쉼터',type:'rest',note:'체력 · 부담 회복 또는 훈련'});
function route(ch:ChapterId,boss:string):MapNode[][] {
 const pools:Record<ChapterId,string[][][]>={file:[[['kuwaga'],['shellmon'],['elec']],[['seadramon'],['meramon'],['monochromon'],['unimon']],[['nume','elec'],['frigimon'],['centarumon'],['bakemon']],[['mojyamon'],['unimon','elec']]],server:[[['gazimon'],['kuwaga']],[['cockatrimon'],['monochromon'],['meramon']],[['gazimon','demi-devimon'],['centarumon']],[['cockatrimon','gazimon']]],city:[[['bakemon'],['demi-devimon']],[['raremon'],['dark-tyrannomon']],[['bakemon','demi-devimon'],['raremon']],[['dark-tyrannomon','demi-devimon']]]};
 const p=pools[ch],elites=ch==='city'?[['phantomon']]:[['andromon'],['ogre'],['leomon']];
 return [[fight('0a','흔들리는 첫 신호',p[0])],[event('1a','둘이 고르는 첫걸음','personal:1')],[fight('2a','물결치는 데이터',p[1]),fight('2b','위험한 경계',p[1].slice().reverse())],[camp('3a'),event('3b','길을 아는 친구들',ch==='city'?'teacher':'scavengers')],[fight('4a','반복되는 길목',p[2]),fight('4b','무거운 발소리',elites,'elite')],[event('5a','쉽지 않은 대답','personal:2')],[event('6a','남겨 두고 싶은 마음','personal:3')],[camp('7a'),event('7b','멀리서 온 안내',ch==='city'?'teacher':'whale')],[fight('8a','마지막 능선',p[3]),fight('8b','닫힌 길의 수호자',elites,'elite')],[event('9a','문 앞의 약속','preboss')],[{id:'10a',name:ch==='file'?'무한산 정상':ch==='server'?'뒤틀린 콘서트장':'어둠에 잠긴 도시',type:'boss',note:'챕터 보스',enemies:[boss]}]];
}
export const CHAPTERS:Record<ChapterId,ChapterDefinition>={
 file:{id:'file',name:'파일섬과 검은 톱니바퀴',subtitle:'01 · 되돌아오는 발자국',boss:'devimon',previous:null,zones:['파일섬의 숲','버려진 공장','무한산'],backgrounds:[0,1,2],intro:'파일섬에서 이미 지나온 길이 불완전하게 반복됩니다. 친구들의 흔적을 따라 무한산의 신호를 찾아갑니다.',ending:'검은 톱니바퀴가 멈추고 파일섬의 신호가 안정되었습니다. 바다 건너 서버대륙에서 새로운 메아리가 들립니다.',map:route('file','devimon')},
 server:{id:'server',name:'서버대륙의 데이터 이상',subtitle:'02 · 지워지지 않는 소음',boss:'etemon',previous:'file',zones:['사막의 신호탑','폐쇄된 통신소','뒤틀린 공연장'],backgrounds:[4,1,4],intro:'서버대륙의 노랫소리가 서로의 목소리를 덮습니다. 반복되는 방송을 끊고 친구가 보낸 진짜 신호를 찾아야 합니다.',ending:'왜곡된 방송이 끝나고 각자의 목소리가 돌아왔습니다. 현실 세계의 경계에 어두운 신호가 남아 있습니다.',map:route('server','etemon')},
 city:{id:'city',name:'현실 세계의 어둠',subtitle:'03 · 돌아갈 곳의 불빛',boss:'myotismon',previous:'server',zones:['낯익은 거리','안개 낀 부두','새벽을 기다리는 탑'],backgrounds:[5,5,5],intro:'익숙한 거리의 불빛이 잘못된 기억처럼 깜박입니다. 이 사건도 과거의 재현이 아닌 손상된 데이터의 메아리입니다.',ending:'묘티스몬의 어둠이 물러나고 도시가 새벽을 맞습니다. 지금 열려 있는 세 구역이 안정을 되찾았습니다.',map:route('city','myotismon')},
};
export const chapterOf=(r:Run)=>CHAPTERS[r.chapterId];
export const zoneAt=(row:number)=>Math.min(2,Math.floor(row/4));
export const sceneAt=(r:Run)=>chapterOf(r).backgrounds[zoneAt(r.row)];
