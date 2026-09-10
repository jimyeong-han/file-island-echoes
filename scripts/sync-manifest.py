from pathlib import Path
import json
p=Path('src/asset-manifest.json');d=json.loads(p.read_text(encoding='utf-8'))
for f in Path('public/assets/characters').glob('*-battle.webp'):
    key=f.name.removesuffix('-battle.webp')
    if key not in ['metal-greymon','skull-greymon','kuwagamon','elecmon','numemon','ogremon']:
        d['characters'][key]=f'characters/{f.name}'
for f in Path('public/assets/characters').glob('*-battle.svg'):
    d['characters'][f.name.removesuffix('-battle.svg')]=f'characters/{f.name}'
p.write_text(json.dumps(d,indent=2)+'\n',encoding='utf-8')
