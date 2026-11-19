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
    track=np.fromfile(ART/'camera.bin',dtype='<u2')/16
    ticks=np.arange(int(np.ceil(len(track)*60.0988/30))+1)
    positions=np.rint(np.interp(ticks*30/60.0988,np.arange(len(track)),track)).astype(int)
    steps=np.diff(positions)
    assert min(steps)==0 and max(steps)==1 and positions[-1]==Image.open(ART/'stage.png').width-256
    motion=np.packbits(steps,bitorder='little')
    from stage_tiles import make_map
    width,fields,walls,source,slots,attrs=make_map(ART/'stage.png',indicator_dots)
    tops=[];floors=[]
    for x in range(width):
        top,bottom=2,27
        while top<14 and attrs[top*width+x]: top+=1
        while bottom>15 and attrs[bottom*width+x]: bottom-=1
        tops.append(max(3,top)); floors.append(min(26,bottom))
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
    centers=(tuple(range(8)),tuple(reversed(range(8))),(4,)*8)
    for center in centers:
        # 1 = rim and 2 = hot core. Corner pixels stay in the path's own tile.
        mask=bytes(2 if y==center[x] else int(abs(y-center[x])==1)
                   for y in range(8) for x in range(8))
        masks.append(mask);color_masks.append(bytes(2 if v else 0 for v in mask))
    # Each ray tile gets the richest palette that can represent every uncovered
    # source pixel. Flat panels have a third ink for the lighter trailing rim.
    def ray_style(tile,direction):
        mask=masks[first-2+direction]
        outside={p for p,v in zip(tile,mask) if not v}
        if outside & {2,3}: return 0
        return 2 if 1 in outside else 1
    descriptor=[(128 if a==0xc1 else 192) if a else
                (64 if max(t)>1 else 0) | sum(ray_style(t,k)<<(2*k) for k in range(3))
                for t,a in zip(source,attrs)]
    def columns(name,data):
        a=np.array(data,'u1').reshape(30,width).T
        (OUT/name).write_bytes(np.pad(a,((0,0),(0,2))).tobytes())
    columns('stage_tiles.bin',slots)
    columns('stage_meta.bin',descriptor)
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
        banks=[page(field),page(wall[:256])]
        for i,(mask,cmask) in enumerate(zip(masks,color_masks)):
            if i<first-2:
                banks.append(b''.join(composite(t,cmask if max(t)>1 else mask) for t in field))
                continue
            k=i-(first-2)
            def ray_tile(t):
                style=ray_style(t,k)
                pixels=list(t)
                for n,v in enumerate(mask):
                    if not v: continue
                    x,y=n%8,n//8
                    center=centers[k][x]
                    if v==2: pixels[n]=3
                    elif style==0: continue
                    elif style==1: pixels[n]=1 if y<center else 2
                    else: pixels[n]=2
                return planar(bytes(pixels))
            banks.append(b''.join(ray_tile(t) for t in field))
        windows.append(b''.join(banks)+page(wall[256:])+spr)
    def coverage(ms):
        return bytes(sum(1<<x for x in range(8) if m[y*8+x]) for m in [blank,blank]+ms for y in range(8))
    # The glow is visual; collision uses the original one-pixel centerline.
    ray_hits=[bytes(int(v==2) for v in mask) for mask in masks[-3:]]
    (OUT/'coverage.bin').write_bytes(b''.join(coverage(group[:-3]+ray_hits).ljust(512,b'\0')
                                              for group in (masks,color_masks)))
    (OUT/'waves.bin').write_bytes(commands)
    (OUT/'waveptr.inc').write_text('wlo: .byte '+','.join(f'<(wave_data+{n})' for n in starts)+'\nwhi: .byte '+','.join(f'>(wave_data+{n})' for n in starts))
    (OUT/'attrs.bin').write_bytes(attrs.astype('u1').tobytes())
    (OUT/'kinds.bin').write_bytes(bytes(128 if a else int(max(t)>1) for t,a in zip(source,attrs)))
    (OUT/'sprite.inc').write_text(f'STAGE_COLS = {width}\nSPR_BANK = 63\nRAY_FIRST = {first}\n'+'\n'.join(line.replace('#define ','').replace(' ',' = ',1) for line in meta.splitlines() if line.startswith('#define ')))
    (OUT/'art.h').write_text(f'#define STAGE_END {Image.open(ART/"stage.png").width-256}\n'+meta+array('camera_steps',motion)+array('phase_for_age',[t if t<32 else 20+(t-32)%12 for t in range(128)])+array('advance_for_age',[0 if t<32 else 6*(1+(t-32)//12) for t in range(128)])+array('wave_offsets',offsets)+array('nametable',list(slots.reshape(30,width)[:,:32].flat))+array('attributes',list(attrs.reshape(30,width)[:,:32].flat))+array('ceilrow',tops)+array('floorrow',floors)+array('diagonal',range(first,first+3)))
    return b''.join(windows)
