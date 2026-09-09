"""Resize project-generated PNGs to WebP; preserve alpha. Originals stay outside Git."""
from pathlib import Path
from PIL import Image
import sys

root = Path('public/assets')
for folder, size, quality in [('characters', 640, 88), ('backgrounds', 1536, 85), ('portraits', 640, 88)]:
    for path in (root / folder).glob('*.png'):
        image = Image.open(path).convert('RGBA' if folder == 'characters' else 'RGB')
        if folder == 'characters':
            alpha = image.getchannel('A')
            if alpha.getextrema()[0] == 255:
                raise ValueError(f'{path.name}: missing genuine alpha')
            bounds = alpha.getbbox()
            if bounds:
                image = image.crop(bounds)
                # A small transparent safety margin; consistent visual footprints.
                padding = max(4, round(max(image.size) * .025))
                framed = Image.new('RGBA', (image.width + padding * 2, image.height + padding * 2))
                framed.paste(image, (padding, padding))
                image = framed
        image.thumbnail((size, size), Image.Resampling.LANCZOS)
        target = path.with_suffix('.webp')
        image.save(target, 'WEBP', quality=quality, method=6, exact=True)
        print(f'{target.as_posix()}: {image.width}x{image.height}, {target.stat().st_size:,} bytes, {image.mode}')
        if '--remove-copies' in sys.argv:
            path.unlink()  # Only copied PNGs under the fixed public/assets folders.
