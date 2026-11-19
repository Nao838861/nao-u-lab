"""実ROMの背景合成と、発射時点から求めた反射経路を独立に照合する。"""
import re
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parent

def table(name):
    text=(ROOT/'build/art.h').read_text()
    values=re.search(r'\b'+name+r'\[\]=\{([^}]*)\}',text).group(1)
    return list(map(int,values.split(',')))

def chr_tiles():
    rom=(ROOT/'rtype-mmc5-v004.nes').read_bytes()
    data=np.frombuffer(rom[16+16384*rom[4]:],dtype='uint8').reshape(4,64,256,2,8,1)
    planes=np.unpackbits(data,axis=-1)
    tiles=planes[:,:,:,0]+2*planes[:,:,:,1]
    return tiles

def stage_map():
    def load(name):
        return np.fromfile(ROOT/'build'/name,dtype='u1').reshape(-1,32)[:,:30].T
    slots=load('stage_tiles.bin')
    desc=load('stage_meta.bin')
    attrs=np.fromfile(ROOT/'build/base-attributes.bin',dtype='u1')[desc]
    return slots,attrs

def check_background():
    tiles=chr_tiles()
    cov=np.unpackbits(np.fromfile(ROOT/'build/coverage.bin',dtype='uint8')
                      .reshape(64,8,1),axis=-1,bitorder='little')
    y,x=np.indices((8,8))
    diagonals=dict(zip(table('diagonal'),(x,7-x,4)))
    slots,attrs=stage_map()
    width=slots.shape[1]
    checked=0
    for cell,(slot,attr) in enumerate(zip(slots.flat,attrs.flat)):
        row=cell//width
        band=row//8
        base=tiles[band,attr&63,slot]
        if row in (8,16,24):
            # CPU IRQ and PPU fetch can straddle the boundary at any scroll X.
            banks=[attr&63] if attr else [0,*range(2,62)]
            assert np.array_equal(tiles[band,banks,slot],tiles[band-1,banks,slot])
        if attr: continue
        projected=np.take([0,0,1,2],base)
        for bank in range(2,62):
            if bank in diagonals:
                offset=y-diagonals[bank]
                assert np.array_equal(cov[bank],offset==0)
                free=abs(offset)>1
            else:
                free=cov[bank]==0
            overlay=tiles[band,bank,slot]
            assert np.array_equal(projected[free],overlay[free]),(cell,bank)
            checked+=1
    return checked

def check_materials():
    from PIL import Image
    from tile_palette import colors, IRIS, LASER, SKIN, METAL, RGB
    slots,attrs=stage_map()
    tiles=chr_tiles()
    room=np.zeros((240,256,3),dtype='u1')
    palettes=[colors(0x0f,p) for p in (IRIS,LASER,SKIN,METAL)]
    for row,col in np.ndindex(30,32):
        world=166+col
        attr=int(attrs[row,world])
        if attr:
            pattern=tiles[3 if row>=8 else 0,attr&63,slots[row,world]]
            room[row*8:row*8+8,col*8:col*8+8]=palettes[attr>>6][pattern]
    def pixels(image,ink):
        return np.count_nonzero(np.all(image==RGB[ink],axis=2))
    # Decode the ROM with sprites entirely absent. World column 166
    # begins six pixels before the final camera origin.
    assert pixels(room[48:74,161:179],IRIS[0])>70
    for x,y in ((119,28),(178,81),(178,122),(119,163)):
        glass=room[y+16:y+32,x+6:x+22]
        assert pixels(glass,LASER[1])>=10 and pixels(glass,LASER[2])>=45
    upper=np.asarray(Image.open(ROOT/'build/check/stage2520.png').convert('RGB'))[45:100,97:200]
    for ink,minimum in ((0x16,80),(0x37,300),(0x30,300)):
        assert pixels(upper,ink)>minimum

def ray_attributes():
    tiles=chr_tiles()
    banks=table('diagonal')
    slots,attrs=stage_map()
    width=slots.shape[1]
    y,x=np.indices((8,8))
    expected={}
    for cell,(slot,attr) in enumerate(zip(slots.flat,attrs.flat)):
        if attr:continue
        band=cell//(8*width)
        for bank,center in zip(banks,(x,7-x,4)):
            rendered=tiles[band,bank,slot]
            assert np.all(rendered[y==center]==3)
            assert np.all(rendered[abs(y-center)==1]==2)
            expected[cell,bank]=bank|64
    return expected

