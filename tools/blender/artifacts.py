"""Seven project artifacts (coin, brooch, plaque, two wax seals, locket, book).

Each one is drawn as three maps in /home/claude/art/maps (height, colour, material).
Here the height map becomes real geometry, the colour map's alpha cuts the outline,
and the same maps drive the material. Rendered straight down, lit like the desk props,
with the shadow each object throws on the paper.
Usage: python artifacts.py [slug ...]
"""
import sys, math, bpy, bmesh
import numpy as np
from PIL import Image
sys.path.insert(0, '/home/claude/render')
from common import reset, mat, OUT
from mathutils import Vector

MAPS = '/home/claude/art/maps'
S = 2.0        # the 1000-unit canvas spans 2 Blender units
FRAME = 2.3    # rendered frame, a little larger so shadows fit
RES = 480
GRID = 340

# thickness (height of a white pixel), cavity darkening, micro-surface
ART = {
    'portfolio':         dict(thick=0.12, cav=(0.34, 0.62, 0.45), micro=('noise', 90, 0.04)),
    'the-values-edge':   dict(thick=0.15, cav=(0.42, 0.62, 0.55), micro=('noise', 90, 0.03)),
    'hirein5':           dict(thick=0.14, cav=(0.26, 0.6, 0.38), micro=('noise', 90, 0.04)),
    'nox':               dict(thick=0.24, cav=(0.32, 0.56, 0.72), micro=('noise', 110, 0.12)),
    'mofad':             dict(thick=0.26, cav=(0.62, 0.5, 0.62), micro=('noise', 24, 0.04)),
    'student-portfolio': dict(thick=0.16, cav=(0.44, 0.6, 0.55), micro=('noise', 90, 0.03)),
    'fav-coin':   dict(thick=0.14, cav=(0.4, 0.6, 0.72), micro=('noise', 90, 0.03)),
    'fav-wax':    dict(thick=0.26, cav=(0.55, 0.5, 0.62), micro=('noise', 40, 0.04)),
    'fav-star':   dict(thick=0.15, cav=(0.5, 0.6, 0.7), micro=('noise', 90, 0.03)),
    'fav-shield': dict(thick=0.15, cav=(0.5, 0.6, 0.7), micro=('noise', 90, 0.03)),
    'fav-s-struck': dict(thick=0.13, cav=(0.42, 0.55, 0.7), micro=('noise', 70, 0.06)),
    'fav-s-plaque': dict(thick=0.12, cav=(0.55, 0.5, 0.66), micro=('noise', 90, 0.03)),
    'fav-s-coin':   dict(thick=0.13, cav=(0.55, 0.5, 0.66), micro=('noise', 80, 0.04)),
    'fav-s-star':   dict(thick=0.13, cav=(0.55, 0.5, 0.66), micro=('noise', 80, 0.04)),
    'fav-s-struck2': dict(thick=0.16, cav=(0.55, 0.5, 0.7), micro=('noise', 160, 0.05), sig=0.8, res=1024),
    'fav-s-baroque': dict(thick=0.17, cav=(0.45, 0.5, 0.66), micro=('noise', 160, 0.05), sig=0.8, res=1024),
    'fav-s-baroque-dark': dict(thick=0.17, cav=(0.45, 0.5, 0.66), micro=('noise', 160, 0.05), sig=0.8, res=512),
    'mk-name-plaque': dict(thick=0.15, cav=(0.45, 0.5, 0.66), micro=('noise', 160, 0.05), sig=0.8, res=1600),
    'mk-sun-coin':    dict(thick=0.16, cav=(0.55, 0.5, 0.7), micro=('noise', 160, 0.05), sig=0.8, res=1600),
    'mk-moon-coin':   dict(thick=0.16, cav=(0.55, 0.5, 0.7), micro=('noise', 160, 0.05), sig=0.8, res=1600),
    'mk-silver-seal': dict(thick=0.2, cav=(0.5, 0.5, 0.7), micro=('noise', 160, 0.05), sig=0.8, res=1600),
    'quran-flashcards':  dict(thick=0.34, cav=(0.4, 0.62, 0.6), micro=('voronoi', 46, 0.35)),
}


def load(path, mode):
    im = Image.open(path).convert(mode)
    return np.asarray(im).astype(np.float32) / 255.0


def sample(arr, u, v):
    h, w = arr.shape[:2]
    x = np.clip(u * (w - 1), 0, w - 1); y = np.clip((1 - v) * (h - 1), 0, h - 1)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int)
    x1 = np.minimum(x0 + 1, w - 1); y1 = np.minimum(y0 + 1, h - 1)
    fx = x - x0; fy = y - y0
    if arr.ndim == 3: fx = fx[:, None]; fy = fy[:, None]
    return (arr[y0, x0] * (1 - fx) * (1 - fy) + arr[y0, x1] * fx * (1 - fy) + arr[y1, x0] * (1 - fx) * fy + arr[y1, x1] * fx * fy)


