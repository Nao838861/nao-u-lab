from pathlib import Path
import numpy as np
from PIL import Image
from waveform import make_phases
ROOT=Path(__file__).resolve().parent
ART=ROOT/'art'
OUT=ROOT/'build'
def planar(v):
    a=np.frombuffer(v,'u1').reshape(8,8)
    return b''.join(np.packbits((a>>bit)&1,axis=1).tobytes() for bit in (0,1))
def array(name,values):
    return 'static const unsigned char '+name+'[]={'+','.join(map(str,values))+'};\n'
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
    from turret_layout import clean_stage,build_tables
    clean_stage(ART/'stage.png',OUT/'stage-clean.png')
    build_tables(OUT)
    width,fields,walls,source,slots,attrs=make_map(OUT/'stage-clean.png',indicator_dots)
    tops=[];floors=[]
    for x in range(width):
        top,bottom=2,27
        while top<14 and attrs[top*width+x]: top+=1
        while bottom>15 and attrs[bottom*width+x]: bottom-=1
        tops.append(max(3,top)); floors.append(min(26,bottom))
    from boss_art import body_tiles
    from actor_art import build_sprites,terrain
    spr,meta=build_sprites(planar,array)
    top,floor=terrain()
    (OUT/'terrain.h').write_text(array('ceiling_px',top).replace('static const','const')+array('floor_px',floor).replace('static const','const'))
    boss_banks=body_tiles(slots,attrs,width,spr,planar,walls)
    boss_on=int(np.where(positions==1130)[0][0])
    boss_phase=(boss_on-round(2125*60.0988/30))%157
    phases,offsets=make_phases()
    blank=bytes(64)
    neutral=[]
    for phase in phases:
        for y in range(0,56,8):
            for x in range(0,56,8):
                block=phase[y:y+8,x:x+8]
                mask=np.minimum(block,3).astype('u1').tobytes()
                neutral.append(mask)

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
    first=2+len(masks)
    centers=(tuple(range(8)),tuple(reversed(range(8))),(4,)*8)
    for center in centers:
        # 1 = rim and 2 = hot core. Corner pixels stay in the path's own tile.
        mask=bytes(2 if y==center[x] else int(abs(y-center[x])==1)
                   for y in range(8) for x in range(8))
        masks.append(mask)
    descriptor=[{0xc1:128,0xfe:192,0xbf:160,0xff:224}.get(a,0) for a in attrs]
    def columns(name,data):
        a=np.array(data,'u1').reshape(30,width).T
        (OUT/name).write_bytes(np.pad(a,((0,0),(0,2))).tobytes())
    columns('stage_tiles.bin',slots)
    columns('stage_meta.bin',descriptor)
    # Three bytes per lit cell. Empty cells cost no runtime loop iterations.
    commands=bytearray();starts=[]
    for phase in range(32):
        starts.append(len(commands))
        for j in range(49):
            i=phase*49+j
            if ids[i]: commands.extend((j%7,j//7,ids[i]))
        commands.append(255)
    def page(patterns):return b''.join(planar(t) for t in patterns)
    from functools import lru_cache
    @lru_cache(None)
    def composite(tile,mask):
        base=(0,0,1,2)
        return planar(bytes(v if v else base[p] for p,v in zip(tile,mask)))
    windows=[]
    for field,wall,body in zip(fields,walls,boss_banks):
        banks=[page(field),page(wall[:256])]
        for i,mask in enumerate(masks):
            if i>=first-2:
                mask=bytes(3 if v==2 else 2 if v else 0 for v in mask)
            banks.append(b''.join(composite(t,mask) for t in field))
        windows.append(b''.join(banks)+page(wall[256:])+body)
    def coverage(ms):
        return bytes(sum(1<<x for x in range(8) if m[y*8+x]) for m in [blank,blank]+ms for y in range(8))
    # The glow is visual; collision uses the original one-pixel centerline.
    ray_hits=[bytes(int(v==2) for v in mask) for mask in masks[-3:]]
    (OUT/'coverage.bin').write_bytes(coverage(masks[:-3]+ray_hits).ljust(512,b'\0'))
    (OUT/'waves.bin').write_bytes(commands)
    (OUT/'waveptr.inc').write_text('wlo: .byte '+','.join(f'<(wave_data+{n})' for n in starts)+'\nwhi: .byte '+','.join(f'>(wave_data+{n})' for n in starts))
    (OUT/'attrs.bin').write_bytes(attrs.astype('u1').tobytes())
    (OUT/'kinds.bin').write_bytes(bytes(128 if a else int(max(t)>1) for t,a in zip(source,attrs)))
    (OUT/'sprite.inc').write_text(f'STAGE_COLS = {width}\nSPR_BANK = 126\nRAY_FIRST = {first}\n'+'\n'.join(line.replace('#define ','').replace(' ',' = ',1) for line in meta.splitlines() if line.startswith('#define ')))
    (OUT/'art.h').write_text(f'#define BOSS_PHASE {boss_phase}\n#define STAGE_END {Image.open(ART/"stage.png").width-256}\n'+meta+array('camera_steps',motion)+array('phase_for_age',[t if t<32 else 20+(t-32)%12 for t in range(128)])+array('advance_for_age',[0 if t<32 else 6*(1+(t-32)//12) for t in range(128)])+array('wave_offsets',offsets)+array('nametable',list(slots.reshape(30,width)[:,:32].flat))+array('attributes',list(attrs.reshape(30,width)[:,:32].flat))+array('ceilrow',tops).replace('static const','const')+array('floorrow',floors).replace('static const','const')+array('diagonal',range(first,first+3)).replace('static const','const'))
    from boss_patches import pack_tail
    chr_data,boss_data=pack_tail(b''.join(windows),slots,attrs,width,planar)
    (OUT/'boss-data.bin').write_bytes(boss_data)
    # Band 1 has no overflow wall tiles, including both IRQ seam rows.
    assert not np.any(attrs.reshape(30,width)[8:17]==0xfe)
    image=bytearray(chr_data)
    objbank=bytearray(spr)
    objbank[240*16:]=boss_banks[0][240*16:]
    image[126*4096:127*4096]=objbank
    # Band 1's wall atlas ends below tile 128. Its upper 2 KiB can
    # simultaneously supply the small and medium sprite pattern page.
    band=attrs.reshape(30,width)[8:17]
    used=slots.reshape(30,width)[8:17][band==0xc1]
    assert not len(used) or used.max()<128
    image[65*4096+2048:66*4096]=(OUT/'small-force.chr').read_bytes()
    return bytes(image)
