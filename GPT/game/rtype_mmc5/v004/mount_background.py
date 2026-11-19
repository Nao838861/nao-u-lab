"""各砲台の台座と砲身を元タイルに合成し、列転送で載せ外しできるようにする。"""
from collections import defaultdict
from pathlib import Path
import numpy as np
from PIL import Image
from turret_layout import TURRETS

def attach(data,slots,attrs,width,used,planar):
    # The wall palette supplies the steel rim even on scanlines where the
    # amber swivel loses OAM priority to the R-9 or the Force.
    rgb=np.asarray(Image.open(Path(__file__).parent/'art/actor-gun.png')).astype(int)
    r,g,b=rgb.transpose(2,0,1)
    lum=(2*r+3*g+b)//6
    upper=np.where(rgb.max(2)==0,0,np.where(lum<84,1,np.where((lum>150)|((r-b>65)&(lum>115)),3,2)))
    seen=[set(slots[b*8:min(30,b*8+9)][(attrs[b*8:min(30,b*8+9)]&63)==63].flat) for b in range(3)]
    seen[0].update(range(232,256))
    cache={};columns=defaultdict(list);bounds=[]
    for owner,(x,y,_) in enumerate(TURRETS):
        part=upper if y<100 else upper[::-1]
        tile_parts={}
        for sy,sx in zip(*np.nonzero(part)):
            wx=x-6+sx;line=y+16-(7 if y<100 else 4)+sy
            c,r=wx//8,line//8;band=r//8
            if (c,r) not in tile_parts:
                slot=int(slots[r,c]);attr=int(attrs[r,c])
                offset=((band*64+(attr&63))*256+slot)*16
                raw=np.frombuffer(data[offset:offset+16],'u1')
                planes=np.unpackbits(raw).reshape(2,8,8)
                ink=planes[0]+2*planes[1]
                if not attr:ink=np.minimum(ink,1)
                tile_parts[c,r]=ink
            tile_parts[c,r][line%8,wx%8]=part[sy,sx]
        bounds.append((min(c for c,r in tile_parts),max(c for c,r in tile_parts)))
        for (c,r),ink in tile_parts.items():
            bands=(r//8-1,r//8) if r%8==0 else (r//8,)
            raw=planar(ink.tobytes())
            key=bands,raw
            if key not in cache:
                n=next(i for i in range(256) if all(i not in seen[b] for b in bands))
                cache[key]=n
                for b in bands:
                    seen[b].add(n);used[b].add((63,n))
                    off=((b*64+63)*256+n)*16
                    data[off:off+16]=raw
            columns[c].append((owner,r,cache[key]))
    assert all(right-left<3 for left,right in bounds)
    rows=[];starts=[]
    for c in range(width):
        starts.append(len(rows))
        rows.extend(columns[c])
    starts.append(len(rows))
    assert len(rows)<256
    def line(name,seq):return name+': .byte '+','.join(str(int(v)) for v in seq)
    text=[line('mount_col_start',starts)]
    text.extend(line('mount_'+name,vals) for name,vals in zip(('owner','row','tile'),zip(*rows)))
    text.append('.segment "CODE"')
    for name,vals in zip(('left','right'),zip(*bounds)):text.append(line('mount_'+name,vals))
    out=Path(__file__).resolve().parent/'build'
    (out/'mount-background.inc').write_text('\n'.join(text))
    # Independent emulator checks use the same world addresses as the PPU.
    (out/'mount-cells.csv').write_text('\n'.join(f'{c},{r},{owner},{tile}' for c in range(width) for owner,r,tile in columns[c]))
