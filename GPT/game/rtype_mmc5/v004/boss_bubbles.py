"""固定軌道の泡をMMC5の背景で描く。セルごとに単体・重なりのCHRを共有する。"""
from pathlib import Path
import math
import numpy as np
ROOT=Path(__file__).resolve().parent
CAMERA=1334
COUNT=9
SPACING=5
LIFE=80

def flight():
    age=np.arange(LIFE+1)
    x=np.rint(190-age*2.375).astype(int)
    y=np.interp(x,[0,12,26,40,54,66,77,90,102,190],[80,88,95,103,107,111,113,116,117,117])
    return list(zip(x,np.rint(y+2*np.sin(age*np.pi/9)).astype(int)+16))

def membrane(age):
    yy,xx=np.mgrid[:16,:16]
    theta=(age//2%8)*math.pi/4
    u=(xx-7-.17*(yy-7.5)*math.cos(theta))/6.15;v=(yy-7.5)/6.75
    radius=np.hypot(u,v)
    arc=(np.arctan2(v,u)-theta)%(2*math.pi)
    ink=np.zeros((16,16),'u1')
    ink[(abs(radius-1)<.26)&(arc>.72)]=1
    ink[(abs(radius-1)<.16)&(arc>.76)]=3
    tipx,tipy=7+5.85*math.cos(theta),7.5+6.25*math.sin(theta)
    ink[(xx-tipx)**2+(yy-tipy)**2<=10]=2
    ink[(xx-tipx+.8)**2+(yy-tipy+1.3)**2<1.6]=3
    return ink

def prepare(planar):
    generations=[];choices={}
    points=flight()
    for t in range(LIFE+SPACING*(COUNT-1)):
        cells={}
        for k in range(COUNT):
            age=t-SPACING*k
            if not 0<=age<LIFE:continue
            x,y=points[age];ink=membrane(age)
            for py,px in zip(*np.nonzero(ink)):
                world=int(x+px-7)+CAMERA
                line=int(y+py-7)
                if world<CAMERA or world>=CAMERA+256:continue
                cell=(world//8,line//8)
                by_orb=cells.setdefault(cell,{})
                block=by_orb.setdefault(8-k,np.zeros((8,8),'u1'))
                block[line%8,world%8]=ink[py,px]
        frame={}
        for cell,orbs in cells.items():
            atlas=choices.setdefault(cell,[])
            def intern(tile):
                # The metal palette gives ring-only cells a silver shadow.
                # In cells with a red nucleus, the boss eye palette keeps
                # the same cream highlight and leaves the outer shade black.
                metal=not (tile==2).any()
                tile=np.where(tile==1,2 if metal else 0,tile).astype('u1')
                tile=planar(tile.tobytes())
                if tile not in atlas:atlas.append(tile)
                return 2+atlas.index(tile)+(192 if metal else 0)
            items=list(orbs.items())
            assert len(items)<=2
            a,tile=items[0]
            if len(items)==1:frame[cell]=(a,intern(tile))
            else:
                b,other=items[1]
                merged=np.where(other!=0,other,tile)
                frame[cell]=(a+128,intern(tile),b,intern(other),intern(merged))
        generations.append(frame)
    ordered=sorted(choices,key=lambda p:(p[1],p[0]))
    assert len(ordered)<=128
    indexed={cell:n for n,cell in enumerate(ordered)}
    chr_tiles={}
    for cell,pics in choices.items():
        slot=128+indexed[cell]
        assert len(pics)<=50
        for n,tile in enumerate(pics):chr_tiles[n+2,slot]=tile
    # Specialize the sparse cell and ownership tests into 6502 code.
    # The CPU only evaluates bubbles that reach a tile on this tick.
    # RAM addresses are reserved at reset in bubble_display.inc.
    def stores(entries,which):
        code=bytearray()
        for cell,entry in entries:
            c,r=cell;shadow=0x6400+r*32+c%32
            code.extend((0xad,shadow&255,shadow>>8,0x30,5,0xa9,entry[which],
                         0x8d,0x10+indexed[cell],0x78))
        return code
    def if_alive(owner,code):
        # LDA age[owner] / BEQ over the matching fragment.
        assert len(code)<128
        return bytes((0xad,owner,0x78,0xf0,len(code)))+code
    rom=bytearray(768);maxdraw=0
    vectors=[[],[]]
    for mode in (0,1):
        for i,(c,r) in enumerate(ordered):
            dest=r*32+c%32
            vectors[mode].append(0xa000+len(rom))
            for val,reg in ((0x20+(dest>>8),6),(dest&255,6),((128+i if mode else 0),7)):
                rom.extend((0xa9,val,0x8d,reg,0x20))
            if not mode:rom.extend((0x8d,dest&255,0x5c+(dest>>8)))
            rom.append(0x60)
    for t,frame in enumerate(generations):
        groups={}
        for cell,entry in frame.items():
            owners=(entry[0],) if len(entry)==2 else (entry[0]-128,entry[2])
            groups.setdefault(owners,[]).append((cell,entry))
        packet=bytearray()
        for owners,entries in groups.items():
            if len(owners)==1:
                packet.extend(if_alive(owners[0],stores(entries,1)))
            else:
                a,b=owners
                # Keep relative branches in range even at a long diagonal overlap.
                for first in range(0,len(entries),3):
                    group=entries[first:first+3]
                    ab=stores(group,4);only_a=stores(group,1);only_b=stores(group,3)
                    single_b=if_alive(b,only_b)
                    both_or_a=(bytes((0xad,b,0x78,0xf0,len(ab)+4))+ab+
                               bytes((0xa9,1,0xd0,len(only_a)))+only_a)
                    packet.extend(bytes((0xad,a,0x78,0xf0,len(both_or_a)+4))+
                                  both_or_a+bytes((0xa9,1,0xd0,len(single_b)))+single_b)
        packet.append(0x60)
        paint=bytearray()
        for c,r in frame:
            cell=indexed[c,r];dest=0x5c00+r*32+c%32
            paint.extend((0xad,0x10+cell,0x78,0xf0,3,0x8d,dest&255,dest>>8))
        paint.append(0x60)
        if len(rom)%8192+len(packet)+len(paint)>8192:rom.extend(bytes(8192-len(rom)%8192))
        n=len(rom);addr=0xa000+n%8192
        rom[t]=32+n//8192;rom[128+t]=addr&255;rom[256+t]=addr>>8
        draw_addr=addr+len(packet)
        rom[384+t]=draw_addr&255;rom[512+t]=draw_addr>>8
        rom.extend(packet+paint);maxdraw=max(maxdraw,len(frame))
    assert len(generations)<=128
    def table(name,data):
        return name+': .byte '+','.join(map(str,data))
    lines=[f'BUBBLE_CELLS = {len(ordered)}',f'BUBBLE_TICKS = {len(generations)}']
    for title,addresses in zip(('remove','add'),vectors):
        lines.extend([table('bub_'+title+'_lo',[a&255 for a in addresses]),
                      table('bub_'+title+'_hi',[a>>8 for a in addresses])])
    (ROOT/'build/bubble-map.inc').write_text('\n'.join(lines))
    (ROOT/'build/bubble-stream.bin').write_bytes(rom)
    print(f'Bubble stream: {len(ordered)} cells, {len(chr_tiles)} CHR tiles, peak {maxdraw}, {len(rom)} PRG bytes')
    return chr_tiles
