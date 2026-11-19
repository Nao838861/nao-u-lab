"""尻尾を録画の座標で合成し、既存CHRの空きとVBlank転送表に格納する。"""
from collections import defaultdict
import numpy as np
from boss_art import tail_rom
from stage_tiles import representatives

BEAD=np.array([[int(c) for c in row] for row in (
    '000111000','001222110','012333221','123333322','123333322','122333222',
    '122222221','012222211','011222110','001111100'
)],dtype='u1')

def pack_tail(chr_data,slots,attrs,width,planar):
    data=bytearray(chr_data)
    poses=np.frombuffer(tail_rom(),'u1').reshape(-1,19,2)
    slots,attrs=slots.reshape(30,width),attrs.reshape(30,width)
    used=[]
    for band in range(4):
        rows=slice(band*8,min(30,band*8+9))
        used.append({(bank,int(slot)) for attr,slot in zip(attrs[rows].flat,slots[rows].flat)
                     for bank in ([int(attr)&63] if attr else [0,*range(2,62)])}|
                    {(63,k) for k in range(112)})
    used[0].update((63,k) for k in range(232,256))
    # Window 3 also supplies the entire playfield below line 64 in the boss room.
    late=attrs[8:,141:]
    for attr,slot in zip(late.flat,slots[8:,141:].flat):
        if attr:used[3].add((int(attr)&63,int(slot)))
    # The lower playfield only uses field tile IDs 0..116. One upper
    # half holds all six head poses and the shared OAM graphics.
    for slot in range(128,256):
        assert (54,slot) not in used[3]
        used[3].add((54,slot))
    from boss_bubbles import prepare
    for (bank,slot),tile in prepare(planar).items():
        assert (bank,slot) not in used[3]
        used[3].add((bank,slot))
        start=(192+bank)*4096+slot*16
        data[start:start+16]=tile
    def bands_for(row):
        return (0,3) if row==8 else (3,)
    def base(c,r):
        attr=int(attrs[r,c])
        return (int(slots[r,c]) if attr else 0,attr)
    def base_pixels(c,r):
        tile,attr=base(c,r)
        if not attr:return np.zeros((8,8),'u1')
        pos=((3 if r>=8 else 0)*64+(attr&63))*4096+16*tile
        planes=np.unpackbits(np.frombuffer(data[pos:pos+16],'u1')).reshape(2,8,8)
        return planes[0]+2*planes[1]

    raw_frames=[];eye_frames=[];samples=defaultdict(list)
    for pose in poses:
        frame={}
        for px,py in pose:
            x,y=int(px)+1334-4,int(py)+16-5
            for r in range(y//8,(y+9)//8+1):
                for c in range(x//8,(x+8)//8+1):
                    if (c,r) not in frame:frame[c,r]=base_pixels(c,r)
                    tx,ty=max(0,x-8*c),max(0,y-8*r)
                    sx,sy=max(0,8*c-x),max(0,8*r-y)
                    w,h=min(8-tx,9-sx),min(8-ty,10-sy)
                    ink=BEAD[sy:sy+h,sx:sx+w]
                    np.copyto(frame[c,r][ty:ty+h,tx:tx+w],ink,where=ink!=0)
        # The tip gets its own BG palette in the dark room. Its green eye
        # remains visible even on scanlines occupied by all eight ship sprites.
        tip_x,tip_y=map(int,pose[-1])
        eye=[(1334+tip_x+dx,16+tip_y+dy) for dy in range(-2,2) for dx in range(-2,2)
             if dx*dx+dy*dy<=5]
        eyes={(x//8,y//8) for x,y in eye}
        for cell in eyes:
            frame[cell][frame[cell]==1]=0
        for x,y in eye:frame[x//8,y//8][y%8,x%8]=1
        eye_frames.append(eyes)
        raw={}
        for (c,r),tile in frame.items():
            if np.array_equal(tile,base_pixels(c,r)):continue
            raw[c,r]=tile.tobytes()
            samples[bands_for(r)].append(raw[c,r])
        raw_frames.append(raw)

    lookup={};errors=[]
    for group in sorted(samples,key=len,reverse=True):
        free=[(bank,slot) for bank in (62,1,63,*range(2,62)) for slot in range(256)
              if all((bank,slot) not in used[b] for b in group)]
        # Give both sides of an IRQ seam the same slot before packing ordinary rows.
        limit=min(len(set(samples[group])),len(free))
        patterns,indices=representatives(samples[group],limit)
        for raw,i in indices.items():
            bank,slot=free[i];lookup[group,raw]=(slot,bank|128)
            errors.append(np.count_nonzero(np.frombuffer(raw,'u1')!=np.frombuffer(patterns[i],'u1')))
        for raw,(bank,slot) in zip(patterns,free):
            for b in group:
                pos=(b*64+bank)*4096+16*slot
                data[pos:pos+16]=planar(raw)
                used[b].add((bank,slot))

    frames=[]
    for f,eyes in zip(raw_frames,eye_frames):
        frame={}
        for (c,r),raw in f.items():
            slot,attr=lookup[bands_for(r),raw]
            frame[c,r]=(slot,attr&63 if (c,r) in eyes else attr)
        frames.append(frame)
    rom=bytearray(0x500)
    peak=0
    for n,frame in enumerate(frames):
        old=frames[n-1]
        packet=bytearray()
        restore={cell:base(*cell) for cell in old.keys()-frame.keys()}
        for part in (restore,frame):
            packet.append(len(part))
            for (c,r),(slot,attr) in part.items():
                same=(part is frame and old.get((c,r))==(slot,attr))
                packet.extend((c,r|(128 if same else 0),slot,attr))
        if len(rom)%8192+len(packet)>8192:
            rom.extend(bytes(8192-len(rom)%8192))
        addr=0xa000+len(rom)%8192
        rom[n]=0x80+len(rom)//8192
        rom[0x100+n]=addr&255;rom[0x200+n]=addr>>8
        rom[0x300+n],rom[0x400+n]=poses[n,-1]
        rom.extend(packet)
        peak=max(peak,len(frame),len(restore))
    assert peak<=48 and len(rom)<=32768
    from boss_program import programs
    from pathlib import Path
    (Path(__file__).resolve().parent/'build/boss-packets.bin').write_bytes(rom)
    result=programs(frames,base)
    assert not any(errors), 'Boss CHR no longer fits pixel-exactly'
    print(f'Boss: {len(poses)} poses, peak {peak} BG cells, {len(result)} PRG bytes')
    return bytes(data),result
