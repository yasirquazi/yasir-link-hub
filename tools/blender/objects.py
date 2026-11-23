"""Table objects. Usage: python objects.py pen|camera|inkwell|compass|candle"""
import sys, math, json, os, bpy, bmesh
sys.path.insert(0, '/home/claude/render')
from common import *
from mathutils import Vector

which = sys.argv[-1]
QUICK = bool(os.environ.get('QUICK'))
s = reset(samples=16 if QUICK else 72)
table()
parts = []
R = math.radians


def keep(o):
    parts.append(o); return o


# ── materials ──
black_lacquer = mat('lacquer', (0.012, 0.010, 0.010), rough=0.14, coat=1.0)
gold = rough_var(mat('gold', (1.0, 0.72, 0.36), metal=1.0, rough=0.22), 0.16, 0.34, 12)
brass = bump(rough_var(mat('brass', (0.85, 0.60, 0.30), metal=1.0, rough=0.3), 0.2, 0.48, 6), scale=120, strength=0.05)
chrome = rough_var(mat('chrome', (0.86, 0.86, 0.84), metal=1.0, rough=0.16), 0.1, 0.26, 10)
black_paint = rough_var(mat('blackpaint', (0.02, 0.018, 0.016), rough=0.32, coat=0.5), 0.22, 0.5, 5)
leather = bump(mat('leather', (0.03, 0.024, 0.02), rough=0.62), scale=180, strength=0.35, kind='voronoi')
knurl = bump(mat('knurl', (0.02, 0.02, 0.02), metal=0.3, rough=0.4), scale=260, strength=0.6, kind='noise', distortion=0.0, detail=1)
glass = mat('glass', (0.82, 0.92, 0.86), rough=0.02, trans=1.0, ior=1.5)
ink = mat('ink', (0.01, 0.015, 0.05), rough=0.05, coat=0.6)
dial = bump(mat('dial', (0.86, 0.78, 0.6), rough=0.6), scale=80, strength=0.05)
red_enamel = mat('red', (0.55, 0.04, 0.05), rough=0.25, coat=0.6)
wax = mat('wax', (0.92, 0.86, 0.72), rough=0.45, sss=0.5)
wick = mat('wick', (0.02, 0.015, 0.01), rough=0.9)
flame = mat('flame', (1, 0.7, 0.3), emit=(1.0, 0.62, 0.22), emit_str=14)


def torus(R_, r_, loc, rot=(0, 0, 0), m=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=R_, minor_radius=r_, location=loc, rotation=rot, major_segments=64, minor_segments=16)
    o = bpy.context.object
    if m: assign(o, m)
    smooth(o); return o


def sphere(r, loc, scale=(1, 1, 1), m=None):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    o = bpy.context.object; o.scale = scale
    if m: assign(o, m)
    smooth(o); return o


def cone(r1, r2, depth, loc, rot=(0, 0, 0), m=None, verts=48):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object
    if m: assign(o, m)
    smooth(o); return o


# Lying along X: rotate cylinders by 90° about Y
AX = (0, R(90), 0)
AY = (R(90), 0, 0)

if which == 'pen':
    z = 0.21
    keep(sphere(0.2, (-3.0, 0, z), scale=(0.6, 1, 1), m=black_lacquer))
    keep(cyl(0.205, 0.12, (-2.86, 0, z), AX, m=gold))
    keep(cyl(0.21, 3.6, (-0.98, 0, z), AX, m=black_lacquer, bevel=0.02))
    keep(cyl(0.215, 0.08, (0.86, 0, z), AX, m=gold))
    keep(cyl(0.2, 0.05, (0.96, 0, z), AX, m=gold))
    keep(cone(0.19, 0.145, 0.9, (1.43, 0, z), (0, R(90), 0), m=black_lacquer))
    nib = keep(cone(0.15, 0.012, 0.95, (2.32, 0, z - 0.02), (0, R(90), 0), m=gold))
    nib.scale = (0.32, 1, 1)
    keep(box((0.42, 0.012, 0.03), (2.45, 0, z + 0.035), m=black_lacquer))
    keep(cyl(0.022, 0.04, (2.24, 0, z + 0.035), m=black_lacquer, verts=16))
    # clip on the cap end
    keep(box((1.3, 0.07, 0.05), (-2.05, 0, z + 0.215), m=gold, bevel=0.02))
    keep(sphere(0.07, (-1.42, 0, z + 0.2), m=gold))
    rot_z = 32
    height = 0.45

