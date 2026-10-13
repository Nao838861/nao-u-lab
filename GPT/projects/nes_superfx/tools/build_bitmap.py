"""ABI2直接表示の段階ROMと塗りつぶし立方体ROMを構築する。"""
import argparse,hashlib,json,math,shutil,struct,subprocess,urllib.request
from pathlib import Path
from build_cube import ROOT,geometry,CASFX_HASH,CASFX_REV

DEMO=ROOT/'demos/bitmap/v001'
FONT={
 '0':['111','101','101','101','111'],'1':['010','110','010','010','111'],
 '2':['111','001','111','100','111'],'3':['111','001','111','001','111'],
 '4':['101','101','111','001','001'],'5':['111','100','111','001','111'],
 '6':['111','100','111','101','111'],'7':['111','001','001','001','001'],
 '8':['111','101','111','101','111'],'9':['111','101','111','001','111'],
 'N':['101','111','111','111','101'],'S':['111','100','111','001','111'],
 '=':['000','111','000','111','000'],
}


def hud(count,edge):
    data=bytearray()
    for row,text in enumerate([f'N={count:02d}',f'S={edge:02d}']):
        for col,c in enumerate(text):
            data.extend([215+row*8,ord(c),0,8+col*8])
    return data


def positions(count,half):
    rx=math.ceil(1.42*half);ry=math.ceil(1.56*half)
    w=2*rx+2;h=2*ry+2;cols=256//w;rows=240//h
    if count>min(cols*rows,448): raise ValueError(f'non-overlapping grid capacity {min(cols*rows,448)}')
    if count==1:return [(128,120,120-ry,2*ry+1)]
    return [((i%cols)*w+w//2,(i//cols)*h+h//2,(i//cols)*h+h//2-ry,2*ry+1) for i in range(count)]


def spread_positions(count,half):
    # Fill the screen evenly, leaving the bottom 28 pixels for the count/size HUD.
    width,height=256,212
    rx=math.ceil(1.42*half);ry=math.ceil(1.56*half)
    maxcols=width//(2*rx+2);maxrows=height//(2*ry+2)
    candidates=[]
    for rows in range(1,min(count,maxrows)+1):
        cols=math.ceil(count/rows)
        if cols>maxcols:continue
        aspect=(width/cols)/(height/rows)
        score=abs(math.log(aspect))+.25*(cols*rows-count)/count
        candidates.append((score,rows))
    if not candidates:raise ValueError('spread layout does not fit')
    rows=min(candidates)[1]
    base,extra=divmod(count,rows)
    result=[]
    for row in range(rows):
        columns=base+(row<extra)
        cy=round((row+.5)*height/rows)
        for col in range(columns):
            cx=round((col+.5)*width/columns)
            result.append((cx,cy,cy-ry,2*ry+1))
    return result


def faces(phase):
    # Rotation Y then X; back-face cull by transformed outward normal z.
    theta=phase*2*math.pi/64
    # each axis chooses the front-facing side, and gets one of the 3 requested colors.
    z=(-math.sin(theta)*math.cos(.5),math.sin(.5),math.cos(theta)*math.cos(.5))
    result=[]
    for axis,color in [(0,2),(1,1),(2,3)]:
        side=1 if z[axis]<0 else 0
        other=[a for a in range(3) if a!=axis]
        verts=[]
        for a,b in [(0,0),(1,0),(1,1),(0,1)]:
            verts.append((side<<axis)|(a<<other[0])|(b<<other[1]))
        result.append(color)
        for i in range(4): result.extend([0x8040+4*verts[i],0x8040+4*verts[(i+1)%4]])
    return result


def build(kind='pattern',mode=3,count=1,half=44,spread=False,renderer='original'):
    if mode not in (1,2,3): raise ValueError('mode must be 1..3')
    if not 1<=half<=64 or not 1<=count<=448: raise ValueError('half must be 1..64, count 1..448')
    if kind=='solid' and mode!=3: raise ValueError('solid renderer requires full-screen mode 3')
    if spread and kind!='interactive':raise ValueError('--spread requires --kind interactive')
    name=('interactive_v003' if renderer=='fast' else ('interactive_v002' if spread else 'interactive_v001')) if kind=='interactive' else (f'bitmap_{mode}' if kind=='pattern' else f'{"fast" if renderer=="fast" else "solid"}_{half}_{count}')
    out=ROOT/'build/bitmap'/name;out.mkdir(parents=True,exist_ok=True)
    include=ROOT/'.cache/casfx'
    include.mkdir(parents=True,exist_ok=True)
    macro=include/'casfx.inc'
    if not macro.exists():
        urllib.request.urlretrieve(f'https://raw.githubusercontent.com/ARM9/casfx/{CASFX_REV}/gsu/casfx.inc',macro)
    if hashlib.sha256((include/'casfx.inc').read_bytes()).hexdigest()!=CASFX_HASH:raise RuntimeError('casfx hash')
    source=DEMO/('pattern.s' if kind=='pattern' else 'solid.s')
    if renderer=='fast' and kind!='pattern':source=ROOT/'demos/polygon/v001/solid_fast.s'
    subprocess.run(['ca65','-I',str(include),'-o',str(out/'gsu.o'),str(source)],check=True)
    (out/'gsu.cfg').write_text('MEMORY {G:start=$9c00,size=$400,file=%O,fill=yes,fillval=$01;}\nSEGMENTS {GSU:load=G,type=ro;}\n')
    subprocess.run(['ld65','-C',str(out/'gsu.cfg'),'-o',str(out/'gsu.bin'),'-Ln',str(out/'gsu.lbl'),str(out/'gsu.o')],check=True)
    payload=bytearray(8192);payload[0x1c00:]= (out/'gsu.bin').read_bytes()
    vertices,_,matrices=geometry()
    (out/'matrices.bin').write_bytes(b''.join(struct.pack('<6h',*m) for m in matrices))
    (out/'faces.bin').write_bytes(b''.join(struct.pack('<27H',*faces(i)) for i in range(64)))
    vertices=[tuple(half if x>0 else -half for x in v) for v in vertices]
    payload[:48]=b''.join(struct.pack('<hhh',*v) for v in vertices)
    payload[0x100:0x102]=struct.pack('<H',count)
    if kind!='pattern':
        objects=positions(count,half)
        payload[0x200:0x200+count*8]=b''.join(struct.pack('<4H',*p) for p in objects)
    (out/'payload.bin').write_bytes(payload)
    width,height={1:(128,128),2:(256,64),3:(256,240)}[mode]
    (out/'config.inc').write_text(f'KIND={int(kind!="pattern")}\nMODE={mode}\nWIDTH={width}\nHEIGHT={height}\n')
    profiles=[]
    if kind=='interactive':
        records=json.loads((DEMO/'results/benchmark.json').read_text())['results']
        with (out/'config.inc').open('a') as f:
            f.write(f'INTERACTIVE=1\nPROFILE_COUNT={len(records)}\n')
        for i,r in enumerate(records):
            n,h=r['count_at_30fps'],r['half']
            verts=[tuple(h if x>0 else -h for x in v) for v in vertices]
            objects=spread_positions(n,h) if spread else positions(n,h)
            data=b''.join(struct.pack('<hhh',*v) for v in verts)+struct.pack('<H',n)
            data+=b''.join(struct.pack('<4H',*p) for p in objects)
            (out/f'profile_{i}.bin').write_bytes(data)
            (out/f'hud_{i}.bin').write_bytes(hud(n,h*2))
            profiles.append({'kind':'solid','width':256,'height':240,'mode':3,'count':n,'half':h,
                             'vertices':verts,'matrices':matrices,'positions':objects})
        chrdata=bytearray(8192)
        for c,rows in FONT.items():
            for y,bits in enumerate(rows):
                chrdata[4096+ord(c)*16+y+1]=int(bits,2)<<4
        (out/'hud.chr').write_bytes(chrdata)
    lines=['matrix_low: .lobytes '+','.join(f'matrix_{i}' for i in range(64)),
           'matrix_high: .hibytes '+','.join(f'matrix_{i}' for i in range(64)),
           'face_low: .lobytes '+','.join(f'face_{i}' for i in range(64)),
           'face_high: .hibytes '+','.join(f'face_{i}' for i in range(64))]
    lines += [f'matrix_{i}: .word '+','.join(str(x&65535) for x in m) for i,m in enumerate(matrices)]
    lines += [f'face_{i}: .word '+','.join(map(str,faces(i))) for i in range(64)]
    if profiles:
        for prefix in ['profile','hud']:
            lines += [f'{prefix}_low: .lobytes '+','.join(f'{prefix}_{i}' for i in range(len(profiles))),
                      f'{prefix}_high: .hibytes '+','.join(f'{prefix}_{i}' for i in range(len(profiles)))]
            lines += [f'{prefix}_{i}: .incbin "{prefix}_{i}.bin"' for i in range(len(profiles))]
    (out/'tables.inc').write_text('\n'.join(lines)+'\n')
    subprocess.run(['ca65','-I',str(out),'-o',str(out/'cpu.o'),str(DEMO/'cpu.s')],cwd=out,check=True)
    rom=out/f'{name}.nes'
    subprocess.run(['ld65','-C',str(ROOT/'demos/cube/v001/rom.cfg'),'-o',str(rom),'-Ln',str(out/'cpu.lbl'),str(out/'cpu.o')],check=True)
    meta={'kind':kind,'mode':mode,'count':count,'half':half,'width':width,'height':height,
          'vertices':vertices,'matrices':matrices,'positions':positions(count,half) if kind!='pattern' else [],
          'rom_sha256':hashlib.sha256(rom.read_bytes()).hexdigest()}
    if profiles:meta['profiles']=profiles
    if spread:meta['layout']='spread across 256x212; bottom 28 pixels reserved for HUD'
    meta['renderer']=renderer
    (out/'config.json').write_text(json.dumps(meta,indent=2)+'\n')
    return out


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--kind',choices=['pattern','solid','interactive'],default='pattern');p.add_argument('--mode',type=int,default=3)
    p.add_argument('--count',type=int,default=1);p.add_argument('--half',type=int,default=44)
    p.add_argument('--spread',action='store_true',help='対話版v002：画面全体へ均等配置')
    p.add_argument('--renderer',choices=['original','fast'],default='original')
    a=p.parse_args()
    print(build(a.kind,a.mode,a.count,a.half,a.spread,a.renderer))