def check_rays():
    ceilings=table('ceilrow');floors=table('floorrow');diagonal=table('diagonal')
    kinds=(ROOT/'build/kinds.bin').read_bytes()
    attrs=ray_attributes()
    aux=(ROOT/'build/boss-packets.bin').read_bytes()
    tails=[]
    for n in range(157):
        ptr=(aux[n]&3)*8192+((aux[256+n]+256*aux[512+n])&8191)
        ptr+=1+4*aux[ptr]
        tails.append({(aux[i],aux[i+1]&31) for i in range(ptr+1,ptr+1+4*aux[ptr],4)})
    frames=wraps=bounces=0
    for line in (ROOT/'build/check/rays.txt').read_text().splitlines():
        cols=line.split()
        age,origin,height,scroll,pose=map(int,cols[:5])
        if age==1:
            launch=scroll//8
            path=[]
            for direction in (-1,0,1):
                x,y=origin+1,height;dx,dy=1,direction
                steps=[]
                for _ in range(48):
                    world=launch+x
                    steps.append((x,y,world,diagonal[2 if dy==0 else int(dx!=dy)]))
                    if 0<=x<32:
                        nx,ny=x+dx,y+dy
                        if not ceilings[world]<=ny<=floors[world]:
                            dy=-dy;ny=y;bounces+=1
                        elif 0<=nx<32 and not ceilings[world+dx]<=ny<=floors[world+dx]:
                            dx=-dx;nx=x;bounces+=1
                        x,y=nx,ny
                path.append(steps)
        mounts={int(w[1:],16) for w in cols[5:] if w.startswith("m")}
        advances=age-age//4
        visible={}
        for steps in path:
            for x,y,w,bank in steps[max(0,advances-12):advances]:
                if not (0<=x<32 and x>=(scroll//8-launch)%32 and 2<=y<28):continue
                if w==scroll//8 and scroll%8:continue
                cell=y*len(ceilings)+w
                if kinds[cell]==128 or (pose>=0 and (w,y) in tails[pose]):continue
                address=0x5c00+32*y+w%32
                if address not in mounts:visible.setdefault(address,set()).add(attrs[cell,bank])
        actual={int(a,16):int(v,16) for a,v in (word.split(':') for word in cols[5:] if not word.startswith('m'))}
        assert actual.keys()==visible.keys(),(age,actual.keys()^visible.keys())
        for address,value in actual.items():
            assert value in visible[address],(age,origin,launch,scroll,hex(address),value,visible[address])
        frames+=1
        wraps+=(scroll//256>launch//32)
    assert frames>=200 and bounces and wraps
    return frames,wraps


def check_camera():
    from PIL import Image
    slots,attrs=stage_map()
    tiles=chr_tiles()
    hull=np.zeros((240,slots.shape[1]*8),bool)
    for y,x in zip(*np.nonzero(attrs!=0)):
        palette=attrs[y,x]>>6
        if (attrs[y,x]&63)==63 and x>=181 and palette not in (0,3):continue
        ids=tiles[y//8,attrs[y,x]&63,slots[y,x]]
        hull[y*8:y*8+8,x*8:x*8+8]=(ids>=2 if palette==2 and x<141 else ids==3)
    reference=np.fromfile(ROOT/'art/camera.bin','<u2')/16
    poses=np.loadtxt(ROOT/'build/check/positions.txt',dtype=int,ndmin=2)
    errors=[]
    first=int((ROOT/'build/check/first-game-frame.txt').read_text())
    for tick,pos,_ in poses:
        img=np.array(Image.open(ROOT/f'build/check/stage{tick}.png').convert('RGB'))
        cream=((img[:,:,0]==247)&(img[:,:,1]==216)) | ((img[:,:,0]==255)&(img[:,:,1]==254))
        def mismatch(x):
            return np.mean(cream[:,8:]!=hull[:,x+8:x+256])
        best=min(range(max(0,pos-2),min(hull.shape[1]-255,pos+3)),key=mismatch)
        # CPU camera can be one VBlank ahead of the last visible frame.
        assert abs(pos-best)<=2 and mismatch(best)<.006,(tick,pos,best,mismatch(best))
        # Screenshot zero is emulator frame 50. Measure startup latency at DMA.
        t=(tick+50-first)*30/60.0988
        errors.append(abs(best-np.interp(t,np.arange(len(reference)),reference)))
    assert max(errors)<2,(max(errors),poses[np.argmax(errors)])
    return len(poses),max(errors)
