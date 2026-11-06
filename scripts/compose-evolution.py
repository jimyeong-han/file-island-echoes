"""v0.13 original 5.6-second scores. No reference tracks, samples, or copied melody.
Uses the project's own oscillator instruments; rerenders only these two new cues.
"""
import importlib.util, json
from pathlib import Path
import numpy as np
spec=importlib.util.spec_from_file_location('composer',Path(__file__).with_name('compose-audio.py'))
c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)

for dark in [False,True]:
    buf=np.zeros((int(5.6*c.SR),2),np.float32)
    # Device: two soft bell notes. Signal: ascending broken suspended chord.
    notes=[62,69,76] if not dark else [50,57,63]
    for at,p in [(0,notes[0]),(.4,notes[1]),(.8,notes[0]+12),(1.0,notes[1]),(1.2,notes[2]),(1.4,notes[1]+12)]:
        c.place(buf,c.voice(p,.65,'bell'),at,.10,(-.25 if at% .4<.1 else .25))
    # Data phase: rhythmic ostinato accelerates through a new irregular melody.
    melody=[(1.6,66,.3),(1.9,73,.4),(2.35,69,.25),(2.6,78,.55)]
    if dark:melody=[(t,p-13 if i%2 else p-12,d) for i,(t,p,d) in enumerate(melody)]
    for at,p,d in melody:c.place(buf,c.voice(p,d+.2,'flute'),at,.16)
    chord=[50,57,62,66,73] if not dark else [38,45,50,53,63]
    for i,p in enumerate(chord):c.place(buf,c.voice(p,3.5,'pad'),1.6,.05,(i-2)*.22)
    for i in range(8):
        at=1.6+i*.2;c.place(buf,c.voice(chord[(i*2)%5]+12,.3,'pluck'),at,.085,(-.4 if i%2 else .4))
        c.place(buf,c.drum('hat',.10),at,.13)
    # Reveal at exactly 3.2 s: full voicing, bass and melodic answer; no white-noise blast.
    for i,p in enumerate(chord):c.place(buf,c.voice(p+12,2.35,'pad'),3.2,.08,(i-2)*.2)
    answer=[(3.2,81,.5),(3.8,78,.3),(4.2,74,1.25)] if not dark else [(3.2,69,.5),(3.8,65,.3),(4.2,62,1.25)]
    for at,p,d in answer:c.place(buf,c.voice(p,d,'flute'),at,.18)
    for at in [1.6,2.4,3.2,4.0]:
        c.place(buf,c.drum('kick',.35),at,.28)
        c.place(buf,c.voice(chord[0]-12,.65,'bass'),at,.16)
    c.place(buf,c.drum('snare',.28),3.2,.14)
    c.place(buf,c.voice(notes[2]+12,1.2,'bell'),4.4,.08)
    buf[-int(.5*c.SR):]*=np.linspace(1,0,int(.5*c.SR))[:,None]
    c.export('music-evolution-dark' if dark else 'music-evolution',buf,'music','갈라진 신호' if dark else '마음이 닿는 순간',bpm=150)

path=Path('src/audio-manifest.json');manifest=json.loads(path.read_text(encoding='utf-8'))
manifest.update(c.MANIFEST);path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
