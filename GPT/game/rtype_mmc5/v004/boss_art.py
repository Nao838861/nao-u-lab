"""ボスの固定BG、尻尾の節、録画の座標列をMMC5用に配置する。"""
from pathlib import Path
import numpy as np
from PIL import Image

ART=Path(__file__).resolve().parent/'art'
TIP_COUNT=18
POSES=157

def body_tiles(slots,attrs,width,sprite_bank,planar,walls):
    rgb=np.zeros((240,8*width,3),'uint8')
    body=np.asarray(Image.open(ART/'boss-body.png').convert('RGB'))
    rgb[30:30+len(body),1448:1448+body.shape[1]]=body
    skin=np.array([(0,0,0),(108,6,0),(181,49,32),(254,204,197)])
    metal=np.array([(0,0,0),(0,0,0),(173,173,173),(247,216,165)])
    cells={}
    for row in range(3,27):
        for col in range(181,width):
            tile=rgb[row*8:row*8+8,col*8:col*8+8].astype('int32')
            if np.count_nonzero(tile.max(2)>46)<2:continue
            # Warm skin and the steel suspension wires can use separate palettes.
            costs=[((tile[:,:,None,:]-pal)**2).sum(3) for pal in (skin,metal)]
            use_metal=costs[1].min(2).sum()<costs[0].min(2).sum()
            ids=costs[int(use_metal)].argmin(2).astype('u1')
            cells[row,col]=(planar(ids.tobytes()),0xff if use_metal else 0x3f)
    # In the dark room the MMC5 uses window 3 below line 64. Sprites
    # always fetch from window 0, so the other sprite-bank slots are free.
    banks=[bytearray(sprite_bank) for i in range(4)]
    seam=list(dict.fromkeys(data for (r,c),(data,_) in cells.items() if r==8))
    low={t:112+i for i,t in enumerate(seam)}
    high=low.copy()
    for (r,c),(data,attr) in cells.items():
        lookup=low if r<8 else high
        if data not in lookup:
            available=range(112,256) if r<8 else range(256)
            lookup[data]=next(i for i in available if i not in lookup.values())
        i=lookup[data]
        slots[r*width+c]=i
        attrs[r*width+c]=0xbf if attr==0x3f else attr
        bands=({0,3,1} if r==8 else {r//8,3} if r>=8 else {0})
        if r in (16,24):bands.add(r//8-1)
        for b in bands:banks[b][16*i:16*i+16]=data
    # The last lower platform crosses the old window-2/window-3 boundary.
    for r in range(8,24):
        for c in range(141,width):
            i=r*width+c
            if attrs[i] not in (0xc1,0xfe):continue
            raw=planar(walls[r//8][int(slots[i])+(256 if attrs[i]==0xfe else 0)])
            if raw not in high:
                high[raw]=next(i for i in range(256) if i not in high.values())
            tile=high[raw]
            attrs[i],slots[i]=0xff,tile
            for b in {r//8,3}:banks[b][16*tile:16*tile+16]=raw
    # The raised eye and the four cable terminals retain their green/blue
    # glints as transparent sprites; the underlying silhouette stays in BG.
    marks=[]
    for x,y,w,h in [(155,32,16,24),(119,28,16,16),(178,81,16,16),
                    (178,122,16,16),(119,163,16,16)]:
        for dy in range(0,h,8):
            for dx in range(0,w,8):
                tile=rgb[16+y+dy:24+y+dy,1334+x+dx:1342+x+dx].astype(int)
                r,g,b=tile.transpose(2,0,1)
                if x==155:
                    ids=np.where((g>r*1.05)&(g>b*1.4)&(g>60),1,0)
                else:
                    ids=np.where((b>r*1.12)&(b>g*.94)&(b>65),np.where(g>120,3,2),0)
                if np.count_nonzero(ids)<3:continue
                i=232+len(marks)
                assert i<256 and i not in low.values()
                banks[0][16*i:16*i+16]=planar(ids.astype('u1').tobytes())
                marks.append((x+dx,y+dy+15,i))
    (ART.parent/'build/boss-marks.inc').write_text(
        'MARK_COUNT = '+str(len(marks))+'\n'+
        '\n'.join(name+': .byte '+','.join(str(m[k]) for m in marks)
                  for k,name in enumerate(('mark_x','mark_y','mark_tile'))))
    banks=list(map(bytes,banks))
    return banks

def tail_rom():
    keys=np.fromfile(ART/'boss-tail.bin','u1').reshape(-1,TIP_COUNT,2)
    # The 30 Hz capture includes the last half-step before the next cycle.
    t=np.arange(POSES)*78.55/POSES
    joined=np.concatenate([keys,keys[:1]])
    xs=np.r_[np.arange(len(keys)),78.55]
    poses=np.stack([np.interp(t,xs,col) for col in joined.reshape(len(joined),-1).T],1)
    poses=poses.reshape(POSES,TIP_COUNT,2)
    # An 8x8 NES sprite is shorter than the tallest source bead.
    # Resample the measured centerline with one additional overlapping bead.
    nodes=np.linspace(0,TIP_COUNT-1,19)
    return np.rint([[np.interp(nodes,np.arange(TIP_COUNT),xy) for xy in pose.T]
                    for pose in poses]).transpose(0,2,1).astype('u1').tobytes()
