"""汎用の索引付き三角形メッシュをGSUで変換・透視・面除去・ソート・走査するROM。"""
import argparse, hashlib, json, math, struct, subprocess
from pathlib import Path
from build_bitmap import ROOT
from build_cube import CASFX_HASH

DEMO=ROOT/'demos/polygon/v001'


def matrices():
    result=[]
    for i in range(64):
        y=i*math.tau/64;p=.45+.2*math.sin(i*math.tau/64);z=.16*math.cos(i*math.tau/64)
        cy,sy,cp,sp,cz,sz=math.cos(y),math.sin(y),math.cos(p),math.sin(p),math.cos(z),math.sin(z)
        # Rz * Rx * Ry: all 9 coefficients are used by the GSU.
        a=[[cz*cy-sz*sp*sy,-sz*cp,cz*sy+sz*sp*cy],
           [sz*cy+cz*sp*sy,cz*cp,sz*sy-cz*sp*cy],
           [-cp*sy,sp,cp*cy]]
        result.append([max(-127,min(127,round(c*127))) for row in a for c in row])
    return result


def model(name,half):
    if name=='cube':
        vertices=[tuple(half if i&(1<<k) else -half for k in range(3)) for i in range(8)]
        triangles=[]
        for axis in range(3):
            other=[k for k in range(3) if k!=axis]
            for side in (0,1):
                v=[(side<<axis)|(a<<other[0])|(b<<other[1]) for a,b in [(0,0),(1,0),(1,1),(0,1)]]
                # Ensure outward winding; determinant of this quad normal is (-1)^axis.
                if (1 if axis%2==0 else -1)!=(1 if side else -1):v.reverse()
                color=[2,1,3][axis]
                triangles.extend([(color,v[0],v[1],v[2]),(color,v[0],v[2],v[3])])
    elif name=='octahedron':
        vertices=[(half,0,0),(-half,0,0),(0,half,0),(0,-half,0),(0,0,half),(0,0,-half)]
        triangles=[]
        for a in (0,1):
            for b in (2,3):
                for c in (4,5):
                    ids=[a,b,c];u=vertices[a];v=vertices[b];w=vertices[c]
                    ab=[v[k]-u[k] for k in range(3)];ac=[w[k]-u[k] for k in range(3)]
                    normal=(ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0])
                    if sum(normal[k]*u[k] for k in range(3))<0:ids.reverse()
                    triangles.append((1+len(triangles)%3,*ids))
    elif name=='icosahedron':
        t=(1+math.sqrt(5))/2
        raw=[(-1,t,0),(1,t,0),(-1,-t,0),(1,-t,0),(0,-1,t),(0,1,t),(0,-1,-t),(0,1,-t),(t,0,-1),(t,0,1),(-t,0,-1),(-t,0,1)]
        vertices=[tuple(round(x*half/t) for x in v) for v in raw]
        faces=[(0,11,5),(0,5,1),(0,1,7),(0,7,10),(0,10,11),(1,5,9),(5,11,4),(11,10,2),(10,7,6),(7,1,8),
               (3,9,4),(3,4,2),(3,2,6),(3,6,8),(3,8,9),(4,9,5),(2,4,11),(6,2,10),(8,6,7),(9,8,1)]
        triangles=[(1+i%3,*f) for i,f in enumerate(faces)]
    else:raise ValueError(name)
    return vertices,triangles


def objects(count,half,scene):
    # All objects transform independently; input is camera-space position + phase offset.
    def halton(index,base):
        value=0;fraction=1
        while index:
            fraction/=base;value+=fraction*(index%base);index//=base
        return value
    result=[]
    for i in range(count):
        # Prefix-stable, uniform camera coverage: increasing count only adds objects.
        sx=halton(i+1,2)*256-128;sy=halton(i+1,3)*212-106
        if scene=='overlap':sx*=.5;sy*=.5
        if scene=='clipped':sx*=1.45;sy*=1.45
        depth=(176+(i*37)%96) if scene!='near' else 52+(i*29)%64
        result.append((round(sx*depth/128),round(sy*depth/128),depth,(i*11)%64))
    return result


