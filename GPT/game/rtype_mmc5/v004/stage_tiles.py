"""長いステージをMMC5の走査線区間別にタイル化する。"""
from collections import Counter
import numpy as np
from tile_palette import colors, match, METAL, FITTING
from PIL import Image

def representatives(tiles, limit):
    counts=Counter(tiles)
    unique=list(counts)
    if len(unique)<=limit:
        return unique,{t:i for i,t in enumerate(unique)}
    a=np.frombuffer(b''.join(unique),'u1').reshape(-1,64).astype('int16')
    weights=np.sqrt(list(counts.values()))
    best=np.full(len(a),1e8)
    nearest=np.zeros(len(a),int)
    selected=[]
    choice=int(weights.argmax())
    for i in range(limit):
        selected.append(unique[choice])
        diff=abs(a-a[choice])
        cost=(diff*diff).sum(1)
        nearest[cost<best]=i
        best=np.minimum(best,cost)
        choice=int(np.argmax(best*weights))
    return selected,dict(zip(unique,nearest))

def make_map(path,indicator_dots):
    rgb=np.array(Image.open(path).convert('RGB'))
    width=(rgb.shape[1]+7)//8
    screen=np.zeros((240,8*width,3),'uint8')
    screen[16:224]=np.pad(rgb,((0,0),(0,8*width-rgb.shape[1]),(0,0)),mode='edge')
    lamps=indicator_dots(screen)
    cells=[];flags=[];palettes=[]
    metal=(3,colors(0x2d,METAL))
    fitting=(2,colors(0x2d,FITTING))
    for y in range(30):
        for x in range(width):
            sy=slice(y*8,y*8+8);sx=slice(x*8,x*8+8)
            t=screen[sy,sx].astype(float);r,g,b=t.transpose(2,0,1)
            wall=y<2 or y>=28 or np.count_nonzero((r>95)&(r>b*1.03))>=2
            if wall:
                # The final chamber exchanges BG2 for the boss skin. All
                # resident hull cells there use the permanent metal palette.
                choices=(metal,fitting) if x*8+7<1130 and 2<=y<28 else (metal,)
                palette,ids=match(t,choices,1+5*((r-g>33)&(r-b>45)))
                # Outside the playfield the black border is always opaque.
                if y<2 or y>=28:ids.fill(1)
            else:
                palette=0
                ids=np.where(lamps[sy,sx],lamps[sy,sx],t.mean(2)<48)
            cells.append(ids.astype('u1').tobytes());flags.append(wall);palettes.append(palette)
    slots=np.zeros(len(cells),int);attrs=np.zeros(len(cells),int)
    windows=[[],[]]
    for wall,limit,seam_limit in [(False,256,45),(True,512,84)]:
        patterns=[None]*4
        seams={}
        for row in (8,16,24):
            group=[cells[i] for i in range(row*width,(row+1)*width) if flags[i]==wall]
            seams[row]=representatives(group,seam_limit)
        for band in range(4):
            pats=[bytes(64)]*limit
            reserved=set()
            for row in (band*8,(band+1)*8):
                if row not in seams:continue
                prefix,lookup=seams[row];base=(row//8%2)*seam_limit
                pats[base:base+len(prefix)]=prefix
                reserved.update(range(base,base+len(prefix)))
                if row==band*8:
                    for i in range(row*width,(row+1)*width):
                        if flags[i]==wall:slots[i]=base+lookup[cells[i]]
            available=[i for i in range(limit) if i not in reserved]
            ids=[i for i in range(band*8*width,min(30,band*8+8)*width)
                 if flags[i]==wall and i//width not in seams]
            chosen,lookup=representatives((cells[i] for i in ids),len(available))
            for n,t in enumerate(chosen):pats[available[n]]=t
            for i in ids:slots[i]=available[lookup[cells[i]]]
            patterns[band]=pats
        windows[int(wall)]=patterns
    fields,walls=windows
    source=[windows[int(w)][i//(8*width)][slots[i]] for i,w in enumerate(flags)]
    attrs=np.where(flags,np.array(palettes)*64+np.where(slots<256,1,62),0)
    return width,fields,walls,source,slots%256,attrs
