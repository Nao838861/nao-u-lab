"""地面2方式を切り替える実GSU ROM。テクスチャは非表示RAMに保持する。"""
import argparse, hashlib, json, math, struct, subprocess
from pathlib import Path
from build_bitmap import ROOT, FONT
from build_cube import CASFX_HASH

DEMO = ROOT/'demos/ground/v001'
OUT = ROOT/'build/ground/v001'
VIEWS = [(0, 2.5, .05), (10, 6, .14), (18, 12, .30), (26, 36, .75)]
PALETTE = [(100, 176, 255), (12, 147, 0), (102, 102, 102), (255, 254, 255)]

def q7(x): return round(x*128)
def coeff(x): return round(x*256)

def geometry():
    rings = [[(q7(a*math.sin(i*math.tau/16)), 0, q7(b*math.cos(i*math.tau/16)))
              for i in range(16)] for a,b in [(32,44),(33,45),(45,57),(46,58)]]
    vertices = [v for ring in rings for v in ring]
    faces = []
    for lo, hi, color in [(1,2,2),(0,1,3),(2,3,3)]:
        for i in range(16):
            j=(i+1)%16
            faces.append([color,0,lo*16+i,hi*16+i,hi*16+j,lo*16+j])
    local = [(q7(1.6 if i&1 else -1.6),q7(1.6 if i&2 else .1),q7(3 if i&4 else -3)) for i in range(8)]
    vertices += local
    # A parked car serves as a world-space landmark.
    vertices += [(x+q7(38), y, z+q7(-8)) for x,y,z in local]
    for base in [64,72]:
        for axis in range(3):
            other=[k for k in range(3) if k!=axis]
            for side in (0,1):
                if axis==1 and side==0: continue
                ids=[(side<<axis)|(a<<other[0])|(b<<other[1]) for a,b in [(0,0),(1,0),(1,1),(0,1)]]
                if (1 if axis%2==0 else -1)!=(1 if side else -1): ids.reverse()
                faces.append([3 if axis==1 else (0 if axis==0 else 2),1,*[base+i for i in ids]])
    return vertices,faces,rings

def inside(x,z,ring):
    result=False
    for a,b in zip(ring,ring[1:]+ring[:1]):
        ax,az=a[0]/128,a[2]/128;bx,bz=b[0]/128,b[2]/128
        if (az>z)!=(bz>z) and x<(bx-ax)*(z-az)/(bz-az)+ax: result=not result
    return result

