import sys, json
from PIL import Image
name = sys.argv[1]
o = Image.open(f'/home/claude/render/out/{name}.png').convert('RGBA')
sh = Image.open(f'/home/claude/render/out/{name}-shadow.png').convert('RGBA').resize(o.size, Image.BILINEAR)
bg = Image.new('RGBA', o.size, (205, 175, 125, 255))
bg.paste((70, 16, 22, 255), (0, o.size[1] // 2, o.size[0], o.size[1]))
bg.alpha_composite(sh); bg.alpha_composite(o)
bg.convert('RGB').save(f'/home/claude/render/out/preview-{name}.jpg', quality=88)
print(o.size)
