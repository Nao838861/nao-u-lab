"""GSUの実出力を独立したPythonのUV/clip/flip/透明合成で照合する。"""
import json
from pathlib import Path
import struct
import sys
from PIL import Image
from build_game import BUILD, GAME

def packet_reference(draw, meta):
    objects=[struct.unpack_from('<hh6B',draw,i*10) for i in range(meta['count'])]
    objects.sort(key=lambda d:(d[7],-d[6]))
    output=[]
    for center,bottom,w,h,asset,flags,z,priority in objects:
        if flags&128 and meta['logic']&1: continue
        aw,ah=Image.open(GAME/'assets'/f'{asset:02d}.png').size
        du=aw*256//w;dv=ah*256//h
        left=center-w//2;top=bottom-h-20
        sx=max(0,-left);sy=max(0,-top)
        width=min(256,left+w)-max(0,left);height=min(192,top+h)-max(0,top)
        if width<=0 or height<=0: continue
        u=sx*du;v=sy*dv
        if flags&16: u=aw*256-1-u;du=-du
        if flags&32: v=ah*256-1-v;dv=-dv
        v+=32768 if asset&1 else 0
        output.append(tuple(x&65535 for x in (max(0,left),max(0,top),du,dv,max(0,left),height,v,width,u,0x44+asset//2)))
    return output

def verify(directory):
    banks={i:(GAME/'assets'/f'bank{i:02x}.bin').read_bytes() for i in range(0x44,0x5a)}
    samples=list(directory.glob('frame[0-9]*.bin'))
    assert samples, f'no samples: {directory}'
    for path in samples:
        number=path.stem[5:]
        raw=(directory/f'packet{number}.bin').read_bytes()
        commands=[struct.unpack_from('<10H',raw,32+i*20) for i in range(struct.unpack_from('<H',raw)[0])]
        draw=(directory/f'draw{number}.bin').read_bytes()
        meta=json.loads((directory/f'meta{number}.json').read_text())
        expected=packet_reference(draw,meta)
        assert commands==expected, f'UV/clip packet mismatch: {path}'
        fb=bytearray(12288)
        for left,top,du,dv,x,height,v,width,u,bank in commands:
            for dy in range(height):
                vv=(v+dy*dv)&65535
                for dx in range(width):
                    uu=(u+dx*du)&65535
                    color=banks[bank][(vv&0xff00)+(uu>>8)]
                    if color==0: continue
                    px=left+dx;py=top+dy
                    addr=((px//8)*24+py//8)*16+(py&7)*2;bit=1<<(7-(px&7))
                    for plane in range(2):
                        fb[addr+plane]=(fb[addr+plane]&(~bit&255))|(bit if color&(1<<plane) else 0)
        actual=path.read_bytes()
        assert actual==fb, f'GSU pixels differ: {path}, {sum(a!=b for a,b in zip(actual,fb))} bytes'
    print(f'{directory.name}: {len(samples)} scenes, UV/clip packets and all 49,152 pixels match')

if __name__=='__main__':
    for name in (sys.argv[1:] or ['play']): verify(BUILD/name)
