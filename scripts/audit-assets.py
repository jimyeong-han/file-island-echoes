"""Audit optimized project art; write review sheets only under ignored test-results/."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

root=Path('public/assets');output=Path('test-results');output.mkdir(exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14)
files=sorted((root/'characters').glob('*.webp'))
report=[]
for i in range(0,len(files),25):
    sheet=Image.new('RGB',(1000,1050),'#182933');draw=ImageDraw.Draw(sheet)
    for j,path in enumerate(files[i:i+25]):
        im=Image.open(path).convert('RGBA');alpha=im.getchannel('A');assert alpha.getextrema()[0]==0,path
        assert max(im.size)<=640,path
        report.append({'file':path.as_posix(),'size':im.size,'bytes':path.stat().st_size,'alpha':alpha.getextrema(),'bounds':alpha.getbbox()})
        im.thumbnail((186,180));x=(j%5)*200+(200-im.width)//2;y=(j//5)*210+8
        sheet.paste(im,(x,y),im);draw.text(((j%5)*200+7,(j//5)*210+191),path.stem.removesuffix('-battle'),font=font,fill='#e5d9be')
    sheet.save(output/f'characters-review-{i//25+1}.jpg',quality=94)
(output/'asset-audit.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(f'{len(files)} alpha WebP sprites verified. {sum(p.stat().st_size for p in root.rglob("*") if p.is_file())} bytes in public/assets/.')