def smooth_height(slug, sigma=1.4):
    a = load(f'{MAPS}/{slug}-h.png', 'L')
    r = int(sigma * 3); k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2); k /= k.sum()
    pad = np.pad(a, r, mode='edge')
    a = np.apply_along_axis(lambda m: np.convolve(m, k, 'valid'), 1, pad)
    a = np.apply_along_axis(lambda m: np.convolve(m, k, 'valid'), 0, a)
    Image.fromarray((np.clip(a, 0, 1) * 65535).astype(np.uint16)).save(f'{MAPS}/{slug}-h16.png')
    return a


def build_mesh(slug, cfg):
    H = smooth_height(slug, cfg.get('sig', 1.4))
    A = load(f'{MAPS}/{slug}-c.png', 'RGBA')[..., 3]
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=GRID, y_subdivisions=GRID, size=S, calc_uvs=True)
    ob = bpy.context.object; ob.name = slug
    me = ob.data
    bm = bmesh.new(); bm.from_mesh(me)
    uvl = bm.loops.layers.uv.active
    # vertex UVs (same for every loop of a vertex on a grid)
    vuv = {}
    for f in bm.faces:
        for l in f.loops: vuv[l.vert.index] = l[uvl].uv.copy()
    bm.verts.ensure_lookup_table()
    us = np.array([vuv[i].x for i in range(len(bm.verts))]); vs = np.array([vuv[i].y for i in range(len(bm.verts))])
    hz = sample(H, us, vs) * cfg['thick']; al = sample(A, us, vs)
    for i, vtx in enumerate(bm.verts): vtx.co.z = hz[i]
    bmesh.ops.delete(bm, geom=[bm.verts[i] for i in range(len(bm.verts)) if al[i] < 0.5], context='VERTS')
    # close the outline: drop a wall from the boundary to the paper
    edges = [e for e in bm.edges if e.is_boundary]
    for e in edges: e.smooth = False          # crisp edge between top and wall
    ret = bmesh.ops.extrude_edge_only(bm, edges=edges)
    for v in [g for g in ret['geom'] if isinstance(g, bmesh.types.BMVert)]: v.co.z = 0.0
    walls = set(g for g in ret['geom'] if isinstance(g, bmesh.types.BMFace))
    for f in bm.faces: f.smooth = f not in walls
    bm.to_mesh(me); bm.free()
    return ob


def material(slug, cfg):
    m = mat(slug, (1, 1, 1)); nt = m.node_tree; N = nt.nodes; L = nt.links
    b = N['Principled BSDF']
    uv = N.new('ShaderNodeTexCoord')

    def img(kind, colorspace):
        t = N.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(f'{MAPS}/{slug}-{kind}.png')
        t.image.colorspace_settings.name = colorspace; t.interpolation = 'Cubic'
        L.new(uv.outputs['UV'], t.inputs['Vector']); return t
    tc, tm, th = img('c', 'sRGB'), img('m', 'Non-Color'), img('h16', 'Non-Color')
    # recesses darker, raised parts bright: how polished relief really looks
    cmin, lo, hi = cfg['cav']
    mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = lo - 0.25; mr.inputs['From Max'].default_value = hi
    mr.inputs['To Min'].default_value = cmin; mr.inputs['To Max'].default_value = 1.0
    L.new(th.outputs['Color'], mr.inputs['Value'])
    mul = N.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs['Factor'].default_value = 1.0
    L.new(tc.outputs['Color'], mul.inputs['A']); L.new(mr.outputs['Result'], mul.inputs['B'])
    col = mul.outputs['Result']
    if slug == 'quran-flashcards':   # mottled, hand-worn leather
        mn = N.new('ShaderNodeTexNoise'); mn.inputs['Scale'].default_value = 7; mn.inputs['Detail'].default_value = 6
        mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'
        mr2 = N.new('ShaderNodeMapRange'); mr2.inputs['To Min'].default_value = 0.0; mr2.inputs['To Max'].default_value = 0.55
        L.new(mn.outputs['Fac'], mr2.inputs['Value']); L.new(mr2.outputs['Result'], mx.inputs['Factor'])
        L.new(col, mx.inputs['A']); mx.inputs['B'].default_value = (0.45, 0.32, 0.26, 1); col = mx.outputs['Result']
    L.new(col, b.inputs['Base Color'])
    sep = N.new('ShaderNodeSeparateColor'); L.new(tm.outputs['Color'], sep.inputs['Color'])
    L.new(sep.outputs['Red'], b.inputs['Metallic'])
    # roughness: map value, broken up a little so nothing looks plastic
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 14
    rv = N.new('ShaderNodeMapRange'); rv.inputs['To Min'].default_value = -0.06; rv.inputs['To Max'].default_value = 0.08
    L.new(nz.outputs['Fac'], rv.inputs['Value'])
    add = N.new('ShaderNodeMath'); add.operation = 'ADD'; add.use_clamp = True
    L.new(sep.outputs['Green'], add.inputs[0]); L.new(rv.outputs['Result'], add.inputs[1])
    L.new(add.outputs['Value'], b.inputs['Roughness'])
    L.new(sep.outputs['Blue'], b.inputs['Coat Weight']); b.inputs['Coat Roughness'].default_value = 0.04
    # fine relief from the sharp height map, plus micro grain
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = cfg.get('bump', 0.55); bp.inputs['Distance'].default_value = cfg['thick'] * 0.06
    L.new(th.outputs['Color'], bp.inputs['Height'])
    kind, sc, st = cfg['micro']
    if kind == 'voronoi':
        mt = N.new('ShaderNodeTexVoronoi'); mt.inputs['Scale'].default_value = sc; mo = mt.outputs['Distance']
    else:
        mt = N.new('ShaderNodeTexNoise'); mt.inputs['Scale'].default_value = sc; mt.inputs['Detail'].default_value = 8; mo = mt.outputs['Fac']
    bp2 = N.new('ShaderNodeBump'); bp2.inputs['Strength'].default_value = st
    L.new(mo, bp2.inputs['Height']); L.new(bp.outputs['Normal'], bp2.inputs['Normal'])
    L.new(bp2.outputs['Normal'], b.inputs['Normal'])
    return m


