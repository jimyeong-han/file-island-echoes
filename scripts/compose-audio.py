"""Original score and sound design for File Island Echoes. No samples or reference music.
Reproduce: pip install numpy scipy imageio-ffmpeg; python scripts/compose-audio.py
The local QA-only tools directory is optional; no tools or WAV masters are deployed.
"""
from pathlib import Path
import sys, json, subprocess, math
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
sys.path.insert(0, str(Path('test-results/audio-tools').resolve()))
import imageio_ffmpeg

SR = 32000
OUT = Path('public/assets/audio')
WORK = Path('test-results/audio-masters')
WORK.mkdir(parents=True, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
RNG = np.random.default_rng(940510)
MANIFEST = {}
REPORT = []

def filtered_noise(n, cutoff=2500, high=False):
    return sosfilt(butter(2, cutoff, btype='highpass' if high else 'lowpass', fs=SR, output='sos'), RNG.normal(0, 1, n))

def voice(midi, dur, instrument='pluck'):
    t = np.arange(max(1, int(dur*SR))) / SR
    f = 440*2**((midi-69)/12)
    p = 2*np.pi*f*t
    if instrument == 'pad':
        y = np.sin(p+.012*np.sin(t*3)) + .22*np.sin(p*2.002) + .1*np.sin(p*3)
        env = np.minimum(1,t/.24)*np.minimum(1,(dur-t)/.6)
    elif instrument == 'flute':
        y = np.sin(p+.04*np.sin(2*np.pi*4.2*t))+.14*np.sin(2*p)+filtered_noise(len(t),1700)*.04
        env = np.minimum(1,t/.06)*np.exp(-t*.45)*np.minimum(1,(dur-t)/.16)
    elif instrument == 'bass':
        y = np.sin(p)+.28*np.sin(2*p)+.08*np.sin(3*p)
        env = (1-np.exp(-t*100))*np.exp(-t*2)*np.minimum(1,(dur-t)/.09)
    elif instrument == 'bell':
        y = np.sin(p)*np.exp(-t*2)+.23*np.sin(p*2.76)*np.exp(-t*4)+.08*np.sin(p*5.4)*np.exp(-t*8)
        env = (1-np.exp(-t*260))*np.minimum(1,(dur-t)/.12)
    elif instrument == 'wood':
        y = np.sin(p)+.23*np.sin(p*3.98)*np.exp(-t*15)+.1*filtered_noise(len(t),2200)*np.exp(-t*35)
        env = (1-np.exp(-t*300))*np.exp(-t*5)*np.minimum(1,(dur-t)/.06)
    else:  # Damped harmonic string; softened attack, not an 8-bit square wave.
        y = sum((1/k**1.65)*np.sin(p*k)*np.exp(-t*(1.8+k*.7)) for k in range(1,7))
        env = (1-np.exp(-t*220))*np.minimum(1,(dur-t)/.09)
    return (y*env).astype(np.float32)

def drum(kind, dur=.25):
    t=np.arange(int(dur*SR))/SR
    if kind=='kick':
        y=np.sin(2*np.pi*(47*t+2.6*(1-np.exp(-t*28))))*np.exp(-t*16)
    elif kind=='snare':
        y=(filtered_noise(len(t),4200)*.65+np.sin(2*np.pi*175*t)*.25)*np.exp(-t*24)
    elif kind=='metal':
        y=sum(np.sin(2*np.pi*f*t) for f in [427,693,1147])*.16*np.exp(-t*21)
    else:
        y=filtered_noise(len(t),4700,True)*np.exp(-t*65)*.24
    edge=np.minimum(1,t/.003)*np.minimum(1,(dur-t)/.015)
    return (y*edge).astype(np.float32)

def place(buf, mono, at, amp, pan=0, wrap=False):
    start=int(at*SR); n=len(mono)
    weights=[math.sqrt((1-pan)/2), math.sqrt((1+pan)/2)]
    for c,w in enumerate(weights):
        if wrap:
            first=min(n,len(buf)-start%len(buf)); offset=start%len(buf)
            buf[offset:offset+first,c]+=mono[:first]*amp*w
            if first<n:buf[:n-first,c]+=mono[first:]*amp*w
        elif start<len(buf):
            stop=min(n,len(buf)-start);buf[start:start+stop,c]+=mono[:stop]*amp*w

def space(buf, loop):
    dry=buf.copy()
    for seconds,level in [(.137,.13),(.283,.09),(.419,.065),(.631,.045)]:
        shift=int(seconds*SR)
        if loop:buf+=np.roll(dry[:,::-1],shift,axis=0)*level
        elif shift<len(buf):buf[shift:]+=dry[:-shift,::-1]*level
    return buf

def export(id, buf, kind, label, loop=False, bpm=None):
    buf=space(buf,loop)
    buf-=np.mean(buf,axis=0)
    rms=float(np.sqrt(np.mean(buf**2)))
    target=.1 if kind=='music' else .13
    buf*=min(target/max(rms,1e-8),.74/max(float(np.max(np.abs(buf))),1e-8))
    # Only one-shots fade; loops retain the rhythmic and reverb phase at the boundary.
    if not loop:
        fade=min(len(buf)//3,int(.035*SR));buf[:min(100,len(buf))]*=np.linspace(0,1,min(100,len(buf)))[:,None]
        buf[-fade:]*=np.linspace(1,0,fade)[:,None]
    pcm=(buf*32767).astype(np.int16)
    wav=WORK/(id+'.wav');wavfile.write(wav,SR,pcm)
    folder={'music':'music','stinger':'stingers','sfx':'sfx'}[kind];(OUT/folder).mkdir(parents=True,exist_ok=True)
    paths=[]
    for ext,codec,args in [('ogg','libvorbis',['-q:a','1.5']),('mp3','libmp3lame',['-b:a','64k'])]:
        dest=OUT/folder/(id+'.'+ext)
        subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y','-i',str(wav),'-map_metadata','-1','-c:a',codec,*args,str(dest)],check=True)
        paths.append(f'{folder}/{id}.{ext}')
    duration=len(buf)/SR
    MANIFEST[id]={'label':label,'kind':kind,'files':paths,'volume':.72 if kind=='music' else .78 if kind=='stinger' else .7,'loop':loop,'duration':duration,'limit':1 if kind!='sfx' else 2,'cooldown':.14 if kind=='sfx' else .45,'variation':.035 if kind=='sfx' else 0,'fade':.65 if loop else .08}
    REPORT.append({'id':id,'seconds':round(duration,3),'bpm':bpm,'peakDb':round(20*np.log10(max(np.max(np.abs(buf)),1e-8)),2),'rmsDb':round(20*np.log10(max(np.sqrt(np.mean(buf**2)),1e-8)),2),'seamStep':round(float(np.max(np.abs(buf[0]-buf[-1]))),6) if loop else None,'bytes':sum((OUT/p).stat().st_size for p in paths)})
    print(id,round(duration,2),'sec',REPORT[-1]['bytes'],'bytes',flush=True)

# Written specifically for this game: suspended six/nine voicings and an irregular
# question/answer melody, with breaths between phrases. No transcribed source material.
MELODY=[[(0,0,1),(1.5,7,.5),(2.5,9,1)],[(0,4,1.5),(2,2,.5)],[(.5,5,1),(2,12,1)],[(0,9,1),(2,7,1.5)],[(0,2,.5),(1,4,1),(3,9,.5)],[(.5,7,1),(2,0,1.5)],[(0,5,1),(1.5,4,.5),(3,2,.5)],[(0,0,2.5)]]
BRIDGE=[[(0,9,1),(2,14,1)],[(.5,12,1),(2,7,1)],[(0,5,1.5),(2.5,9,.5)],[(1,7,2)],[(0,4,.5),(1,9,1.5)],[(0,2,1),(2,5,1)],[(.5,7,1),(2,2,1)],[(0,7,1.5),(2.5,2,.5)]]
TRACKS=[
 ('music-title','물결 너머의 첫 신호',88,24,62,'pluck','bright',.40),
 ('music-selection','여덟 갈래의 작은 빛',80,24,62,'wood','bright',.12),
 ('music-map','발자국을 잇는 지도',96,28,62,'pluck','bright',.40),
 ('music-forest','잎 사이로 흐르는 데이터',90,24,65,'flute','forest',.32),
 ('music-factory','멈춘 기계의 작은 맥박',98,28,57,'wood','factory',.57),
 ('music-mountain','바람이 남긴 좌표',82,24,59,'flute','mountain',.27),
 ('music-battle','서로의 다음 한 수',116,32,62,'pluck','battle',.72),
 ('music-elite','흔들리지 않는 발걸음',120,32,59,'wood','elite',.82),
 ('music-boss','어둠 너머로 건네는 신호',120,32,57,'bell','boss',.86),
 ('music-boss-etemon','뒤틀린 방송을 넘어',120,32,57,'wood','etemon',.86),
 ('music-boss-myotismon','새벽을 기다리는 신호',120,32,57,'flute','myotismon',.78),
 ('music-story','말하지 못했던 마음',76,24,62,'pluck','story',.06),
]

def compose_track(id,label,bpm,bars,key,lead,mood,rhythm):
    beat=60/bpm;length=bars*4*beat;buf=np.zeros((round(length*SR),2),np.float32)
    dark=mood in ['factory','mountain','elite','boss','etemon','myotismon']
    chords=[(0,[0,7,14,16]),(5,[0,7,11,14]),(9,[0,3,7,10]),(2,[0,3,7,12])]
    if dark:chords=[(0,[0,7,10,14]),(8,[0,7,11,14]),(5,[0,7,10,14]),(3,[0,7,12,14])]
    for bar in range(bars):
        root,chord=chords[(bar//2)%4]; t0=bar*4*beat
        energy=.7 if bar<4 or bar>=bars-4 else 1
        for i,p in enumerate(chord):place(buf,voice(key-12+root+p,4.6*beat,'pad'),t0,.034,(-.5+i/3),True)
        for step in [0,2,3.5] if rhythm>.6 else [0,2.5]:place(buf,voice(key-24+root,beat*.85,'bass'),t0+step*beat,.11*energy,0,True)
        # Plucked ostinato leaves the centre for the melody and sound effects.
        if mood!='story':
            for step in range(8):
                if (bar+step)%5==0:continue
                p=chord[[0,2,1,3,2,1,3,1][step]]
                place(buf,voice(key+root+p,beat*.9,'wood' if mood in ['forest','factory'] else 'pluck'),t0+step*.5*beat,.024*energy,(-.5 if step%2 else .5),True)
        phrase=BRIDGE if (bar//8)%3==1 else MELODY
        for onset,p,d in phrase[bar%8]:
            if dark and p in [4,9]:p-=1
            if mood in ['story','selection'] and bar%8 in [2,6]:continue
            place(buf,voice(key+12+p,beat*d+.25,lead),t0+onset*beat,.10 if mood!='story' else .078,.06,True)
        if rhythm>.1:
            for step in [0,2] + ([3.5] if bar%4==3 and rhythm>.6 else []):place(buf,drum('kick'),t0+step*beat,.19*rhythm*energy,0,True)
            for step in [1,3]:place(buf,drum('metal' if mood in ['factory','etemon'] else 'snare'),t0+step*beat,.13*rhythm*energy,-.1,True)
            for step in range(8):place(buf,drum('hat',.12),t0+step*.5*beat,.19*rhythm,.35 if step%2 else -.3,True)
        if bar%4==3:
            place(buf,voice(key+24+7,.65,'bell'),t0+3.5*beat,.028,.6,True)
        if mood in ['mountain','forest','myotismon']:
            n=int(4*beat*SR);wind=filtered_noise(n,550)*np.sin(np.linspace(0,np.pi,n))*.016
            place(buf,wind,t0,1,-.65,True)
    export(id,buf,'music',label,True,bpm)

def sting(id,label,notes,kind='bell',duration=2.2,dark=False):
    buf=np.zeros((int(duration*SR),2),np.float32)
    interval=min(.28,(duration-1)/max(len(notes),1))
    for i,n in enumerate(notes):place(buf,voice(n, min(1.7,duration-i*interval),kind),i*interval,.19,(-.3 if i%2 else .3))
    if duration>4:
        # Six-second evolution: data grains collect, rising chord swells, release.
        for i in range(28):place(buf,voice((45 if dark else 57)+(i*7)%24,.22,'wood'),i*.13,.035,-.7+(i%7)/5)
        for n in ([45,52,55,62] if dark else [50,57,64,69]):place(buf,voice(n,3.4,'pad'),1.8,.09)
        place(buf,drum('kick',.5),3.8,.4)
        for n in notes[-3:]:place(buf,voice(n,2,'bell'),3.85,.09)
    export(id,buf,'stinger',label)

SFX={
 'ui-confirm':('버튼 누르기',72,'wood',.17),'ui-select':('선택 변경',77,'pluck',.2),'ui-cancel':('뒤로 가기',62,'wood',.23),'ui-denied':('불가능한 행동',43,'wood',.3),'node-select':('지도 이동',64,'pluck',.45),'reward-reveal':('보상 펼치기',81,'bell',.75),
 'card-draw':('카드 드로우',69,'paper',.19),'card-select':('카드 선택',74,'wood',.13),'card-attack':('공격 카드',50,'whoosh',.28),'card-guard':('방어 카드',57,'shield',.35),'card-support':('지원 카드',76,'bell',.45),'card-evolved':('진화 기술 카드',69,'spark',.65),'card-discard':('카드 버림',54,'paper',.23),'deck-shuffle':('덱 섞기',60,'shuffle',.55),'energy-low':('에너지 부족',45,'wood',.24),'card-upgrade':('카드 강화',84,'spark',.65),
 'hit-normal':('일반 타격',48,'hit',.2),'hit-heavy':('강한 타격',36,'hit',.45),'attack-fire':('화염',45,'fire',.65),'attack-electric':('전기',74,'electric',.5),'attack-water':('물과 얼음',69,'water',.65),'attack-plant':('식물 속박',60,'plant',.6),'attack-light':('빛',84,'spark',.7),'attack-dark':('어둠',38,'dark',.7),
 'block-gain':('방어도 획득',64,'shield',.4),'block-break':('방어 파괴',54,'break',.42),'heal':('회복',81,'bell',.75),'status-apply':('상태 이상',53,'dark',.5),'status-cleanse':('상태 정화',86,'water',.7),'enemy-intent':('행동 예고',65,'wood',.3),'enemy-appear':('적 등장',42,'whoosh',.65),'player-hit':('파트너 피격',40,'hit',.3),'enemy-hit':('적 피격',48,'hit',.27),'enemy-purify':('적 정화',79,'spark',1.1),'enemy-down':('적 격퇴',38,'whoosh',.7),
 'crest-charge':('문장 에너지',77,'bell',.35),'evolution-energy':('진화 에너지',74,'spark',.5),'data-gather':('데이터 집중',81,'electric',.9),'forced-warning':('강제 진화 경고',42,'dark',1.2),'corruption-rise':('오염 증가',38,'dark',.7),'burden-relief':('부담 감소',72,'water',.65),
}

def effect(id,label,midi,kind,dur):
    t=np.arange(int(dur*SR))/SR; f=440*2**((midi-69)/12)
    if kind in ['wood','pluck','bell']:mono=voice(midi,dur,kind)
    else:
        noise=filtered_noise(len(t),1800 if kind in ['fire','dark','plant'] else 4200)
        env=np.sin(np.pi*np.minimum(t/dur,1))**.8
        if kind=='hit':mono=drum('kick',dur)+noise*np.exp(-t*30)*.25
        elif kind in ['paper','shuffle']:mono=noise*.3*np.sin(2*np.pi*(8 if kind=='shuffle' else 3)*t)**2*env
        elif kind=='electric':mono=(np.sin(2*np.pi*f*t+2*np.sin(2*np.pi*37*t))*.25+noise*.15)*env*np.sin(2*np.pi*19*t)**2
        elif kind=='water':mono=(np.sin(2*np.pi*(f*t+f*.045*np.sin(t*7)))+.25*np.sin(2*np.pi*f*1.5*t))*env*.45
        elif kind=='spark':mono=voice(midi,dur,'bell')+.35*voice(midi+7,dur,'bell')
        elif kind in ['shield','break']:mono=(voice(midi,dur,'bell')+noise*(.4 if kind=='break' else .1))*env
        elif kind=='dark':mono=(np.sin(2*np.pi*f*t)+.2*np.sin(2*np.pi*f*1.06*t)+noise*.3)*env*.4
        elif kind=='plant':mono=noise*env*.5+voice(midi,dur,'wood')*.5
        elif kind=='fire':mono=noise*env*.7+np.sin(2*np.pi*(80*t-22*t*t))*env*.25
        else:mono=noise*env*.5+np.sin(2*np.pi*f*t)*env*.08
    buf=np.zeros((len(mono)+int(.09*SR),2),np.float32);place(buf,mono,0,.8)
    export(id,buf,'sfx',label)

if __name__=='__main__':
    for row in TRACKS:compose_track(*row)
    for id,label,notes,kind,dur in [
      ('crest-ready','문장 준비 완료',[69,76,81],'bell',1.5),('evolution-start','새로운 형태로 모이는 마음',[57,64,71,76,81],'pluck',6.5),('evolution-complete','함께 닿은 새 모습',[69,76,81,83],'bell',2.5),('evolution-forced','균열 속의 힘',[45,52,58,62,69],'wood',6.5),
      ('battle-victory','열린 길',[62,69,76,78,81],'pluck',2.8),('battle-defeat','다시 손을 잡고',[66,64,59,62],'flute',3.2),('card-acquire','기억한 기술',[74,81,86],'wood',1.3),('chapter-complete','서로에게 돌아오는 목소리',[62,69,76,74,81,78,86],'bell',5.0),('archive-unlock','새로운 기록',[81,86,88],'bell',1.6),
      ('crest-tai','용기 · 금속의 도약',[50,57,64,74],'bell',1.9),('crest-matt','우정 · 맞닿은 두 음색',[62,69,64,71],'pluck',2.0),('crest-sora','사랑 · 따뜻한 공명',[65,72,76],'pad',2.2),('crest-koushiro','지식 · 정돈된 신호',[72,79,74,81,76,83],'wood',1.6),('crest-mimi','순수 · 잎 끝의 반짝임',[77,84,81,89],'flute',2.0),('crest-joe','성실 · 단단한 약속',[43,50,55,62],'wood',1.8),('crest-tk','희망 · 작은 상승',[48,55,62,69,76,84],'pluck',2.3),('crest-kari','빛 · 맑아지는 울림',[76,83,88,90],'bell',2.3),
    ]:sting(id,label,notes,kind,dur,id=='evolution-forced')
    for id,args in SFX.items():effect(id,*args)
    Path('src/audio-manifest.json').write_text(json.dumps(MANIFEST,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    Path('docs/audio-measurements.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2,default=float)+'\n',encoding='utf-8')
    print('TOTAL',len(MANIFEST),'cues',sum(r['bytes'] for r in REPORT),'bytes')
