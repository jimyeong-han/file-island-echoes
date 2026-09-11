from PIL import Image, ImageDraw
from pathlib import Path
out=Path('public/assets/pwa');out.mkdir(parents=True,exist_ok=True)
for name,size in [('icon-192',192),('icon-512',512),('maskable-192',192),('maskable-512',512),('apple-touch-icon',180)]:
 im=Image.new('RGB',(1024,1024),'#081724');d=ImageDraw.Draw(im)
 d.ellipse((224,224,800,800),outline='#67ded0',width=30)
 d.rounded_rectangle((322,322,702,596),radius=38,fill='#163b46',outline='#a7eee0',width=24)
 d.line([(368,524),(463,416),(538,476),(643,394)],fill='#f1bd68',width=28)
 d.rounded_rectangle((364,650,450,677),radius=10,fill='#f1bd68');d.rounded_rectangle((574,650,660,677),radius=10,fill='#f1bd68')
 im.resize((size,size),Image.Resampling.LANCZOS).save(out/(name+'.png'),optimize=True)
