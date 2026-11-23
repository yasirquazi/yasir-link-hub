"""Parchment map sheet. Usage: python paper.py landscape|portrait"""
import sys, math, bpy
sys.path.insert(0, '/home/claude/render')
from common import *
from mathutils import noise, Vector

orient = sys.argv[-1]
W, H = (18.0, 12.4) if orient == 'landscape' else (11.0, 16.4)
s = reset(samples=20)
table()

# Sheet: dense grid so it can warp, fold and curl
bpy.ops.mesh.primitive_grid_add(x_subdivisions=int(W * 14), y_subdivisions=int(H * 14), size=1)
p = bpy.context.object; p.name = 'paper'
p.scale = (W, H, 1); bpy.ops.object.transform_apply(scale=True)


def smooth01(t):
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)


for v in p.data.vertices:
    x, y = v.co.x, v.co.y
    u, w = x / W + 0.5, y / H + 0.5
    z = 0.04
    # broad waviness of a sheet that's been handled
    z += 0.07 * noise.noise(Vector((x * 0.22, y * 0.22, 1.3)))
    z += 0.025 * noise.noise(Vector((x * 0.7, y * 0.7, 4.1)))
    # map folds: a ridge down the middle, a valley across
    z += 0.05 * math.exp(-((u - 0.5) / 0.012) ** 2)
    z -= 0.035 * math.exp(-((w - 0.5) / 0.014) ** 2)
    # corners curl up a little
    for cu, cw, amt in ((0, 0, 0.26), (1, 1, 0.2), (1, 0, 0.12), (0, 1, 0.1)):
        d = math.hypot(u - cu, w - cw)
        z += amt * smooth01(1 - d / 0.2) ** 2
    v.co.z = max(0.005, z)
for poly in p.data.polygons: poly.use_smooth = True

# Material: warm parchment, fibre bump, torn edge cut by alpha, slight tan toward the rim (no dirt)
m = bpy.data.materials.new('parchment'); m.use_nodes = True
nt = m.node_tree; N = nt.nodes; L = nt.links
b = N['Principled BSDF']
b.inputs['Roughness'].default_value = 0.82
b.inputs['Subsurface Weight'].default_value = 0.0
b.inputs['Subsurface Radius'].default_value = (1.0, 0.7, 0.4)
b.inputs['Subsurface Scale'].default_value = 0.05
tc = N.new('ShaderNodeTexCoord')
sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Generated'], sep.inputs['Vector'])


def math_node(op, a=None, bval=None, ina=None, inb=None):
    n = N.new('ShaderNodeMath'); n.operation = op
    if ina is not None: L.new(ina, n.inputs[0])
    elif a is not None: n.inputs[0].default_value = a
    if inb is not None: L.new(inb, n.inputs[1])
    elif bval is not None: n.inputs[1].default_value = bval
    return n.outputs[0]


# distance to nearest edge, in units
dx = math_node('MULTIPLY', ina=math_node('MINIMUM', ina=sep.outputs['X'], inb=math_node('SUBTRACT', a=1.0, inb=sep.outputs['X'])), bval=W)
dy = math_node('MULTIPLY', ina=math_node('MINIMUM', ina=sep.outputs['Y'], inb=math_node('SUBTRACT', a=1.0, inb=sep.outputs['Y'])), bval=H)
d = math_node('MINIMUM', ina=dx, inb=dy)
# ragged tear: coarse bites + fine fibres
n1 = N.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 1.6; n1.inputs['Detail'].default_value = 3
n2 = N.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 14; n2.inputs['Detail'].default_value = 10; n2.inputs['Roughness'].default_value = 0.7
L.new(tc.outputs['Object'], n1.inputs['Vector']); L.new(tc.outputs['Object'], n2.inputs['Vector'])
n3 = N.new('ShaderNodeTexNoise'); n3.inputs['Scale'].default_value = 5; n3.inputs['Detail'].default_value = 4
n4 = N.new('ShaderNodeTexNoise'); n4.inputs['Scale'].default_value = 60; n4.inputs['Detail'].default_value = 4
L.new(tc.outputs['Object'], n3.inputs['Vector']); L.new(tc.outputs['Object'], n4.inputs['Vector'])
def amp(n, a): return math_node('MULTIPLY', ina=math_node('SUBTRACT', ina=n.outputs['Fac'], bval=0.5), bval=a)
tear = math_node('ADD', ina=math_node('ADD', ina=amp(n1, 0.7), inb=amp(n3, 0.38)), inb=math_node('ADD', ina=amp(n2, 0.2), inb=amp(n4, 0.07)))
edge = math_node('ADD', ina=d, inb=tear)
alpha = N.new('ShaderNodeMapRange'); alpha.inputs['From Min'].default_value = 0.16; alpha.inputs['From Max'].default_value = 0.19
L.new(edge, alpha.inputs['Value']); L.new(alpha.outputs['Result'], b.inputs['Alpha'])
# colour: two creams mottled softly, warmer and a touch deeper near the torn rim
c1 = N.new('ShaderNodeTexNoise'); c1.inputs['Scale'].default_value = 3.0; c1.inputs['Detail'].default_value = 6
L.new(tc.outputs['Object'], c1.inputs['Vector'])
ramp = N.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[0].color = (0.86, 0.70, 0.45, 1)
ramp.color_ramp.elements[1].position = 0.7; ramp.color_ramp.elements[1].color = (0.93, 0.80, 0.57, 1)
L.new(c1.outputs['Fac'], ramp.inputs['Fac'])
rim = N.new('ShaderNodeMapRange'); rim.inputs['From Min'].default_value = 0.18; rim.inputs['From Max'].default_value = 0.8
rim.inputs['To Min'].default_value = 1.0; rim.inputs['To Max'].default_value = 0.0
L.new(edge, rim.inputs['Value'])
mix = N.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'
L.new(rim.outputs['Result'], mix.inputs['Factor'])
L.new(ramp.outputs['Color'], mix.inputs['A']); mix.inputs['B'].default_value = (0.84, 0.6, 0.36, 1)
L.new(mix.outputs['Result'], b.inputs['Base Color'])
# fibres: fine stretched noise as bump
fb = N.new('ShaderNodeTexNoise'); fb.inputs['Scale'].default_value = 90; fb.inputs['Detail'].default_value = 8; fb.inputs['Distortion'].default_value = 1.5
mpn = N.new('ShaderNodeMapping'); mpn.inputs['Scale'].default_value = (1.0, 3.2, 1.0)
L.new(tc.outputs['Object'], mpn.inputs['Vector']); L.new(mpn.outputs['Vector'], fb.inputs['Vector'])
bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.18; bp.inputs['Distance'].default_value = 0.02
L.new(fb.outputs['Fac'], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
p.data.materials.append(m)

MARGIN = 0.7
camera(0, 0, W + MARGIN * 2, H + MARGIN * 2, ppu=125)
# keep the frame aspect exact
s.render.resolution_x = round((W + MARGIN * 2) * 125); s.render.resolution_y = round((H + MARGIN * 2) * 125)
s.camera.data.sensor_fit = 'HORIZONTAL' if W >= H else 'VERTICAL'
s.render.filepath = f'{OUT}/paper-{orient}.png'
import os
if os.environ.get('QUICK'): s.render.resolution_percentage = 30; s.cycles.samples = 16
bpy.ops.render.render(write_still=True)
print('FRAME paper', orient, s.render.resolution_x, s.render.resolution_y)
