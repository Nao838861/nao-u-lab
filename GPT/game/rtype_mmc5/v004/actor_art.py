"""録画の小物を独立した4 KiBのMMC5スプライトバンクに収める。"""
from pathlib import Path
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parent
def build_sprites(planar,array):
    colors=np.array([[(70,69,76),(45,175,207),(228,228,224)],
                     [(96,67,42),(222,69,22),(255,222,95)],
                     [(70,70,68),(149,147,134),(236,233,225)],
                     [(32,42,68),(47,108,174),(146,203,227)]],float)
    tiles=[bytes(16)]
    def intern(ids):
        raw=planar(ids.astype('u1').tobytes())
        if raw not in tiles:tiles.append(raw)
        return tiles.index(raw)
    defs='';tables='';player={};shared={0}
    for name,w,h,n in [('ship',24,18,3),('force',25,24,8),('core',25,24,8),
                          ('bit',13,14,8),('carrier',23,23,2),('green',18,20,1),
                          ('red',19,17,1),('pod',22,24,1),('walker',34,44,4),
                          ('crystal',16,17,2),('satellite',12,12,1),('gun',13,12,1)]:
        im=Image.open(ROOT/'art'/('actor-'+('force' if name=='core' else name)+'.png'))
        entries=[]
        for k in range(n):
            pic=im.crop((w*k,0,w*(k+1),h))
            # Trim the transparent margins and keep the tallest enemy to 4 rows.
            if name=='walker':pic=pic.resize((32,40),Image.Resampling.NEAREST)
            if name in ('force','core'):pic=pic.crop((1,0,25,24))
            if name=='gun':pic=pic.resize((8,8),Image.Resampling.NEAREST)
            if name=='ship':pic=pic.resize((24,16),Image.Resampling.NEAREST)
            if name in ('green','red','crystal','pod'):pic=pic.resize((16,16),Image.Resampling.NEAREST)
            if name=='carrier':pic=pic.resize((24,16),Image.Resampling.NEAREST)
            for y in range(0,pic.height,8):
                for x in range(0,pic.width,8):
                    rgb=np.asarray(pic.crop((x,y,x+8,y+8)),float)
                    r,g,b=rgb.transpose(2,0,1)
                    opaque=rgb.max(2)>39
                    hot=(r>b+25)&(r>95)&(r>g*.91)
                    # The shell occludes the orange core in the source itself.
                    if name=='core':opaque &= hot
                    if name=='force':opaque &= ~hot
                    dist=((rgb[None,:,:,None,:]-colors[:,None,None,:,:])**2).sum(4)
                    pal={'ship':0,'force':2,'core':1,'carrier':0,'walker':1,'red':1,
                         'green':1,'pod':2,'gun':1,'crystal':1 if k==0 else 3}.get(name)
                    if pal is None:pal=int((dist.min(3)*opaque).sum((1,2)).argmin())
                    ids=np.where(opaque,dist[pal].argmin(2)+1,0)
                    flip=0
                    for v,alt in ((0,ids),(64,ids[:,::-1]),(128,ids[::-1]),(192,ids[::-1,::-1])):
                        raw=planar(alt.astype('u1').tobytes())
                        if raw in tiles:
                            slot=tiles.index(raw);flip=v;break
                    else:slot=intern(ids)
                    entries.extend([slot,pal|flip])
        if name not in ('force','core'):shared.update(entries[::2])
        if name=='gun':defs+=f'#define GUN_TILE {entries[0]}\n'
        elif name in ('crystal','satellite'):tables+=array(name+'_tiles',entries)
        if name in ('ship','core','force','bit','walker','carrier','pod','green','red'):
            cols=(pic.width+7)//8
            stride=len(entries)//n
            player[name]=[[(8*(j//cols),tile,pal,8*(j%cols))
                for j,(tile,pal) in enumerate(zip(entries[k*stride:(k+1)*stride:2],entries[k*stride+1:(k+1)*stride:2])) if tile]
                for k in range(n)]
        if name in ('green','red'):
            # Preserve the cool belly on a warm sprite using one 8x8 overlay.
            rgb=np.asarray(pic.crop((3,4,11,12)),float)
            r,g,b=rgb.transpose(2,0,1)
            ink=(g>r*1.1)&(g>b*1.05)&(g>50)
            if ink.any():
                tile=intern(ink);shared.add(tile);player[name][0].insert(0,(4,tile,3,3))
    # The narrow red canopy stripe shares a scanline with silver and cyan.
    # One transparent sprite keeps all three hull colors and the red accent.
    stripe=np.zeros((8,8),'u1');stripe[0,:3]=(1,2,2)
    canopy=intern(stripe);shared.add(canopy)
    for k,hull in enumerate(player['ship']):
        hull.insert(0,((3,4,5)[k],canopy,1,3))
    inc=[]
    for name in ('ship','force','bit','walker','carrier','pod','green','red'):
        labels=[]
        for k,parts in enumerate(player[name]):
            if name=='force':parts=player['core'][k]+parts
            label=f'pose_{name}_{k}';labels.append(label)
            inc.append(label+': .byte '+','.join(map(str,[v for part in parts for v in part]+[128])))
        for op,side in (('<','lo'),('>','hi')):
            inc.append(f'{name}_{side}: .byte '+','.join(op+label for label in labels))
    for name,rows in {
        'FLARE':['00000000','01221000','12332100','12332100','01221000','00000000','00000000','00000000'],
        'STREAK':['00000000','00000000','00233210','00111110','00000000','00000000','00000000','00000000'],
        'BOLT':['00000000','00000000','00000020','20202333','00000020','00000000','00000000','00000000'],
        'ION':['00000000','00000000','00000023','22200233','00222123','00000000','00000000','00000000'],
        'ION_TRAIL':['00000000','00000000','00000000','00022222','11220000','00000000','00000000','00000000'],
        'HEAD_LEFT':['00000111','00011132','00113331','01111311','13321111','02331123','00131132','00011221'],
        'HEAD_RIGHT':['11100000','12110000','13211000','11221110','11112221','21111110','11111000','11000000'],
        'PELLET':['00000000','00000000','00021000','00232000','00021000','00000000','00000000','00000000'],
        'CHARGE':['00022000','00233200','02333320','23333332','23333332','02333320','00233200','00022000'],
        'SPARK':['30000003','02030020','00232200','03233230','00233200','02032020','20030002','30000003'],
    }.items():
        slot=intern(np.array([[int(c) for c in row] for row in rows]))
        shared.add(slot)
        defs+=f'#define {name} {slot}\n'
    if len(tiles)>240:raise ValueError(f'{len(tiles)} sprite tiles; 240 available')
    # Switch the lower 2 KiB of sprite CHR when the Force grows. Shared
    # actor tiles keep their IDs. Only slots exclusive to the full shell move.
    alt=tiles[:128].copy()
    free=set(range(1,128))-shared
    strip=Image.open(ROOT/'art/actor-small.png')
    def small_slot(ids):
        raw=planar(ids.astype('u1').tobytes())
        if raw in alt:
            n=alt.index(raw);free.discard(n);return n
        n=min(free);free.remove(n);alt[n]=raw;return n
    rail=small_slot(np.array([[int(c) for c in line] for line in (
        '00000000','00000000','00000000','01223320','00111210','00000000','00000000','00000000')]))
    small=[];mid=[]
    for k in range(8):
        pic=np.asarray(strip.crop((16*k,0,16*k+16,16)),float)
        parts=[]
        for pal in (1,2):
            for y in (0,8):
                for x in (0,8):
                    rgb=pic[y:y+8,x:x+8];r,g,b=rgb.transpose(2,0,1)
                    lit=(r>b+26)&(r>80)
                    mask=(rgb.max(2)>45)&(lit if pal==1 else ~lit)
                    dist=((rgb[:,:,None,:]-colors[pal])**2).sum(3)
                    ids=np.where(mask,dist.argmin(2)+1,0)
                    if ids.any():parts.append((y,small_slot(ids),pal,x))
        small.append(parts);mid.append(parts+[(0,rail,2,13),(9,rail,2,13)])
    for name,frames in [('small',small),('middle',mid)]:
        labels=[]
        for k,parts in enumerate(frames):
            label=f'{name}_pose_{k}';labels.append(label)
            inc.append(label+': .byte '+','.join(map(str,[v for part in parts for v in part]+[128])))
        for op,side in (('<','lo'),('>','hi')):
            inc.append(f'{name}_{side}: .byte '+','.join(op+label for label in labels))
    (ROOT/'build/player-poses.inc').write_text('\n'.join(inc))
    (ROOT/'build/small-force.chr').write_bytes(b''.join(alt))
    (ROOT/'build/actors.h').write_text(tables+defs)
    print(f'{len(tiles)} unique actor tiles')
    return b''.join(tiles).ljust(4096,b'\0'),defs

def terrain():
    rgb=np.asarray(Image.open(ROOT/'build/stage-clean.png')).astype(int)
    r,g,b=rgb.transpose(2,0,1)
    hull=(r>104)&(r>b+5)&(g>65)
    # Only the hull attached to the upper/lower edge defines a passage.
    # The ring is deliberately left out of the traversable corridor geometry.
    hull[40:165,330:484]=False
    from scipy.ndimage import binary_closing, label
    joined=binary_closing(hull,structure=np.ones((5,5)),border_value=0)
    labels,_=label(joined); ids=np.unique(labels[np.r_[3:20,189:205]])
    solid=np.isin(labels,ids[ids!=0])
    top=[];floor=[]
    for x in range(0,rgb.shape[1],4):
        up=np.where(solid[:88,x:x+4].any(1))[0]
        lo=np.where(solid[117:,x:x+4].any(1))[0]
        top.append(16+(up[-1]+1 if len(up) else 0))
        floor.append(16+(117+lo[0] if len(lo) else 208))
    return top,floor
