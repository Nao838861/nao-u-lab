from pathlib import Path
import numpy as np
from PIL import Image
from waveform import make_phases, split_tile
ROOT=Path(__file__).resolve().parent
ART=ROOT/'art'
OUT=ROOT/'build'
def planar(v):
    a=np.frombuffer(v,'u1').reshape(8,8)
    return b''.join(np.packbits((a>>bit)&1,axis=1).tobytes() for bit in (0,1))
def array(name,values):
    return 'static const unsigned char '+name+'[]={'+','.join(map(str,values))+'};\n'
def sprite_data():
    # RGB targets describe the source art. The actual NES colors are in game.c.
    palettes=np.array([[(65,65,76),(38,197,215),(228,230,228)],
                       [(110,86,57),(234,89,15),(255,228,104)],
                       [(77,75,71),(150,145,132),(242,234,211)],
                       [(28,35,68),(40,104,171),(141,211,226)]],float)
    chroma=[];metadata=''
    for name,w,h,count in [('r9',24,13,1),('force',20,24,4),('bit',13,13,5),('drone',16,18,1),('walker',31,30,1)]:
        strip=Image.open(ART/(name+'.png')).convert('RGB')
        offsets=[]
        for frame in range(count):
            pic=strip.crop((frame*w,0,(frame+1)*w,h))
            for y in range(0,h,8):
                for x in range(0,w,8):
                    rgb=np.array(pic.crop((x,y,x+8,y+8)),float)
                    opaque=rgb.max(axis=2)>36
                    if name=='drone':
                        opaque &= ((rgb.max(2)-rgb.min(2)>30)|(rgb.max(2)>110))
                    dist=((rgb[None,:,:,None,:]-palettes[:,None,None,:,:])**2).sum(4)
                    best=int((dist.min(3)*opaque).sum((1,2)).argmin())
                    if name=='walker':
                        opaque &= (rgb[:,:,0]>rgb[:,:,2]+16)|(rgb.max(2)>128)
                        best=1
                    if name=='r9': best=0
                    if name=='force': best=2
                    ids=np.where(opaque,dist[best].argmin(2)+1,0).astype('u1')
                    offsets.extend([len(chroma),best]);chroma.append(planar(ids.tobytes()))
        if name=='force':
            core=[]
            for frame in range(count):
                for y in (4,12):
                    for x in (4,12):
                        rgb=np.array(strip.crop((frame*w+x,y,frame*w+x+8,y+8)),float)
                        r,g,b=rgb.transpose(2,0,1)
                        lit=(r>b+22)&(r>82)&(r>g*.91)
                        ids=np.where(lit,np.where(g>150,3,np.where(r>130,2,1)),0).astype('u1')
                        core.extend([len(chroma),1]);chroma.append(planar(ids.tobytes()))
            metadata+=array('core_tiles',core)
        metadata+=array(name+'_tiles',offsets)
    # The warm paired shots and the dotted cyan bolt leave the Force with A.
    for label,rows in [
        ('FLARE',['........','.1221...','123321..','123321..','.1221...','........','........','........']),
        ('STREAK',['........','........','..23321.','..11111.','........','........','........','........']),
        ('BOLT',['........','........','......2.','2.2.2333','......2.','........','........','........'])]:
        meta_id=len(chroma)
        metadata+=f'#define {label} {meta_id}\n'
        chroma.append(planar(bytes(0 if c=='.' else int(c) for line in rows for c in line)))
    explosion=bytes(3 if (x==3 or y==3 or x==y or x+y==7) else 0 for y in range(8) for x in range(8))
    metadata+=f'#define SPARK {len(chroma)}\n'
    return b''.join(chroma+[planar(explosion)]).ljust(4096,b'\0'),metadata

