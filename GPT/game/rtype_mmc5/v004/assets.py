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

def indicator_dots(rgb):
    """Pick the center of each colored lamp against its black recess."""
    r,g,b=rgb.astype('int16').transpose(2,0,1)
    def neighborhood(a):
        padded=np.pad(a,1,mode='edge')
        return np.lib.stride_tricks.sliding_window_view(padded,(3,3))
    dark=rgb.max(axis=2)<24
    recess=neighborhood(dark).sum(axis=(-2,-1))>=3
    dots=np.zeros(r.shape,dtype='uint8')
    for index,chroma,signal,threshold in [
        (2,np.minimum(r-g,r-b),r,5),
        (3,np.minimum(g-r,b-r),g,10)
    ]:
        strength=np.where(recess & (signal>=26) & (chroma>=threshold),
                          4*chroma+signal,0)
        peak=neighborhood(strength).max(axis=(-2,-1))
        dots[(strength>0)&(strength==peak)]=index
    return dots

def build_art():
    rgb=np.array(Image.open(ART/'corridor.png').convert('RGB'))
    # Remove a wall-mounted enemy from the backdrop; place moving enemies in OAM.
    rgb[83:104,136:157]=rgb[83:104,93:114].copy()
    rgb[178:193,209:229]=rgb[178:193,167:187].copy()
    screen=np.zeros((240,256,3),'uint8');screen[16:224]=rgb
    dots=indicator_dots(screen)
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
                lamps=dots[ty*8:ty*8+8,tx*8:tx*8+8]
                ids=np.where(lamps,lamps,np.where(lum<49,1,0))
            p=ids.astype('u1').tobytes(); bucket=pats[int(wall)]
            if p not in bucket: bucket.append(p)
            slots.append(bucket.index(p));attrs.append(0xc1 if wall else 0)
    for x in range(32):
        top=2
        while top<8 and attrs[top*32+x]: top+=1
        bottom=27
        while bottom>22 and attrs[bottom*32+x]: bottom-=1
        tops.append(max(3,top));floors.append(min(26,bottom))
    # Each 64-scanline region sees its own 256 KiB CHR window. Reserve both
    # boundary rows in it so the PPU's prefetched tiles match across the IRQ.
    fields=[]; walls=[]
    source=[pats[int(bool(a))][i] for a,i in zip(attrs,slots)]
    kinds=[128 if a else int(max(t)>1) for a,t in zip(attrs,source)]
    for band in range(4):
        sets=[[bytes(64)]*256 for _ in range(2)]
        assigned=[{},{}]
        for y in range(band*8,min(30,band*8+9)):
            for x in range(32):
                cell=y*32+x; wall=int(bool(attrs[cell])); tile=source[cell]
                if y%8==0:
                    idx=(y//8%2)*32+x
                else:
                    lookup=assigned[wall]
                    idx=lookup.setdefault(tile,64+len(lookup))
                assert idx<256
                sets[wall][idx]=tile
                if y//8==band: slots[cell]=idx
        fields.append(sets[0]);walls.append(sets[1])
    spr,meta=sprite_data()
    phases,offsets=make_phases()
    blank=bytes(64)
    neutral=[];colored=[];palettes=[]
    for phase in phases:
        for y in range(0,56,8):
            for x in range(0,56,8):
                block=phase[y:y+8,x:x+8]
                pal,mask=split_tile(block)
                neutral.append(mask);palettes.append(pal)
                colored.append(np.where(block,1+(block%2==0),0).astype('u1').tobytes())

    def templates(mapping):
        masks=list(dict.fromkeys(m for m in mapping if m!=blank))
        ar=np.array([list(m) for m in masks])
        weights=np.ones((8,8),dtype=int);weights[[0,-1],:]+=2;weights[:,[0,-1]]+=2
        def distances(a,b):
            return ((((a!=0)!=(b!=0))*5+(a!=b))*weights.ravel()).sum(1)
        freq=np.array([mapping.count(m) for m in masks])
        sel=[int(freq.argmax())];dist=np.full(len(ar),10000)
        while len(sel)<57:
            dist=np.minimum(dist,distances(ar,ar[sel[-1]]))
            sel.append(int((dist*np.sqrt(freq)).argmax()))
        ids={m:2+int(distances(ar[sel],ar[i]).argmin()) for i,m in enumerate(masks)}
        return [masks[i] for i in sel],[ids.get(m,0) for m in mapping]

    masks,ids=templates(neutral)
    color_masks,color_ids=templates(colored)
    first=2+len(masks)
    for k in range(3):
        d=bytes(int(y==(x if k==0 else 7-x if k==1 else 4)) for y in range(8) for x in range(8))
        masks.append(d);color_masks.append(bytes(2*p for p in d))
    # Four bytes per lit cell. Empty cells cost no runtime loop iterations.
    commands=bytearray();starts=[]
    for phase in range(32):
        starts.append(len(commands))
        for j in range(49):
            i=phase*49+j
            if ids[i]: commands.extend((j%7,j//7,ids[i]|palettes[i]<<6,color_ids[i]))
        commands.append(255)
    def page(patterns):return b''.join(planar(t) for t in patterns)
    from functools import lru_cache
    @lru_cache(None)
    def composite(tile,mask):
        pixels=bytes(1+v if v else p for p,v in zip(tile,mask))
        assert all(m or a==b for a,b,m in zip(tile,pixels,mask))
        return planar(pixels)
    windows=[]
    for field,wall in zip(fields,walls):
        banks=[page(field),page(wall)]
        for mask,cmask in zip(masks,color_masks):
            banks.append(b''.join(composite(t,cmask if max(t)>1 else mask) for t in field))
        windows.append(b''.join(banks).ljust(63*4096,b'\0')+spr)
    def coverage(ms):
        return bytes(sum(1<<x for x in range(8) if m[y*8+x]) for m in [blank,blank]+ms for y in range(8))
    (OUT/'coverage.bin').write_bytes(coverage(masks).ljust(512,b'\0')+coverage(color_masks).ljust(512,b'\0'))
    (OUT/'waves.bin').write_bytes(commands)
    (OUT/'waveptr.inc').write_text('wlo: .byte '+','.join(f'<(wave_data+{n})' for n in starts)+'\nwhi: .byte '+','.join(f'>(wave_data+{n})' for n in starts))
    (OUT/'attrs.bin').write_bytes(bytes(attrs))
    (OUT/'kinds.bin').write_bytes(bytes(kinds))
    (OUT/'sprite.inc').write_text('SPR_BANK = 63\n'+'\n'.join(line.replace('#define ','').replace(' ',' = ',1) for line in meta.splitlines() if line.startswith('#define ')))
    (OUT/'art.h').write_text(meta+array('phase_for_age',[t if t<32 else 20+(t-32)%12 for t in range(128)])+array('advance_for_age',[0 if t<32 else 6*(1+(t-32)//12) for t in range(128)])+array('wave_offsets',offsets)+array('nametable',slots)+array('attributes',attrs)+array('ceilrow',tops)+array('floorrow',floors)+array('diagonal',range(first,first+3)))
    return b''.join(windows)
