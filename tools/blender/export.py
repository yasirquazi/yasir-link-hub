"""Convert renders to web-ready WebP and write the object frames for the page."""
import json, os, glob
from PIL import Image, ImageEnhance

OUT = '/home/claude/render/out'
DST = '/home/claude/yq-hub/public/table'
os.makedirs(DST, exist_ok=True)
frames = {}
for name in ['camera', 'pen', 'candle', 'compass', 'inkwell']:
    frames[name] = json.load(open(f'{OUT}/{name}.json'))
    im = Image.open(f'{OUT}/{name}.png').convert('RGBA')
    im.save(f'{DST}/{name}.webp', quality=86, method=6)
    sh = Image.open(f'{OUT}/{name}-shadow.png').convert('RGBA')
    # shadows only need their alpha; tint them a warm near-black
    a = sh.getchannel('A')
    tinted = Image.new('RGBA', sh.size, (24, 6, 6, 255)); tinted.putalpha(a)
    tinted.save(f'{DST}/{name}-shadow.webp', quality=70, method=6)
for orient in ['landscape', 'portrait']:
    p = Image.open(f'{OUT}/paper-{orient}.png').convert('RGBA')
    rgb = p.convert('RGB')
    rgb = ImageEnhance.Color(rgb).enhance(1.12)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.04)
    q = rgb.convert('RGBA'); q.putalpha(p.getchannel('A'))
    q.save(f'{DST}/paper-{orient}.webp', quality=66, method=6)
json.dump(frames, open('/home/claude/yq-hub/src/data/table-objects.json', 'w'), indent=1)
tot = 0
for f in sorted(glob.glob(f'{DST}/*')):
    sz = os.path.getsize(f); tot += sz; print(f'{os.path.basename(f):28s} {sz/1024:7.1f} KB')
print(f'total {tot/1024:.0f} KB')