def build_art():
    rgb=np.array(Image.open(ART/'corridor.png').convert('RGB'))
    # Remove a wall-mounted enemy from the backdrop; place moving enemies in OAM.
    rgb[83:104,136:157]=rgb[83:104,93:114].copy()
    rgb[178:193,209:229]=rgb[178:193,167:187].copy()
    screen=np.zeros((240,256,3),'uint8');screen[16:224]=rgb
    pats=[[],[]]; slots=[]; attrs=[]; tops=[]; floors=[]
    for ty in range(30):
        for tx in range(32):
            t=screen[ty*8:ty*8+8,tx*8:tx*8+8].astype(float)
            r,g,b=t.transpose(2,0,1)
            wall=((ty<7 or ty>22 or tx<2) and ((r>92)&(r>b*.98)).sum()>=2)
            if wall:
                lum=.40*r+.45*g+.15*b
                ids=np.select([lum>197,lum>116,lum<64],[3,2,1],default=0)
            else:
                lum=t.mean(2)
                ids=np.select([(g>100)&(g>r+10),lum<49],[3,1],default=0)
            p=ids.astype('u1').tobytes(); bucket=pats[int(wall)]
            if p not in bucket: bucket.append(p)
            slots.append(bucket.index(p));attrs.append(0xc1 if wall else 0)
    for x in range(32):
        top=2
        while top<8 and attrs[top*32+x]: top+=1
        bottom=27
        while bottom>22 and attrs[bottom*32+x]: bottom-=1
        tops.append(max(3,top));floors.append(min(26,bottom))
    # Keep the closest NES tile if subpixel resampling made two background
    # patterns differ by a pixel. Walls have their own static bank.
    primary=pats[0]
    freq=np.bincount([i for i,a in zip(slots,attrs) if not a],minlength=len(primary))
    order=np.argsort(-freq,kind='stable')
    field=[primary[i] for i in order[:256]]
    pages=[field,pats[1][:256]]
    locations={int(old):(0,k) for k,old in enumerate(order[:256])}
    field_pixels=np.array([list(t) for t in field])
    for start in range(256,len(order),256):
        used=np.zeros(256,dtype=bool)
        page=list(field)
        for old in order[start:start+256]:
            difference=(field_pixels!=list(primary[old])).sum(1)
            slot=int(np.where(used,1000,difference).argmin())
            used[slot]=True;page[slot]=primary[old]
            locations[int(old)]=(len(pages),slot)
        pages.append(page)
    for idx,(old,attr) in enumerate(zip(slots,attrs)):
        if not attr: attrs[idx],slots[idx]=locations[old]
        elif old>=256: raise ValueError('wall page overflow')
    spr,meta=sprite_data()
    phases,offsets=make_phases()
    blank=bytes(64); masks=[];mapping=[];palettes=[]
    for phase in phases:
        for y in range(0,56,8):
            for x in range(0,56,8):
                pal,m=split_tile(phase[y:y+8,x:x+8])
                mapping.append(m);palettes.append(pal)
                if m!=blank and m not in masks:masks.append(m)
    # Select representative masks by largest distance from the existing set.
    ar=np.array([list(m) for m in masks])
    # Preserve entry/exit points on tile edges; mismatches there visibly break a curve.
    weights=np.ones((8,8),dtype=int);weights[[0,-1],:]+=2;weights[:,[0,-1]]+=2
    def distances(a,b):
        # Edge continuity and silhouette matter more than moving the highlight by one pixel.
        filled=(a!=0)!=(b!=0)
        return ((filled*5+(a!=b))*weights.ravel()).sum(1)
    freq=np.array([mapping.count(m) for m in masks])
    sel=[int(freq.argmax())]
    dist=np.full(len(ar),10000)
    while len(sel)<min(60-len(pages),len(masks)):
        dist=np.minimum(dist,distances(ar,ar[sel[-1]]))
        sel.append(int((dist*np.sqrt(freq)).argmax()))
    chosen=[masks[i] for i in sel]
    assignments={m:len(pages)+int(distances(ar[sel],ar[i]).argmin()) for i,m in enumerate(masks)}
    waves=[0 if m==blank else assignments[m]|(pal<<6) for m,pal in zip(mapping,palettes)]
    diag=[]
    for k in range(3):
        diag.append(bytes(1 if y==(x if k==0 else 7-x if k==1 else 4) else 0 for y in range(8) for x in range(8)))
    first=len(pages)+len(chosen)
    all_masks=[blank]*len(pages)+chosen+diag
    def page(patterns):return b''.join(planar(t) for t in patterns).ljust(4096,b'\0')
    banks=[page(p) for p in pages]
    for m in chosen+diag:
        banks.append(page([bytes(1+v if v else (1 if p in (1,2) else 0) for p,v in zip(t,m)) for t in field]))
    assert len(banks)<=63
    (OUT/'waves.bin').write_bytes(bytes(waves))
    (OUT/'attrs.bin').write_bytes(bytes(attrs))
    (OUT/'coverage.bin').write_bytes(bytes(sum(1<<x for x in range(8) if m[y*8+x]) for m in all_masks for y in range(8)))
    (OUT/'sprite.inc').write_text('SPR_BANK = 63\n')
    (OUT/'art.h').write_text(meta+array('wave_offsets',offsets)+array('nametable',slots)+array('attributes',attrs)+array('ceilrow',tops)+array('floorrow',floors)+array('diagonal',range(first,first+3)))
    print('Field / wall tiles:',list(map(len,pats)), 'static banks:',len(pages),'wave shapes:',len(masks),'->',len(chosen))
    return b''.join(banks).ljust(63*4096,b'\0')+spr

