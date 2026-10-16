"""音ありv002から、直線・縁石・赤い車の表示を変更したv003を生成する。"""
import argparse,hashlib,json,math,shutil,struct,subprocess
from pathlib import Path
import build_racing_audio
import mmc5_course
from build_ground import inside
from build_cube import CASFX_HASH

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'build/racing/v003'


def main():
    p=argparse.ArgumentParser();p.add_argument('--cc65-bin',type=Path,required=True);a=p.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    subprocess.run([__import__('sys').executable,str(ROOT/'tools/build_racing_audio.py'),'--cc65-bin',str(a.cc65_bin)],check=True)
    base=ROOT/'build/racing/v002'
    rom=bytearray((ROOT/'releases/GSU_MMC5Racing3D_v002.nes').read_bytes())
    original=bytes(rom)
    for name in ['camera.bin','physics_grip.bin','physics_drift.bin','cpu.cfg']:
        shutil.copy2(base/name,OUT/name)
    for i,horizon in enumerate([88,72,56,0]):
        commands=[(0,0x2800,255,0),(0x3000,0x800,255,0)]
        if horizon:
            commands += [(x,horizon//8*256,255,255) for x in [0,0x1000]]
        data=bytes([len(commands)])+b''.join(struct.pack('<HHBB',*c) for c in commands)
        (OUT/f'fills_{i}.bin').write_bytes(data)
    include=ROOT/'.cache/casfx'
    assert hashlib.sha256((include/'casfx.inc').read_bytes()).hexdigest()==CASFX_HASH
    (OUT/'gsu.cfg').write_text('MEMORY {G:start=$9000,size=$1000,file=%O,fill=yes,fillval=$01;} SEGMENTS {GSU:load=G,type=ro,align=$200;}')
    subprocess.run([str(a.cc65_bin/'ca65'),'-g','-I',str(include),str(ROOT/'demos/racing/v003/gsu.s'),'-o',str(OUT/'gsu.o')],check=True)
    subprocess.run([str(a.cc65_bin/'ld65'),'-C',str(OUT/'gsu.cfg'),str(OUT/'gsu.o'),'-o',str(OUT/'gsu.bin')],check=True)
    rings,meta=mmc5_course.road();ids=meta['selected_indices'];points=meta['source_centerline'];n=len(ids)
    # The reduced mesh keeps each curved section, and collapses straight runs.
    straight=[]
    for i,first in enumerate(ids):
        last=ids[(i+1)%n];span=[];j=first
        while j!=last:
            span.append(j);j=(j+1)%len(points)
        error=max(mmc5_course.distance(points[k],points[first],points[last]) for k in span)
        straight.append(len(span)>1 and error<3)
    colors=[1 if straight[i] else 0x30 for i in range(n)]
    assert any(straight) and any(c==0x30 for c in colors)
    for bank in [1,2]:
        at=16+bank*8192
        for edge in [1,2]:
            for i,c in enumerate(colors):struct.pack_into('<H',rom,at+0x300+(edge*n+i)*12,c)
        for face in range(5):struct.pack_into('<H',rom,at+0x300+(3*n+face)*12,0x20 if face==3 else 0)
        rom[at+0x1000:at+0x2000]=(OUT/'gsu.bin').read_bytes()
    # Apply the same segment materials to the alternate ground texture.
    tex=[]
    for v in range(64):
        for u in range(64):
            x,z=(u+.5)*2-64,(v+.5)*2-64;c=1
            if inside(x,z,rings[3]) and not inside(x,z,rings[0]):
                if inside(x,z,rings[2]) and not inside(x,z,rings[1]):c=2
                else:
                    source=(x*5+320,z*5+320)
                    nearest=min(range(n),key=lambda i:mmc5_course.distance(source,points[ids[i]],points[ids[(i+1)%n]]))
                    if straight[nearest]:c=1
                    else:
                        first,last=points[ids[nearest]],points[ids[(nearest+1)%n]]
                        dx,dz=last[0]-first[0],last[1]-first[1]
                        along=((source[0]-first[0])*dx+(source[1]-first[1])*dz)/math.hypot(dx,dz)
                        c=3 if math.floor(along/16)%2 else 0
            elif (u*13+v*7)%47==0:c=2
            tex.append(c)
    rom[16+3*8192:16+3*8192+4096]=bytes(tex[v*64+u] for u in range(64) for v in range(64))
    subprocess.run([str(a.cc65_bin/'ca65'),'-g','-I',str(OUT),str(ROOT/'demos/racing/v003/cpu.s'),'-o',str(OUT/'cpu.o')],cwd=OUT,check=True)
    subprocess.run([str(a.cc65_bin/'ld65'),'-C',str(OUT/'cpu.cfg'),str(OUT/'cpu.o'),'-o',str(OUT/'cpu.bin'),'-Ln',str(OUT/'cpu.lbl')],check=True)
    rom[16:16+8192]=(OUT/'cpu.bin').read_bytes()
    assert rom[16+4*8192:]==original[16+4*8192:]
    name='GSU_MMC5Racing3D_v003.nes';(ROOT/'releases'/name).write_bytes(rom);(OUT/name).write_bytes(rom)
    result={'version':'003','rom':name,'rom_sha256':hashlib.sha256(rom).hexdigest(),
            'base_sha256':hashlib.sha256(original).hexdigest(),'straight_segments':[i for i,s in enumerate(straight) if s],
            'edge_materials':colors,'curb_geometry':{'subdivisions':4,'colors':[0,3],'group_culling':'camera-space conservative AABB'},'palette':['red','green','gray','white'],'sky_palette':['shared red','green','white','blue'],
            'sky_rows':[88,72,56,0],'requires_sky_palette_extension':True,'rear_material':'GSU native checkerboard red/gray',
            'unchanged':'PRG banks 4..127 and CHR; physics and audio preserved'}
    (ROOT/'releases/racing_3d_v003.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))


if __name__=='__main__':main()
