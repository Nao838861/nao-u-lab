"""stage_capture.py がデコードした30 Hzの映像から、機体と敵の実寸の姿勢を採る。"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT=Path(__file__).resolve().parent
ART=ROOT/'art'

def extract():
    f=np.memmap(ROOT/'build/stage.rgb','u1','r').reshape(-1,208,256,3)
    cam=np.rint(np.fromfile(ART/'camera.bin','<u2')/16).astype(int)
    world=np.asarray(Image.open(ART/'stage.png')).astype(int)
    def cut(t,x,y,w,h):
        rgb=f[t,y:y+h,x:x+w].astype(int)
        bg=world[y:y+h,cam[t]+x:cam[t]+x+w]
        delta=np.abs(rgb-bg).max(2)
        # A dark outline may adjoin a bright panel. Keep it only next to
        # the object, so panel seams never become part of a moving sprite.
        core=(rgb.max(2)>95)&(delta>28)
        mask=core | (ndimage.binary_dilation(core)&(delta>40)&(rgb.max(2)>40))
        return np.where(mask[:,:,None],rgb,0).astype('u1')
    def save(name,samples,w,h,cleanup=None):
        parts=[]
        for t,x,y in samples:
            p=cut(t,x,y,w,h)
            if cleanup:cleanup(p)
            parts.append(p)
        Image.fromarray(np.concatenate(parts,axis=1)).save(ART/('actor-'+name+'.png'))
    def trim_ship(p):
        p[:4,15:]=0
        p[:2,:]=0
        p[-3:,19:]=0
        # Prevent core pixels at the right join appearing orange on banking.
        r,g,b=p.astype(int).transpose(2,0,1)
        p[:,20:][((r>g*1.5)&(r>b+32))[:,20:]]=0
    save('ship',[(1280,7,94),(819,169,121),(1604,31,128)],24,18,trim_ship)
    # At the start of the clip the R-9 carries a smaller, bare Force.
    # Here the star field is black and the player holds still for one turn.
    pieces=[]
    for t in (0,2,3,5,7,8,10,12):
        part=f[t,146:162,84:100].copy()
        part[:,:2]=0;part[:2]=0;part[:,14:]=0
        pieces.append(np.where((part.max(2)>36)[:,:,None],part,0))
    Image.fromarray(np.concatenate(pieces,1).astype('u1')).save(ART/'actor-small.png')
    def trim_force(p):
        p[0:4,:5]=0;p[-4:,:5]=0
        p[7:15,:7]=0
        r,g,b=p.astype(int).transpose(2,0,1)
        p[(b>r+20)&(b>110)]=0
        p[19:,:9]=0
    save('force',[(1280+n,21,91) for n in (0,2,4,6,8,10,13,15)],25,24,trim_force)
    save('bit',[(1280+n,12,70) for n in (0,3,6,9,12,15,18,22)],13,14)
    save('carrier',[(0,178,170),(695,222,170)],23,23)
    save('scout',[(566,230,136),(570,223,136)],21,29)
    save('pod',[(45,152,133)],22,24)
    save('green',[(145,183,49)],18,20)
    save('turn',[(894,193,0),(909,181,48),(914,172,63),(917,161,72),(926,135,82)],22,22)
    save('wing',[(649,232,136),(622,235,135),(625,228,137),(627,219,139),(629,215,137)],20,22)
    save('red',[(625,229,141)],19,17)
    save('walker',[(1430,112,149),(1386,177,149),(1394,162,149),(1498,95,88)],34,44)
    save('crystal',[(900,162,144),(1560,157,84)],16,17)
    save('satellite',[(785,161,171)],12,12)
    # Use the registered median after a mount disappeared but while its
    # supporting plate is still on screen. Replace the projecting cap only.
    from turret_layout import TURRETS
    patches=[]
    for x,y,last in TURRETS:
        times=[n for n in range(last+18,min(last+110,len(f)),3) if 9<x-cam[n]<247]
        patch=world[y-7:y+7,x-7:x+7].copy()
        if times:
            clear=np.median([f[n,y-7:y+7,x-cam[n]-7:x-cam[n]+7] for n in times],axis=0)
        else:clear=patch.copy()
        r,g,b=patch.transpose(2,0,1)
        mask=np.zeros((14,14),'u1')
        mask[1:13,2:12]=1
        mask*=ndimage.binary_dilation((r>b+14)&(g>75),iterations=1)
        if y<100:mask[:2]=0
        else:mask[-2:]=0
        dark=(clear.max(2)<35)&(world[y-7:y+7,x-7:x+7].max(2)>65)
        if x<230:clear[dark]=[56,64,71]
        patches.append(np.dstack((clear.astype('u1'),mask*255)))
    Image.fromarray(np.concatenate(patches,axis=1)).save(ART/'turret-underlay.png')
    # The top sprite includes its bracket. The floor version is turned over.
    save('gun',[(120,235,15)],13,12)
    # Fit the two stable animations independently. A lag local minimum
    # measures recurrence without confusing the near-identical next frame.
    for name,(x,y,r,b) in {'ビット':(15,72,22,81),'フォース':(30,98,42,111)}.items():
        a=f[1200:1350,y:b,x:r].astype(float)
        period=min(range(13,32),key=lambda k:abs(a[k:]-a[:-k]).mean())
        print(name,period,'コマ')
if __name__=='__main__':extract()
