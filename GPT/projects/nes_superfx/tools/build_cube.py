"""ABI1を変更しない64x48ワイヤーフレーム立方体ROMを生成する。"""
import hashlib
import json
import math
import shutil
import struct
import subprocess
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DEMO=ROOT/'demos/cube/v001'
BUILD=ROOT/'build/cube_v001'
CASFX_REV='d0827fb5f4ba8d5fb26b4de3fa1e3a79a6fbc1ed'
CASFX_HASH='7d2746058db14658b8bcc6bb9f140602cfb08106b7e74e0d80daf2cf11a94567'


def geometry():
    vertices=[tuple(14 if i&(1<<axis) else -14 for axis in range(3)) for i in range(8)]
    edges=[(i,i|(1<<axis),(3,2,1)[axis]) for i in range(8) for axis in range(3) if not i&(1<<axis)]
    matrices=[]
    for frame in range(64):
        yaw=frame*2*math.pi/64
        pitch=0.5
        coefficients=(math.cos(yaw),0,math.sin(yaw),
                      math.sin(pitch)*math.sin(yaw),math.cos(pitch),-math.sin(pitch)*math.cos(yaw))
        matrices.append([max(-127,min(127,round(c*127))) for c in coefficients])
    return vertices,edges,matrices


def projected(matrix,vertices):
    return [tuple((sum(vertex[k]*matrix[axis*3+k] for k in range(3))>>7)+(32,24)[axis]
                  for axis in range(2)) for vertex in vertices]


def expected_bitmap(frame):
    vertices,edges,matrices=geometry()
    xy=projected(matrices[frame],vertices)
    pixels=[[0]*64 for _ in range(48)]
    for start,end,color in edges:
        x,y=xy[start]; x1,y1=xy[end]
        dx=abs(x1-x); sx=1 if x<x1 else -1
        dy=-abs(y1-y); sy=1 if y<y1 else -1
        error=dx+dy
        while True:
            assert 0<=x<64 and 0<=y<48
            pixels[y][x]=color
            if x==x1 and y==y1: break
            twice=error*2
            if twice>=dy: error+=dy; x+=sx
            if twice<=dx: error+=dx; y+=sy
    return xy,pixels


def mosaic_tile(pixels,x,y):
    return pixels[y][x]|pixels[y][x+1]<<2|pixels[y+1][x]<<4|pixels[y+1][x+1]<<6


def main():
    BUILD.mkdir(parents=True,exist_ok=True)
    include=ROOT/'.cache/casfx'
    include.mkdir(parents=True,exist_ok=True)
    macro=include/'casfx.inc'
    if not macro.exists():
        local=ROOT.parent/'monosh_fx2/.cache/casfx/gsu/casfx.inc'
        if local.exists(): shutil.copy2(local,macro)
        else: urllib.request.urlretrieve(f'https://raw.githubusercontent.com/ARM9/casfx/{CASFX_REV}/gsu/casfx.inc',macro)
    if hashlib.sha256(macro.read_bytes()).hexdigest()!=CASFX_HASH: raise RuntimeError('casfxの版が異なる')
    vertices,edges,matrices=geometry()
    (BUILD/'matrices.bin').write_bytes(b''.join(struct.pack('<6h',*m) for m in matrices))
    (BUILD/'model.bin').write_bytes(b''.join(struct.pack('<hhh',*v) for v in vertices))
    (BUILD/'edges.bin').write_bytes(b''.join(struct.pack('<HHH',0x1100+a*4,0x1100+b*4,c) for a,b,c in edges))
    lines=['matrix_low: .lobytes '+','.join(f'matrix_{i}' for i in range(64)),
           'matrix_high: .hibytes '+','.join(f'matrix_{i}' for i in range(64))]
    lines += [f'matrix_{i}: .word '+','.join(str(x&65535) for x in matrix) for i,matrix in enumerate(matrices)]
    (BUILD/'matrices.inc').write_text('\n'.join(lines)+'\n')
    chrdata=bytearray()
    for tile in range(256):
        for plane in range(2):
            for row in range(8):
                byte=0
                for col in range(8):
                    shift=(0 if row<4 else 4)+(0 if col<4 else 2)
                    byte|=((tile>>(shift+plane))&1)<<(7-col)
                chrdata.append(byte)
    (BUILD/'mosaic.chr').write_bytes(chrdata+bytes(4096))
    for name,shift in [('top0',0),('top1',1),('bottom0',4),('bottom1',5)]:
        (BUILD/f'{name}.bin').write_bytes(bytes((((value>>7)&1)|(((value>>6)&1)<<2))<<shift for value in range(256)))
    glyphs={'G':['111','100','101','101','111'],'S':['111','100','111','001','111'],
            'U':['101','101','101','101','111'],'C':['111','100','100','100','111'],
            'B':['110','101','110','101','110'],'E':['111','100','110','100','111'],' ':['000']*5}
    header=[[0]*64 for _ in range(8)]
    text='GSU CUBE'; start=(64-(len(text)*4-1))//2
    for index,char in enumerate(text):
        for y,row in enumerate(glyphs[char]):
            for x,bit in enumerate(row): header[y+2][start+index*4+x]=3 if bit=='1' else 0
    (BUILD/'header.bin').write_bytes(bytes(mosaic_tile(header,x,y) for y in range(0,8,2) for x in range(0,64,2)))
    subprocess.run(['ca65','-I',str(include),'-o',str(BUILD/'gsu.o'),str(DEMO/'gsu.s')],check=True)
    subprocess.run(['ld65','-C',str(DEMO/'gsu.cfg'),'-o',str(BUILD/'gsu.bin'),'-Ln',str(BUILD/'gsu.lbl'),str(BUILD/'gsu.o')],check=True)
    subprocess.run(['ca65','-I',str(BUILD),'-o',str(BUILD/'cpu.o'),str(DEMO/'cpu.s')],cwd=BUILD,check=True)
    rom=BUILD/'GSU_Cube_v001.nes'
    subprocess.run(['ld65','-C',str(DEMO/'rom.cfg'),'-o',str(rom),'-Ln',str(BUILD/'cube.lbl'),str(BUILD/'cpu.o')],check=True)
    metadata={'vertices':vertices,'edges':edges,'matrices':matrices,'projection':'orthographic Q0.7, GSU signed MULT + ASR',
              'casfx_revision':CASFX_REV,'casfx_sha256':CASFX_HASH,'rom_sha256':hashlib.sha256(rom.read_bytes()).hexdigest()}
    (BUILD/'model.json').write_text(json.dumps(metadata,indent=2)+'\n')
    releases=ROOT/'releases'; releases.mkdir(exist_ok=True)
    shutil.copy2(rom,releases/rom.name)
    print(f'ROM: {releases/rom.name} ({rom.stat().st_size} bytes)')


if __name__=='__main__': main()
