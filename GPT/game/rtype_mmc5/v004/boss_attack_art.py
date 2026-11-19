"""腹部の6姿勢を、ボス戦で切り替える2 KiBのスプライトCHRに詰める。"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent

def make_attack_page(common, planar):
    page = bytearray(common[2048:])
    # 128..213 are corridor enemies. The R-9, all Force sizes, capsules,
    # projectile effects, and cable/eye highlights keep their original IDs.
    tiles = []
    def tile_id(pixels):
        raw = planar(np.asarray(pixels,'u1').tobytes())
        if raw not in tiles:
            tiles.append(raw)
        index = tiles.index(raw)
        assert index < 86
        page[index*16:index*16+16] = raw
        return 128+index
    poses = []
    strip = np.asarray(Image.open(ROOT/'art/boss-core.png')).astype(int)
    for i in range(strip.shape[1]//24):
        crop = strip[:,24*i:24*i+24]
        r,g,b,a = crop.transpose(2,0,1)
        # Warm brow, dark throat, yellow teeth, red eye and olive cheek.
        warm = np.where(g<95,1,np.where((r>g*1.23)&(r>b*1.3),2,3))
        green = (g>=85)&(r<=g*1.14)&(g<170)&(g>b*1.35)
        a=np.where(np.maximum.reduce([r,g,b])>54,a,0)
        marks=[]
        for y in range(0,24,8):
            for x in range(0,24,8):
                region=np.s_[y:y+8,x:x+8]
                for pal,ink in [(1,np.where((a!=0)&~green,warm,0)),
                                (3,((a!=0)&green).astype(int))]:
                    block=ink[region]
                    if block.any():
                        marks.append((x,y,tile_id(block),pal))
        poses.append(marks)
    # A complete pose can be copied directly to OAM with immediate loads.
    # Bank 62 holds the twelve short routines (six shapes, hit flash on/off).
    program=bytearray(48)
    for flash in range(2):
        for i,parts in enumerate(poses):
            k=i+6*flash;addr=0xa000+len(program)
            program[k]=addr&255;program[16+k]=addr>>8;program[32+k]=len(parts)*4
            for j,(x,y,tile,pal) in enumerate(parts):
                for dest,val in enumerate((113+y,tile,2 if flash else pal,186+x)):
                    program.extend((0xa9,val,0x9d,j*4+dest,0x02))
            program.append(0x60)
    assert len(program)<8192
    (ROOT/'build/head-code.bin').write_bytes(program)
    def entries(name,groups):
        labels=[f'{name}_{i}' for i in range(len(groups))]
        lines=[f'{name}_lo: .lobytes '+','.join(labels),f'{name}_hi: .hibytes '+','.join(labels)]
        for label,group in zip(labels,groups):
            values=[v for part in group for v in part]+[255]
            lines.append(label+': .byte '+','.join(map(str,values)))
        return lines
    lines=entries('head',poses)
    from boss_bubbles import flight
    x,y=zip(*flight())
    lines+=['flight_x: .byte '+','.join(str(int(v)%256) for v in x),
            'flight_y: .byte '+','.join(map(str,y))]
    (ROOT/'build/boss-attack.inc').write_text('\n'.join(lines))
    print(f'{len(tiles)} abdominal head tiles, one sprite page')
    return page
