import json
from pathlib import Path
from PIL import Image
manifest=json.loads(Path('src/asset-manifest.json').read_text())
metrics={}
for key,path in manifest['characters'].items():
 if path.endswith('.svg'):continue
 im=Image.open('public/assets/'+path).convert('RGBA');alpha=im.getchannel('A').point(lambda a:255 if a>40 else 0);bbox=alpha.getbbox()
 if not bbox:continue
 x0,y0,x1,y1=bbox
 feet=alpha.crop((0,max(y0,int(y1-(y1-y0)*.22)),im.width,y1)).getbbox()
 fx0,_,fx1,_=feet if feet else bbox
 metrics[key]={'x':round((fx0+fx1)/2/im.width,4),'y':round((y1-2)/im.height,4),'width':round(min(.95,max(.28,(fx1-fx0)/im.width*1.15)),4),'w':im.width,'h':im.height}
Path('src/ground-metrics.json').write_text(json.dumps(metrics,indent=2)+'\n')

