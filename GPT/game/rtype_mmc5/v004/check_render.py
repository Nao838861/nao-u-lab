"""実ROMの背景合成と、発射時点から求めた反射経路を独立に照合する。"""
import hashlib
import re
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parent

def table(name):
    text=(ROOT/'build/art.h').read_text()
    values=re.search(r'\b'+name+r'\[\]=\{([^}]*)\}',text).group(1)
    return list(map(int,values.split(',')))

def chr_tiles():
    rom=(ROOT/'rtype-mmc5-v004.nes').read_bytes()
    data=np.frombuffer(rom[16+32768:],dtype='uint8').reshape(4,64,256,2,8,1)
    planes=np.unpackbits(data,axis=-1)
    tiles=planes[:,:,:,0]+2*planes[:,:,:,1]
    return tiles

def check_background():
    tiles=chr_tiles()
    cov=np.unpackbits(np.fromfile(ROOT/'build/coverage.bin',dtype='uint8')
                      .reshape(2,64,8,1),axis=-1,bitorder='little')
    y,x=np.indices((8,8))
    diagonals=dict(zip(table('diagonal'),(x,7-x,4)))
    normal=[]
    checked=0
    for cell,(slot,attr) in enumerate(zip(table('nametable'),table('attributes'))):
        row=cell//32
        band=row//8
        base=tiles[band,attr&63,slot]
        normal.append(base+4*(attr>>6))
        if row in (8,16,24):
            # CPU IRQ and PPU fetch can straddle the boundary at any scroll X.
            assert np.array_equal(tiles[band,:62,slot],tiles[band-1,:62,slot])
        if attr&192: continue
        lamp=int(base.max()>1)
        for bank in range(2,62):
            if bank in diagonals:
                offset=y-diagonals[bank]
                assert np.array_equal(cov[lamp,bank],offset==0)
                free=abs(offset)>1
            else:
                free=cov[lamp,bank]==0
            overlay=tiles[band,bank,slot]
            assert np.array_equal(base[free],overlay[free]),(cell,bank)
            checked+=1
    digest=hashlib.sha256(np.array(normal).tobytes()).hexdigest()
    return checked,digest

def ray_attributes():
    tiles=chr_tiles()
    banks=table('diagonal')
    slots=table('nametable')
    attrs=table('attributes')
    field=np.array([0x2d,0x0f,0x16,0x2c])
    palettes=np.array([field,[0x2d,0x02,0x22,0x30],[0x2d,0x0f,0x12,0x30]])
    y,x=np.indices((8,8))
    expected={}
    for cell,(slot,attr) in enumerate(zip(slots,attrs)):
        if attr: continue
        band=cell//256
        base=tiles[band,0,slot]
        for bank,center in zip(banks,(x,7-x,4)):
            delta=y-center
            free=abs(delta)>1
            source=base[free]
            style=0 if np.any(source>=2) else 2 if 1 in source else 1
            rendered=palettes[style][tiles[band,bank,slot]]
            assert np.array_equal(rendered[free],field[source])
            assert np.all(rendered[delta==0]==(0x30 if style else 0x2c))
            if style:
                assert np.all(rendered[delta==-1]==(0x02 if style==1 else 0x12))
                assert np.all(rendered[delta==1]==(0x22 if style==1 else 0x12))
            expected[cell,bank]=bank|(style<<6)
    return expected

def check_rays():
    ceilings=table('ceilrow');floors=table('floorrow');diagonal=table('diagonal')
    kinds=(ROOT/'build/kinds.bin').read_bytes()
    attrs=ray_attributes()
    frames=wraps=bounces=0
    for line in (ROOT/'build/check/rays.txt').read_text().splitlines():
        cols=line.split()
        age,origin,height,scroll=map(int,cols[:4])
        if age==1:
            launch=scroll//8
            path=[]
            for direction in (-1,0,1):
                x,y=origin+1,height;dx,dy=1,direction
                steps=[]
                for _ in range(48):
                    world=(launch+x)%32
                    steps.append((x,y,world,diagonal[2 if dy==0 else int(dx!=dy)]))
                    if 0<=x<32:
                        nx,ny=x+dx,y+dy
                        if not ceilings[world]<=ny<=floors[world]:
                            dy=-dy;ny=y;bounces+=1
                        elif 0<=nx<32 and not ceilings[(world+dx)%32]<=ny<=floors[(world+dx)%32]:
                            dx=-dx;nx=x;bounces+=1
                        x,y=nx,ny
                path.append(steps)
        advances=age-age//4
        visible={}
        for steps in path:
            for x,y,w,bank in steps[max(0,advances-12):advances]:
                if not (0<=x<32 and x>=(scroll//8-launch)%32 and 2<=y<28):continue
                cell=y*32+w
                if kinds[cell]==128:continue
                visible.setdefault(0x5c00+cell,set()).add(attrs[cell,bank])
        actual={int(a,16):int(v,16) for a,v in (word.split(':') for word in cols[4:])}
        assert actual.keys()==visible.keys(),(age,actual.keys()^visible.keys())
        assert all(v in visible[a] for a,v in actual.items())
        frames+=1
        wraps+=scroll//8<launch
    assert frames>=200 and bounces and wraps
    return frames,wraps
