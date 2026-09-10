"""Validate compressed audio, decode lengths and loop boundaries; create a listening reel."""
from pathlib import Path
import json,sys,subprocess
import numpy as np
from scipy.io import wavfile
sys.path.insert(0,str(Path('test-results/audio-tools').resolve()))
import imageio_ffmpeg
ff=imageio_ffmpeg.get_ffmpeg_exe();sr=32000
manifest=json.loads(Path('src/audio-manifest.json').read_text(encoding='utf-8'))
report=[];reel=[]
for id,cue in manifest.items():
    row={'id':id,'label':cue['label'],'kind':cue['kind'],'seconds':cue['duration'],'files':[]}
    for file in cue['files']:
        p=Path('public/assets/audio')/file
        decoded=subprocess.run([ff,'-v','error','-i',str(p),'-f','f32le','-ar',str(sr),'-ac','2','-'],capture_output=True,check=True).stdout
        y=np.frombuffer(decoded,np.float32).reshape(-1,2)
        seconds=len(y)/sr;peak=float(np.max(np.abs(y)));rms=float(np.sqrt(np.mean(y*y)))
        assert abs(seconds-cue['duration'])<.08,(id,file,seconds)
        assert peak<.99,(id,'clipping',peak)
        seam=float(np.max(np.abs(y[0]-y[min(len(y)-1,round(cue['duration']*sr)-1)])))
        if cue['loop']:
            assert seam<.045,(id,'loop discontinuity',seam)
            assert np.sqrt(np.mean(y[:640]**2))>.0004,(id,'start silence')
            assert np.sqrt(np.mean(y[-640:]**2))>.0004,(id,'end silence')
        prepared=seam
        if cue['loop']:
            z=y.copy();n=min(len(z),round(cue['duration']*sr));correction=(z[n-1]-z[0])/2
            for i in range(64):
                d=correction*(.5+.5*np.cos(np.pi*i/63));z[i]+=d;z[n-1-i]-=d
            prepared=float(np.max(np.abs(z[0]-z[n-1])));assert prepared<1e-6
        audible=np.flatnonzero(np.max(np.abs(y),axis=1)>.001)
        onset=float(audible[0]/sr*1000) if len(audible) else seconds*1000
        row['files'].append({'preparedSeamStep':round(prepared,8) if cue['loop'] else None,'path':file,'bytes':p.stat().st_size,'decodedSeconds':seconds,'onsetMsMinus60Db':round(onset,3),'peakDb':round(20*np.log10(peak),2),'rmsDb':round(20*np.log10(rms),2),'seamStep':round(seam,6) if cue['loop'] else None})
        if file.endswith('.ogg') and id in ['music-title','music-forest','music-battle','music-boss','evolution-start','crest-matt','attack-fire','heal']:
            clip=y[sr*8:sr*16] if cue['loop'] else y
            reel.append(np.concatenate([clip,np.zeros((int(.5*sr),2),np.float32)]))
    report.append(row)
Path('docs/audio-measurements.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
wavfile.write('test-results/audio-listening-reel.wav',sr,(np.concatenate(reel)*32767).astype(np.int16))
subprocess.run([ff,'-v','error','-y','-i','test-results/audio-listening-reel.wav','-c:a','libmp3lame','-b:a','128k','test-results/audio-listening-reel.mp3'],check=True)
print('PASS',len(report),'cues,',len(report)*2,'compressed files,',sum(f['bytes'] for r in report for f in r['files']),'bytes; no clipped samples, silent seams or decode errors.')