def studio(cool=False):
    """Replace the plain fill with a soft window panel overhead, so flat metal
    reflects a gradient (bright top-left, dim bottom-right) instead of one flat tone."""
    s = bpy.context.scene
    f = bpy.data.objects.get('fill')
    if f: bpy.data.objects.remove(f)
    bpy.ops.mesh.primitive_plane_add(size=30, location=(-3, 3, 14))
    pl = bpy.context.object; pl.name = 'panel'; pl.visible_camera = False; pl.visible_shadow = False
    m = bpy.data.materials.new('panel'); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission')
    tc = nt.nodes.new('ShaderNodeTexCoord'); gr = nt.nodes.new('ShaderNodeTexGradient'); gr.gradient_type = 'DIAGONAL'
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Rotation'].default_value = (0, 0, math.radians(-90))
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (0.13, 0.135, 0.15, 1) if cool else (0.16, 0.11, 0.08, 1); ramp.color_ramp.elements[1].color = (0.86, 0.9, 1.0, 1) if cool else (1.0, 0.95, 0.88, 1)
    ramp.color_ramp.elements[0].position = 0.15; ramp.color_ramp.elements[1].position = 0.85
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], gr.inputs['Vector'])
    nt.links.new(gr.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], em.inputs['Color'])
    em.inputs['Strength'].default_value = 4.5
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    pl.data.materials.append(m)


def render(slug, samples):
    cfg = ART[slug]
    s = reset(samples=samples)
    studio(cool=(slug == 'nox' or slug.startswith('fav-s') or slug.startswith('mk-')))
    sun = bpy.data.objects['sun']; sun.data.angle = math.radians(11)
    if slug == 'nox-wax':   # kept for reference: glossy black wax lighting
        # glossy black wax: a dark room overhead, with two long softboxes
        # that draw bright lines along every curve of the wax
        bpy.data.objects.remove(bpy.data.objects['panel'])
        s.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.12
        for loc, size, energy in (((-4.5, 4.5, 4.0), (9, 1.6), 900), ((5, -1.5, 3.2), (7, 1.0), 380)):
            ld = bpy.data.lights.new('strip', 'AREA'); ld.shape = 'RECTANGLE'; ld.size, ld.size_y = size; ld.energy = energy
            ld.color = (0.92, 0.94, 1.0)
            lo = bpy.data.objects.new('strip', ld); s.collection.objects.link(lo); lo.location = loc
            lo.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    fav = slug.startswith('fav') or slug.startswith('mk-')
    if not fav:   # favicons sit on nothing: no cast shadow to blur them at 16 px
        bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, 0))
        paper = bpy.context.object; paper.is_shadow_catcher = True
        paper.data.materials.append(mat('paper', (0.62, 0.5, 0.34), rough=0.8))
    ob = build_mesh(slug, cfg); ob.data.materials.append(material(slug, cfg))
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = 2.04 if fav else FRAME
    co = bpy.data.objects.new('cam', cam); s.collection.objects.link(co); co.location = (0, 0, 10); s.camera = co
    s.render.resolution_x = s.render.resolution_y = int(__import__('os').environ.get('RES_OVERRIDE') or cfg.get('res', 512 if fav else RES)); s.render.resolution_percentage = 100
    s.render.filepath = f'{OUT}/art-{slug}' + (__import__('os').environ.get('SUFFIX') or '') + '.png'
    bpy.ops.render.render(write_still=True)
    print('DONE', slug)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    samples = int(next((a[2:] for a in sys.argv[1:] if a.startswith('-s')), 48))
    for slug in (args or list(ART)):
        render(slug, samples)
