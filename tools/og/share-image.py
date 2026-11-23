"""Share image v2: the stamp on the burgundy desk, with the Blender desk objects,
their rendered shadows, contact shadows (AO), soft depth blur, window light and grain.
Fonts: only those used on the site."""
import urllib.parse
from playwright.sync_api import sync_playwright
from PIL import Image

P = '/home/claude/yq-hub/public'
T = P + '/table'
F = P + '/fonts'

def svg_url(svg): return 'url("data:image/svg+xml,' + urllib.parse.quote(svg) + '")'
def grain(op, freq=0.9, rgb='1 1 1', size=240):
    r, g, b = rgb.split()
    return svg_url(f"<svg xmlns='http://www.w3.org/2000/svg' width='{size}' height='{size}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='{freq}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 {r} 0 0 0 0 {g} 0 0 0 0 {b} 0 0 0 {op} 0'/></filter><rect width='{size}' height='{size}' filter='url(#n)'/></svg>")
def mottle(op, seed, rgb='0 0 0', f='.006 .012'):
    r, g, b = rgb.split()
    return svg_url(f"<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='{f}' numOctaves='4' seed='{seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 {r} 0 0 0 0 {g} 0 0 0 0 {b} 0 0 0 {op} -.1'/></filter><rect width='800' height='800' filter='url(#m)'/></svg>")
def perforated(w, h, r=10, gap=28):
    nx, ny = round(w / gap), round(h / gap)
    pts = [(i * w / nx, y) for i in range(nx + 1) for y in (0, h)] + [(x, j * h / ny) for j in range(ny + 1) for x in (0, w)]
    c = ''.join(f"<circle cx='{x:.1f}' cy='{y:.1f}' r='{r}'/>" for x, y in pts)
    return svg_url(f"<svg xmlns='http://www.w3.org/2000/svg' width='{w}' height='{h}'><mask id='k'><rect width='{w}' height='{h}' fill='white'/><g fill='black'>{c}</g></mask><rect width='{w}' height='{h}' fill='white' mask='url(#k)'/></svg>")

def obj(name, x, y, w, rot=0, blur=0, ao=(0, 0, 0, 0), op=1):
    """object + its rendered shadow (same frame) + a soft contact shadow under it"""
    ax, ay, aw, ah = ao
    aodiv = f'<div class="abs" style="left:{x+ax}px;top:{y+ay}px;width:{aw}px;height:{ah}px;border-radius:50%;background:rgb(10 0 2/.75);filter:blur(14px);transform:rotate({rot}deg)"></div>' if aw else ''
    return (aodiv +
        f'<div class="abs" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({rot}deg);filter:blur({blur}px);opacity:{op}">'
        f'<img src="{T}/{name}-shadow.webp" style="position:absolute;inset:0;width:100%;opacity:.95">'
        f'<img src="{T}/{name}.webp" style="position:relative;display:block;width:100%"></div>')