def build(count=8,half=16,scene='spread',mesh='cube',renderer='fast',multiplier_fast=False,clock_select=0,hardware_clear=False,reference_mhz=25):
    if not 1<=count<=128 or not 1<=half<=64:raise ValueError('count=1..128, half=1..64')
    if renderer=='baseline' and count>64:raise ValueError('baseline span work RAM limits object list to 64')
    name=f'{renderer}_{mesh}_{scene}_h{half}_n{count}'+f'_c{clock_select}m{int(multiplier_fast)}'
    if hardware_clear:name+='_fill'
    if reference_mhz!=25:
        if reference_mhz!=50:raise ValueError('reference_mhz must be 25 or 50')
        name+='_50M'
    out=ROOT/'build/polygon'/name;out.mkdir(parents=True,exist_ok=True)
    if hashlib.sha256((ROOT/'.cache/casfx/casfx.inc').read_bytes()).hexdigest()!=CASFX_HASH:raise RuntimeError('casfx hash')
    source=DEMO/('gsu_bresenham.s' if renderer=='baseline' else 'gsu.s')
    subprocess.run(['ca65',*(['-D','HW_CLEAR=1'] if hardware_clear else []),'-I',str(ROOT/'.cache/casfx'),'-I',str(DEMO),'-o',str(out/'gsu.o'),str(source)],check=True)
    (out/'gsu.cfg').write_text('MEMORY {G:start=$9400,size=$c00,file=%O,fill=yes,fillval=$01;}\nSEGMENTS {GSU:load=G,type=ro,align=$200;}\n')
    subprocess.run(['ld65','-C',str(out/'gsu.cfg'),'-o',str(out/'gsu.bin'),'-Ln',str(out/'gsu.lbl'),str(out/'gsu.o')],check=True)
    vertices,triangles=model(mesh,half);poses=matrices();instances=objects(count,half,scene)
    payload=bytearray(8192)
    faceptr=0x8040+len(vertices)*6
    payload[:16]=struct.pack('<8H',count,0,0,0,len(vertices),len(triangles),0x8040,faceptr)
    vdata=b''.join(struct.pack('<3h',*v) for v in vertices)
    fdata=b''.join(struct.pack('<4H',color,*[0x8140+6*k for k in (a,b,c)]) for color,a,b,c in triangles)
    payload[0x40:0x40+len(vdata+fdata)]=vdata+fdata
    payload[0x200:0x200+count*8]=b''.join(struct.pack('<4h',o[0],o[1],o[2],(o[2]<<6)|o[3]) for o in instances)
    payload[0x600:0xa80]=b''.join(struct.pack('<9h',*m) for m in poses)
    wave=[round(24*math.sin(i*math.tau/64)) for i in range(64)]
    payload[0xa80:0xb00]=struct.pack('<64h',*wave)
    for dy in range(1,512):
        reciprocal=(1<<24)//dy
        struct.pack_into('<HH',payload,0xb00+4*dy,reciprocal&65535,reciprocal>>16)
    payload[0x1400:]=(out/'gsu.bin').read_bytes()
    (out/'payload.bin').write_bytes(payload)
    (out/'config.inc').write_text('KIND=1\nMODE=3\nWIDTH=256\nHEIGHT=240\n'+f'MULTIPLIER_FAST={int(multiplier_fast)}\nCLOCK_SELECT={clock_select}\n')
    if hardware_clear:
        with (out/'config.inc').open('a') as f:f.write('HW_CLEAR=1\n')
    if reference_mhz==50:
        with (out/'config.inc').open('a') as f:f.write('REFERENCE_MHZ=50\n')
    subprocess.run(['ca65','-I',str(out),'-o',str(out/'cpu.o'),str(DEMO/'cpu.s')],cwd=out,check=True)
    rom=out/f'{name}.nes'
    subprocess.run(['ld65','-C',str(ROOT/'demos/cube/v001/rom.cfg'),'-o',str(rom),'-Ln',str(out/'cpu.lbl'),str(out/'cpu.o')],check=True)
    config={'kind':'polygon','mode':3,'renderer':renderer,'multiplier_fast':multiplier_fast,'clock_select':clock_select,'mesh':mesh,'scene':scene,'count':count,'half':half,'width':256,'height':240,
            'vertices':vertices,'triangles':triangles,'matrices':poses,'objects':instances,'depth_motion':wave,
            'rom_sha256':hashlib.sha256(rom.read_bytes()).hexdigest()}
    (out/'config.json').write_text(json.dumps(config,indent=2)+'\n')
    if hardware_clear or reference_mhz!=25:
        config['hardware_clear']=hardware_clear;config['reference_mhz']=reference_mhz
        (out/'config.json').write_text(json.dumps(config,indent=2)+'\n')
    return out


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--count',type=int,default=8);p.add_argument('--half',type=int,default=16)
    p.add_argument('--scene',choices=['spread','overlap','clipped','near'],default='spread')
    p.add_argument('--mesh',choices=['cube','octahedron','icosahedron'],default='cube')
    p.add_argument('--renderer',choices=['baseline','fast'],default='fast')
    p.add_argument('--multiplier-fast',action='store_true');p.add_argument('--clock-select',type=int,choices=[0,1],default=0)
    p.add_argument('--hardware-clear',action='store_true');p.add_argument('--reference-mhz',type=int,choices=[25,50],default=25);a=p.parse_args()
    print(build(a.count,a.half,a.scene,a.mesh,a.renderer,a.multiplier_fast,a.clock_select,a.hardware_clear,a.reference_mhz))
