"""ボスの固定BG、尻尾の節、録画の座標列をMMC5用に配置する。"""
from pathlib import Path
import numpy as np
from tile_palette import colors, match, SKIN, IRIS, LASER, METAL
from PIL import Image

ART=Path(__file__).resolve().parent/'art'
TIP_COUNT=18
POSES=157

def body_tiles(slots,attrs,width,sprite_bank,planar,walls):
    rgb=np.zeros((240,8*width,3),'uint8')
    body=np.asarray(Image.open(ART/'boss-body.png').convert('RGB'))
    rgb[30:30+len(body),1448:1448+body.shape[1]]=body
    # Two-pixel body occupancy and the exact 157 tail poses share their
    # origin with the picture, including during the room's scroll-in.
    body_ink=body.max(2)>50
    padded=np.pad(body_ink,((0,1),(0,2)))
    mask=padded.reshape(90,2,72,2).sum((1,3))>=2
    (ART.parent/'build/body-contact.bin').write_bytes(np.packbits(mask,axis=1,bitorder='little').tobytes())
    (ART.parent/'build/tail-contact.bin').write_bytes(tail_rom())
    choices=[(palette,colors(0x0f,entries)) for palette,entries in
             ((2,SKIN),(3,METAL),(0,IRIS),(1,LASER))]
    glass_palette=(1,colors(0x0f,LASER))
    caps=((119,28),(178,81),(178,122),(119,163))
    terminal=np.zeros(rgb.shape[:2],bool)
    for x,y in caps:terminal[16+y:32+y,1334+x:1350+x]=True
    cells={}
    for row in range(3,27):
        for col in range(181,width):
            tile=rgb[row*8:row*8+8,col*8:col*8+8].astype('int32')
            if np.count_nonzero(tile.max(2)>46)<2:continue
            r,g,b=tile.transpose(2,0,1)
            olive=(g>r+4)&(g>b+24)&(g>55)
            blue=(b>r+12)&(b>g-8)&(b>65)
            local=[p for p in choices if p[0]!=1 or blue.any()]
            allowed={0:(1,(g>r*.85)&(g>b+14)),1:(2,(b>r)&(b>g*.9))}
            palette,ids=match(tile,local,1+7*olive+4*blue,allowed)
            glass=terminal[row*8:row*8+8,col*8:col*8+8] & blue
            if glass.sum()>=3:
                palette,ids=match(tile,[glass_palette],1)
                ids[(ids==1)&(r-g<40)]=0
                ids[glass]=np.where(g[glass]>123,3,2)
            cells[row,col]=(planar(ids.tobytes()),(palette<<6)|63)
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
        attrs[r*width+c]=attr
        bands=({0,3,1} if r==8 else {r//8,3} if r>=8 else {0})
        if r in (16,24):bands.add(r//8-1)
        for b in bands:banks[b][16*i:16*i+16]=data
    body_mask=np.zeros((width-181,32),'u1')
    for r,c in cells:body_mask[c-181,r]=1
    (ART.parent/'build/body-mask.bin').write_bytes(body_mask.tobytes())
    # The last lower platform crosses the old window-2/window-3 boundary.
    for r in range(8,24):
        for c in range(141,width):
            i=r*width+c
            if (attrs[i]&63) not in (1,62):continue
            raw=planar(walls[r//8][int(slots[i])+(256 if (attrs[i]&63)==62 else 0)])
            if raw not in high:
                high[raw]=next(i for i in range(256) if i not in high.values())
            tile=high[raw]
            attrs[i],slots[i]=(attrs[i]&192)|63,tile
            for b in {r//8,3}:banks[b][16*tile:16*tile+16]=raw
    # The raised eye and the four cable terminals retain their green/blue
    # glints as transparent sprites; the underlying silhouette stays in BG.
    marks=[]
    # Center an 8-pixel strip on the warm rim of each glass bulb. The
    # larger blue glass surface is in BG even when its OAM glint is hidden.
    for x,y,w,h in [(155,32,16,24),*((cx+5,cy,8,16) for cx,cy in caps)]:
        for dy in range(0,h,8):
            for dx in range(0,w,8):
                tile=rgb[16+y+dy:24+y+dy,1334+x+dx:1342+x+dx].astype(int)
                r,g,b=tile.transpose(2,0,1)
                if x==155:
                    ids=np.where((g>r*1.05)&(g>b*1.4)&(g>110),1,0)
                else:
                    gold=(r>b+22)&(g>b+20)&(g>62)&(r<g*1.25)
                    cool=(b>r*1.12)&(b>g*.94)&(b>65)
                    ids=np.where(gold,1,np.where(cool,np.where(g>120,3,2),0))
                if np.count_nonzero(ids)<3:continue
                i=240+len(marks)
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