SW, SH = 640, 410
html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:'Cinzel Decorative';font-weight:700;src:url({F}/cinzel-decorative-latin-700-normal.woff2)}}
@font-face{{font-family:Cinzel;font-weight:500;src:url({F}/cinzel-latin-500-normal.woff2)}}
@font-face{{font-family:Cinzel;font-weight:700;src:url({F}/cinzel-latin-700-normal.woff2)}}
@font-face{{font-family:'IM Fell English';font-style:italic;src:url({F}/im-fell-english-latin-400-italic.woff2)}}
html,body{{margin:0}} img{{max-width:none}}
.c{{position:relative;width:1200px;height:630px;overflow:hidden;background:#3a0b10 url({T}/burgundy.webp);background-size:300px}}
.abs{{position:absolute}}
.desk-tone{{inset:0;background:{mottle(.45,4)};mix-blend-mode:multiply}}
.light{{left:-180px;top:-260px;width:1400px;height:1100px;opacity:.6;mix-blend-mode:screen;filter:blur(2px)}}
.shade{{left:-180px;top:-260px;width:1400px;height:1100px;opacity:.55;mix-blend-mode:multiply;filter:blur(3px)}}
.vig{{inset:0;background:radial-gradient(75% 85% at 46% 46%,transparent 45%,rgb(10 0 3/.82) 100%)}}
.grain{{inset:0;background-image:{grain(.5,.95)};mix-blend-mode:overlay;opacity:.55}}
.grain2{{inset:0;background-image:{grain(.35,.6,'0 0 0',300)};mix-blend-mode:multiply;opacity:.5}}
/* stamp */
.stampWrap{{left:290px;top:104px;width:{SW}px;height:{SH}px;transform:rotate(-3deg);filter:drop-shadow(0 3px 2px rgb(20 0 2/.55)) drop-shadow(14px 26px 22px rgb(10 0 2/.6))}}
.stamp{{inset:0;background:#efe3c8;-webkit-mask:{perforated(SW,SH)};mask:{perforated(SW,SH)}}}
.stamp::before{{content:'';position:absolute;inset:0;background-image:{mottle(.3,9,'.45 .32 .18','.01 .02')},{grain(.25,.85,'.35 .22 .1')}}}
.stamp::after{{content:'';position:absolute;inset:0;background:radial-gradient(120% 120% at 30% 25%,transparent 55%,rgb(110 70 30/.25) 100%)}}
.field{{left:30px;top:30px;right:30px;bottom:30px;border-radius:10px;background:#7a1218;background-image:{mottle(.55,2)},{grain(.35,.8,'0 0 0')};
  box-shadow:inset 0 0 0 1px rgb(240 220 190/.25),inset 0 0 50px rgb(20 0 2/.65),inset 0 2px 3px rgb(0 0 0/.4)}}
.field::after{{content:'';position:absolute;inset:10px;border:1px solid rgb(240 220 190/.3);border-radius:6px}}
.k{{font:500 13px Cinzel;letter-spacing:.32em;text-transform:uppercase;color:#ecd3ad;opacity:.85}}
.nm{{left:0;right:0;top:118px;text-align:center;font:700 64px/1 'Cinzel Decorative';color:#f6e7cc;
  text-shadow:0 1px 0 rgb(255 240 210/.25),0 -1px 0 rgb(40 0 4/.6),0 6px 18px rgb(20 0 2/.55)}}
.rule{{left:200px;right:200px;top:206px;height:1px;background:linear-gradient(90deg,transparent,#e5c993,transparent)}}
.role{{left:0;right:0;top:224px;text-align:center;font:italic 26px 'IM Fell English';color:#f0dcbb}}
.orn{{left:0;right:0;top:272px;text-align:center;color:#e5c993;font:14px Cinzel;letter-spacing:.6em}}
</style></head><body><div class="c">
<div class="abs desk-tone"></div>
<img class="abs shade" src="{T}/window-shade.webp"><img class="abs light" src="{T}/window-light.webp">
{obj('candle', -20, -60, 330, 0, 1.4, (110, 160, 140, 90), .97)}
{obj('pen', 860, -70, 430, -32, 1.6)}
{obj('compass', -50, 370, 290, 16, 1.6, (60, 110, 170, 160))}
<div class="abs stampWrap"><div class="abs stamp">
  <div class="abs field">
    <div class="abs k" style="left:26px;top:24px">Portfolio</div>
    <div class="abs k" style="right:26px;top:24px">Bangalore</div>
    <div class="abs nm">Yasir Quazi</div>
    <div class="abs rule"></div>
    <div class="abs role">Product Designer</div>
    <div class="abs orn">✦</div>
    <div class="abs k" style="left:26px;bottom:22px">Selected works</div>
    <div class="abs k" style="right:26px;bottom:22px">MMXXVI</div>
  </div>
</div></div>
{obj('inkwell', 965, 300, 250, 0, 0.6, (30, 70, 190, 160))}
{obj('camera', 720, 385, 420, -12, 0, (50, 110, 320, 150))}
<div class="abs vig"></div><div class="abs grain"></div><div class="abs grain2"></div>
</div></body></html>"""
open('/home/claude/og2/desk.html', 'w').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=2)
    pg.goto('file:///home/claude/og2/desk.html'); pg.wait_for_timeout(1000)
    pg.screenshot(path='/home/claude/og2/desk@2x.png'); b.close()
im = Image.open('/home/claude/og2/desk@2x.png').convert('RGB')
im.resize((1200, 630), Image.LANCZOS).save('/home/claude/og2/desk.png')
print('ok')