def texture(rings):
    result=bytearray()
    for v in range(64):
        for u in range(64):
            x,z=(u+.5)*2-64,(v+.5)*2-64
            c=1
            if inside(x,z,rings[3]) and not inside(x,z,rings[0]):
                c=2 if inside(x,z,rings[2]) and not inside(x,z,rings[1]) else 3
                # The texture alternative also shows a dashed centerline and grid.
                radial=math.sqrt((x/39)**2+(z/51)**2)
                if c==2 and abs(radial-1)<.014 and ((u+v)//3)%2==0:c=3
            elif (u*13+v*7)%47==0:c=2
            result.append(c)
    return result

def poses(view):
    back,h,pitch=VIEWS[view];result=[]
    for phase in range(64):
        t=phase*math.tau/64
        x,z=39*math.sin(t),51*math.cos(t)
        dx,dz=39*math.cos(t),-51*math.sin(t)
        length=math.hypot(dx,dz);sn,cs=dx/length,dz/length
        result.append([q7(x-back*sn),q7(z-back*cs),q7(h),coeff(cs),coeff(sn),
                       coeff(math.cos(pitch)),coeff(math.sin(pitch)),q7(x),q7(z),coeff(cs),coeff(sn)])
    return result

def rows(view):
    _,h,pitch=VIEWS[view];s,c=math.sin(pitch),math.cos(pitch);result=[]
    for y in range(192):
        q=(y-96)/128
        d=s+q*c
        forward=h*(c-q*s)/d if d>0 else 1e9
        depth=h*s+forward*c
        result.append([q7(forward),q7(h/d)] if d>0 and 0<=depth<=144 else [32767,0])
    return result

def fills(view):
    horizon=max(0,min(192,math.ceil(96-128*math.tan(VIEWS[view][2]))))
    commands=[(0,0x2800,255,0),(0x3000,0x800,255,0)]
    complete,partial=divmod(horizon,8)
    # Initial views have a horizon in the top 128 lines.
    assert horizon<128
    for xbase in [0,0x1000]:
        if complete:commands.append((xbase,complete*256,0,0))
        if partial:
            commands += [(xbase+complete*256+x*16,partial*2,0,0) for x in range(16)]
    return commands

def build(version='v001'):
    global DEMO,OUT
    if version not in ['v001','v002','v003']:raise ValueError(version)
    DEMO=ROOT/f'demos/ground/{version}';OUT=ROOT/f'build/ground/{version}'
    OUT.mkdir(parents=True,exist_ok=True)
    assert hashlib.sha256((ROOT/'.cache/casfx/casfx.inc').read_bytes()).hexdigest()==CASFX_HASH
    subprocess.run(['ca65','-g','-I',str(ROOT/'.cache/casfx'),'-o',str(OUT/'gsu.o'),str(DEMO/'gsu.s')],check=True)
    (OUT/'gsu.cfg').write_text('MEMORY {G:start=$9000,size=$1000,file=%O,fill=yes,fillval=$01;}\nSEGMENTS {GSU:load=G,type=ro,align=$200;}\n')
    subprocess.run(['ld65','-C',str(OUT/'gsu.cfg'),'-o',str(OUT/'gsu.bin'),'-Ln',str(OUT/'gsu.lbl'),str(OUT/'gsu.o')],check=True)
    metadata=None
    if version in ['v002','v003']:
        import mmc5_course
        vertices,faces,rings,metadata=mmc5_course.geometry();tex=mmc5_course.texture(rings,inside)
        if version=='v003':
            import mmc5_state
            vertices[-8:]=mmc5_state.geometry()
            metadata['car']=mmc5_state.CAR
            states=mmc5_state.route_states(mmc5_course.route())
            (OUT/'states.bin').write_bytes(b''.join(states))
            (OUT/'directions.bin').write_bytes(b''.join(struct.pack('<hh',*mmc5_state.direction(i*64)) for i in range(1024)))
            (OUT/'camera.bin').write_bytes(b''.join(struct.pack('<hhhh',q7(back),q7(h),coeff(math.cos(p)),coeff(math.sin(p))) for back,h,p in VIEWS))
    else:vertices,faces,rings=geometry();tex=texture(rings)
    payload=bytearray(8192)
    struct.pack_into('<HH',payload,0x1e,len(vertices),len(faces))
    if metadata is not None:
        struct.pack_into('<HH',payload,0x28,len(rings[0])*4,0x8300+len(rings[0])*3*12)
    vdata=b''.join(struct.pack('<3h',*v) for v in vertices)
    fdata=b''.join(struct.pack('<6H',c,flag,*[0x8600+i*6 for i in ids]) for c,flag,*ids in faces)
    assert len(vdata)<=512 and len(fdata)<=768
    payload[0x100:0x100+len(vdata)]=vdata
    payload[0x300:0x300+len(fdata)]=fdata
    payload[0x1000:]=(OUT/'gsu.bin').read_bytes()
    (OUT/'payload.bin').write_bytes(payload)
    (OUT/'texture.bin').write_bytes(bytes(tex[v*64+u] for u in range(64) for v in range(64)))
    lines=[];config={'kind':'ground','width':256,'height':192,'texture_size':64,'vertices':vertices,'faces':faces,
                      'texture':list(tex),'palette':PALETTE,'views':[]}
    for view in range(4):
        p,r,f=(mmc5_course.poses(view,VIEWS) if metadata is not None else poses(view)),rows(view),fills(view)
        if version=='v003':p=[mmc5_state.pose(s,VIEWS[view]) for s in states]
        config['views'].append({'poses':p,'rows':r,'fills':f,'camera':VIEWS[view]})
        (OUT/f'poses_{view}.bin').write_bytes(b''.join(struct.pack('<11h',*x) for x in p))
        (OUT/f'rows_{view}.bin').write_bytes(b''.join(struct.pack('<2h',*x) for x in r))
        (OUT/f'fills_{view}.bin').write_bytes(bytes([len(f)])+b''.join(struct.pack('<HHBB',*x) for x in f))
    for prefix in ['poses','rows','fills']:
        if version=='v003' and prefix=='poses':continue
        lines += [f'{prefix}_lo: .lobytes '+','.join(f'{prefix}_{i}' for i in range(4)),
                  f'{prefix}_hi: .hibytes '+','.join(f'{prefix}_{i}' for i in range(4))]
        lines += [f'{prefix}_{i}: .incbin "{prefix}_{i}.bin"' for i in range(4)]
    if version=='v003':
        lines += ['states: .incbin "states.bin"','directions: .incbin "directions.bin"','cameras: .incbin "camera.bin"']
        config['state_snapshots']=[list(s) for s in states]
    (OUT/'tables.inc').write_text('\n'.join(lines)+'\n')
    font=dict(FONT)
    font.update({'P':['110','101','110','100','100'],'T':['111','010','010','010','010'],
                 'V':['101','101','101','101','010'],'M':['101','111','111','101','101'],
                 'C':['111','100','100','100','111'],'F':['111','100','110','100','100'],
                 ' ':['000']*5})
    chrdata=bytearray(8192)
    for c,bits in font.items():
        for y,row in enumerate(bits):chrdata[4096+ord(c)*16+y+1]=int(row,2)<<4
    (OUT/'hud.chr').write_bytes(chrdata)
    subprocess.run(['ca65','-I',str(OUT),'-o',str(OUT/'cpu.o'),str(DEMO/'cpu.s')],cwd=OUT,check=True)
    rom=OUT/f'GSU_GroundCompare_{version}.nes'
    subprocess.run(['ld65','-C',str(ROOT/'demos/cube/v001/rom.cfg'),'-o',str(rom),'-Ln',str(OUT/'cpu.lbl'),str(OUT/'cpu.o')],check=True)
    config['font']=font
    if metadata is not None:
        config.update(version=version,rom_name=rom.name,course=metadata,road_rings=rings,
                      own_first_vertex=len(rings[0])*4,ground_face_count=len(rings[0])*3)
    (OUT/'config.json').write_text(json.dumps(config,indent=2)+'\n')
    print(rom)
    return OUT

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--version',choices=['v001','v002','v003'],default='v001')
    build(parser.parse_args().version)