elif which == 'camera':
    keep(box((5.6, 1.5, 2.3), (0, 0, 1.15), m=leather, bevel=0.32, segs=6))
    keep(box((5.62, 1.52, 0.55), (0, 0, 2.55), m=black_paint, bevel=0.3, segs=6))
    # worn brass showing through at the plate's edges
    keep(box((5.0, 1.38, 0.04), (0, 0, 2.83), m=brass, bevel=0.015))
    keep(box((4.96, 1.34, 0.05), (0, 0, 2.85), m=black_paint, bevel=0.015))
    # dials and controls
    keep(cyl(0.48, 0.22, (1.55, 0.08, 2.98), m=knurl, bevel=0.02))
    keep(cyl(0.38, 0.06, (1.55, 0.08, 3.12), m=chrome))
    keep(cyl(0.15, 0.2, (2.15, -0.32, 2.98), m=chrome, bevel=0.03))
    keep(cyl(0.52, 0.3, (-1.75, 0.05, 3.0), m=knurl, bevel=0.03))
    keep(cyl(0.42, 0.06, (-1.75, 0.05, 3.18), m=chrome))
    keep(box((0.9, 0.62, 0.08), (0.05, 0.08, 2.92), m=chrome, bevel=0.02))
    keep(cyl(0.22, 0.12, (0.85, -0.38, 2.92), m=chrome))
    # rangefinder & viewfinder windows peeking on the front edge
    keep(box((0.9, 0.05, 0.42), (-2.0, -0.77, 2.3), m=glass, bevel=0.02))
    keep(box((0.5, 0.05, 0.42), (2.05, -0.77, 2.3), m=glass, bevel=0.02))
    # lens, sticking out of the front
    keep(cyl(0.98, 0.22, (0, -0.88, 1.3), AY, m=chrome, bevel=0.02))
    keep(cyl(0.86, 0.6, (0, -1.28, 1.3), AY, m=knurl, bevel=0.01))
    keep(cyl(0.9, 0.12, (0, -1.63, 1.3), AY, m=chrome, bevel=0.01))
    keep(cyl(0.82, 0.55, (0, -1.95, 1.3), AY, m=black_paint, bevel=0.02))
    keep(cyl(0.88, 0.1, (0, -2.26, 1.3), AY, m=chrome, bevel=0.02))
    keep(cyl(0.7, 0.03, (0, -2.31, 1.3), AY, m=glass))
    # strap lugs
    keep(cyl(0.1, 0.25, (-2.88, 0, 2.0), AX, m=chrome))
    keep(cyl(0.1, 0.25, (2.88, 0, 2.0), AX, m=chrome))
    rot_z = -9
    height = 3.2

elif which == 'inkwell':
    keep(box((2.1, 2.1, 1.5), (0, 0, 0.75), m=glass, bevel=0.22, segs=6))
    keep(box((1.7, 1.7, 1.1), (0, 0, 0.62), m=ink, bevel=0.18, segs=4))
    keep(torus(0.5, 0.06, (0, 0, 1.75), m=glass))
    keep(cyl(0.5, 0.3, (0, 0, 1.6), m=glass))
    keep(torus(0.52, 0.11, (0, 0, 1.92), m=brass))
    keep(cyl(0.46, 0.02, (0, 0, 1.6), m=ink))
    # hinged brass lid lying open
    lid = keep(cyl(0.68, 0.1, (0.95, 0.55, 1.92), (0, R(-70), R(30)), m=brass, bevel=0.03))
    keep(sphere(0.12, (0.62, 0.36, 2.02), m=brass))
    rot_z = 14
    height = 2.2

