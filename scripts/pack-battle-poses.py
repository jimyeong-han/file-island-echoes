"""Pack newly generated whole-pose sheets (never cut a static character into joints).

Usage: python scripts/pack-battle-poses.py
Input originals remain in ignored test-results/pose-sources; provenance is tracked.
Only grid extraction, alpha cleanup, common scale/foot registration and WebP encoding.
"""
from pathlib import Path
from PIL import Image
import json

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'public/assets/poses'
DEST.mkdir(parents=True, exist_ok=True)
SIZE = 320
manifest = {}
for source in sorted((ROOT / 'test-results/pose-sources').glob('*.png')):
    im = Image.open(source).convert('RGBA')
    w, h = im.size
    cells = []
    for index in range(6):
        x, y = index % 3, index // 3
        cell = im.crop((x*w//3, y*h//2, (x+1)*w//3, (y+1)*h//2))
        alpha = cell.getchannel('A')
        # imagegen alpha may retain <=3/255 matte noise in otherwise transparent pixels.
        cell.putalpha(alpha.point(lambda a: 0 if a < 4 else min(255, round(a*255/254))))
        mask = alpha.point(lambda a: 255 if a >= 96 else 0)
        box = mask.getbbox()
        if not box:
            raise ValueError(f'Empty pose {source.stem}:{index}')
        # Register the full silhouette, keeping its anatomy/relative limb positions intact.
        cells.append((cell, box))
    scale = min((SIZE-24)/max(b[2]-b[0] for _,b in cells), (SIZE-26)/max(b[3]-b[1] for _,b in cells))
    atlas = Image.new('RGBA', (SIZE*3, SIZE*2))
    frames = []
    for i, (cell, box) in enumerate(cells):
        crop = cell.crop(box)
        crop = crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS)
        px, py = (SIZE-crop.width)//2, SIZE-12-crop.height
        atlas.alpha_composite(crop,(i%3*SIZE+px,i//3*SIZE+py))
        frames.append({'bounds':[round(px/SIZE,3),round(py/SIZE,3),round(crop.width/SIZE,3),round(crop.height/SIZE,3)]})
    out = DEST / f'{source.stem}-poses.webp'
    atlas.save(out,'WEBP',quality=78,method=6,alpha_quality=90)
    manifest[source.stem]={'path':f'poses/{out.name}','size':SIZE,'frames':frames,'bytes':out.stat().st_size}
(ROOT / 'src/pose-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(manifest)} atlases / {sum(v["bytes"] for v in manifest.values()):,} bytes')
