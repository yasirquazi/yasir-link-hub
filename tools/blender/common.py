"""Shared Blender setup for the table scene: lighting, materials, two-pass rendering.

Scale: 1 Blender unit = 100 page pixels at zoom 1. Camera is orthographic, straight down,
so every render maps cleanly onto the page. Light comes from the top-left of the frame.
"""
import bpy, math, os, sys
from mathutils import Vector

OUT = '/home/claude/render/out'
os.makedirs(OUT, exist_ok=True)
SUN_DIR = Vector((0.40, -0.48, -0.78)).normalized()  # travels toward bottom-right, downward


def reset(samples=64):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = 'CYCLES'
    s.cycles.device = 'CPU'
    s.cycles.samples = samples
    s.cycles.use_denoising = True
    s.cycles.denoiser = 'OPENIMAGEDENOISE'
    s.cycles.max_bounces = 6
    s.cycles.transparent_max_bounces = 8
    s.render.film_transparent = True
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGBA'
    s.view_settings.view_transform = 'AgX'
    s.view_settings.look = 'AgX - Medium High Contrast'
    # Warm, dim room so metals have something to reflect
    w = bpy.data.worlds.new('room'); s.world = w
    w.use_nodes = True
    nt = w.node_tree; bg = nt.nodes['Background']
    grad = nt.nodes.new('ShaderNodeTexGradient'); grad.gradient_type = 'SPHERICAL'
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Location'].default_value = (0, 0, -0.6)
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (0.05, 0.02, 0.02, 1)
    ramp.color_ramp.elements[1].color = (0.75, 0.62, 0.48, 1)
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector'])
    nt.links.new(mp.outputs['Vector'], grad.inputs['Vector'])
    nt.links.new(grad.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = 0.45
    # Key light: low warm sun from the top-left, crisp but not hard
    sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 3.2; sun.angle = math.radians(5)
    sun.color = (1.0, 0.90, 0.76)
    so = bpy.data.objects.new('sun', sun); s.collection.objects.link(so)
    so.rotation_euler = SUN_DIR.to_track_quat('-Z', 'Y').to_euler()
    # Soft top fill so the faces pointing up read
    fill = bpy.data.lights.new('fill', 'AREA'); fill.energy = 900; fill.size = 30; fill.color = (1.0, 0.86, 0.74)
    fo = bpy.data.objects.new('fill', fill); s.collection.objects.link(fo); fo.location = (-6, 6, 22)
    fo.rotation_euler = (Vector((0, 0, 0)) - fo.location).to_track_quat('-Z', 'Y').to_euler()
    return s


def table(size=60):
    """The burgundy table: catches shadows, bounces red light, invisible in the render."""
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, 0))
    p = bpy.context.object; p.name = 'table'
    p.is_shadow_catcher = True
    m = mat('table', (0.11, 0.015, 0.02), rough=0.7)
    p.data.materials.append(m)
    return p


def mat(name, color, metal=0.0, rough=0.5, coat=0.0, trans=0.0, ior=1.45, sss=0.0, emit=None, emit_str=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rough
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Transmission Weight'].default_value = trans
    b.inputs['IOR'].default_value = ior
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss
        b.inputs['Subsurface Radius'].default_value = (1.0, 0.6, 0.35)
        b.inputs['Subsurface Scale'].default_value = 0.15
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = emit_str
    return m


def bump(m, scale=40.0, strength=0.15, kind='noise', distortion=0.0, detail=6.0):
    """Add micro surface detail (leather grain, brushed brass, paper fibre)."""
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    if kind == 'voronoi':
        tex = nt.nodes.new('ShaderNodeTexVoronoi'); tex.inputs['Scale'].default_value = scale; out = tex.outputs['Distance']
    else:
        tex = nt.nodes.new('ShaderNodeTexNoise'); tex.inputs['Scale'].default_value = scale
        tex.inputs['Detail'].default_value = detail; tex.inputs['Distortion'].default_value = distortion; out = tex.outputs['Fac']
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = strength
    nt.links.new(out, bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def rough_var(m, lo, hi, scale=8.0):
    """Uneven roughness: polished where hands touch, duller elsewhere."""
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tex = nt.nodes.new('ShaderNodeTexNoise'); tex.inputs['Scale'].default_value = scale
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = lo; mr.inputs['To Max'].default_value = hi
    nt.links.new(tex.outputs['Fac'], mr.inputs['Value']); nt.links.new(mr.outputs['Result'], b.inputs['Roughness'])
    return m


def assign(obj, m):
    obj.data.materials.clear(); obj.data.materials.append(m)
    return obj


def smooth(obj, bevel=0.0, segs=3, subsurf=0):
    bpy.context.view_layer.objects.active = obj
    if bevel:
        md = obj.modifiers.new('bevel', 'BEVEL'); md.width = bevel; md.segments = segs; md.limit_method = 'ANGLE'
    if subsurf:
        md = obj.modifiers.new('sub', 'SUBSURF'); md.levels = subsurf; md.render_levels = subsurf
    for p in obj.data.polygons: p.use_smooth = True
    return obj


def cyl(r, depth, loc=(0, 0, 0), rot=(0, 0, 0), verts=64, m=None, bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object
    if m: assign(o, m)
    smooth(o, bevel=bevel)
    return o


def box(size, loc=(0, 0, 0), rot=(0, 0, 0), m=None, bevel=0.0, segs=4):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if m: assign(o, m)
    smooth(o, bevel=bevel, segs=segs)
    return o


def camera(cx, cy, w, h, ppu=120):
    """Orthographic camera straight down over a w×h frame centred at (cx, cy)."""
    s = bpy.context.scene
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = max(w, h)
    co = bpy.data.objects.new('cam', cam); s.collection.objects.link(co)
    co.location = (cx, cy, 40); co.rotation_euler = (0, 0, 0)
    cam.clip_end = 100
    s.camera = co
    s.render.resolution_x = round(w * ppu); s.render.resolution_y = round(h * ppu)
    s.render.resolution_percentage = 100
    return co


def render_passes(name, parts, shadow_ppu_scale=0.5):
    """Pass 1: the object alone. Pass 2: only the shadow it throws on the table."""
    s = bpy.context.scene
    tab = bpy.data.objects.get('table')
    # object pass: table hidden from camera, still bounces light
    s.render.filepath = f'{OUT}/{name}.png'
    if tab: tab.visible_camera = False
    bpy.ops.render.render(write_still=True)
    # shadow pass: object invisible to camera but still casting
    if tab: tab.visible_camera = True
    for o in parts: o.visible_camera = False
    rx, ry = s.render.resolution_x, s.render.resolution_y
    s.render.resolution_percentage = round(100 * shadow_ppu_scale)
    s.cycles.samples = max(24, s.cycles.samples // 2)
    s.render.filepath = f'{OUT}/{name}-shadow.png'
    bpy.ops.render.render(write_still=True)
    s.render.resolution_percentage = 100
    for o in parts: o.visible_camera = True
    print('FRAME', name, rx, ry)