elif which == 'compass':
    keep(cyl(1.4, 0.3, (0, 0, 0.15), m=brass, bevel=0.1))
    keep(torus(1.3, 0.11, (0, 0, 0.36), m=brass))
    bpy.ops.mesh.primitive_circle_add(vertices=96, radius=1.22, fill_type='NGON', location=(0, 0, 0.31))
    dp = bpy.context.object
    dm = bpy.data.materials.new('dialtex'); dm.use_nodes = True
    dn = dm.node_tree.nodes; db = dn['Principled BSDF']; db.inputs['Roughness'].default_value = 0.55
    it = dn.new('ShaderNodeTexImage'); it.image = bpy.data.images.load('/home/claude/render/dial.png')
    tc2 = dn.new('ShaderNodeTexCoord'); mp2 = dn.new('ShaderNodeMapping')
    mp2.inputs['Scale'].default_value = (1 / 2.44, 1 / 2.44, 1); mp2.inputs['Location'].default_value = (0.5, 0.5, 0)
    dm.node_tree.links.new(tc2.outputs['Object'], mp2.inputs['Vector']); dm.node_tree.links.new(mp2.outputs['Vector'], it.inputs['Vector'])
    dm.node_tree.links.new(it.outputs['Color'], db.inputs['Base Color'])
    assign(dp, dm); keep(dp)
    # needle: red north, dark south
    n = keep(cone(0.075, 0.0, 0.98, (0, 0.47, 0.345), (R(-90), 0, 0), m=red_enamel, verts=4)); n.scale = (1, 0.35, 1)
    sn = keep(cone(0.075, 0.0, 0.98, (0, -0.47, 0.345), (R(90), 0, 0), m=chrome, verts=4)); sn.scale = (1, 0.35, 1)
    for o in (n, sn):
        for p_ in o.data.polygons: p_.use_smooth = False
    keep(cyl(0.06, 0.07, (0, 0, 0.37), m=brass, bevel=0.02))
    gl = keep(sphere(1.24, (0, 0, 0.36), scale=(1, 1, 0.07), m=glass))
    # bail ring at the top
    keep(cyl(0.18, 0.3, (0, 1.5, 0.24), AY, m=brass))
    keep(torus(0.32, 0.06, (0, 1.82, 0.08), m=brass))
    rot_z = -18
    height = 0.6

elif which == 'candle':
    keep(cyl(1.75, 0.1, (0, 0, 0.05), m=brass, bevel=0.04))
    keep(torus(1.7, 0.09, (0, 0, 0.12), m=brass))
    keep(cyl(0.72, 0.35, (0, 0, 0.27), m=brass, bevel=0.06))
    keep(torus(0.45, 0.08, (2.05, 0, 0.12), m=brass))
    keep(box((0.5, 0.2, 0.06), (1.72, 0, 0.12), m=brass, bevel=0.02))
    c = keep(cyl(0.5, 2.6, (0, 0, 1.75), m=wax, bevel=0.06))
    # melted top and a few drips
    keep(torus(0.45, 0.07, (0, 0, 3.04), m=wax))
    for a, l in ((0.4, 0.9), (2.1, 1.5), (3.9, 0.6), (5.2, 1.1)):
        d = keep(sphere(0.09, (math.cos(a) * 0.5, math.sin(a) * 0.5, 3.0 - l / 2), scale=(1, 1, l * 4), m=wax))
    keep(cyl(0.025, 0.3, (0, 0, 3.15), m=wick, verts=12))
    keep(sphere(0.12, (0, 0, 3.48), scale=(1, 1, 2.6), m=flame))
    fl = bpy.data.lights.new('flame', 'POINT'); fl.energy = 4; fl.color = (1, 0.6, 0.25); fl.shadow_soft_size = 0.05
    fo = bpy.data.objects.new('flame', fl); s.collection.objects.link(fo); fo.location = (0, 0, 3.5)
    rot_z = 0
    height = 3.6

# Rotate the whole object into its pose on the table (lighting stays fixed)
pivot = bpy.data.objects.new('pivot', None); s.collection.objects.link(pivot)
for o in parts: o.parent = pivot
fl = bpy.data.objects.get('flame')
if fl: fl.parent = pivot
pivot.rotation_euler = (0, 0, R(rot_z))
bpy.context.view_layer.update()

# Frame: object bounds + room for the shadow (falls toward bottom-right)
xs, ys = [], []
for o in parts:
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c); xs.append(w.x); ys.append(w.y)
pad = 0.35
sx = -SUN_DIR.x / SUN_DIR.z * height; sy = -SUN_DIR.y / SUN_DIR.z * height
x0, x1 = min(xs) - pad + min(0, sx), max(xs) + pad + max(0, sx)
y0, y1 = min(ys) - pad + min(0, sy), max(ys) + pad + max(0, sy)
cx, cy, w, h = (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0
camera(cx, cy, w, h, ppu=60 if QUICK else 110)
s.camera.data.sensor_fit = 'HORIZONTAL' if w >= h else 'VERTICAL'
render_passes(which, parts)
info = {'cx': cx, 'cy': cy, 'w': w, 'h': h}
json.dump(info, open(f'{OUT}/{which}.json', 'w'))
print('INFO', which, info)
