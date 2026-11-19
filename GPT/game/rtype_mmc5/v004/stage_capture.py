"""指定録画の壁を位置合わせし、動くスプライトを除いた横長のマップを抽出する。"""
import subprocess
import sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
OUT = ROOT/'build'

def offsets(frames, times):
    # Fit overlapping pairs at several baselines. Integrating rounded
    # frame-to-frame shifts would accumulate a large error across 73 seconds.
    wall = frames[times, :14, :, 1].astype('int16')
    constraints = []
    shifts = []
    for j in range(len(times)):
        for gap in (1, 9, 25, 45):
            i = j-gap
            if i < 0:
                continue
            guess = round((min(times[j],2184)-min(times[i],2184))*.611)
            start = guess+5
            scores = [np.minimum(abs(wall[i,:,start:247]-wall[j,:,start-d:247-d]),80).mean()
                      for d in range(guess-3,guess+4)]
            k = int(np.argmin(scores))
            if k in (0,6):
                continue
            fraction = .5*(scores[k-1]-scores[k+1])/max(.01,scores[k-1]+scores[k+1]-2*scores[k])
            row = np.zeros(len(times))
            row[i],row[j] = -1,1
            constraints.append(row[1:])
            shifts.append(guess+k-3+fraction)
    return np.r_[0, np.linalg.lstsq(constraints,shifts,rcond=None)[0]]

def extract(path):
    OUT.mkdir(exist_ok=True)
    raw = OUT/'stage.rgb'
    subprocess.run(['ffmpeg','-v','error','-y','-i',path,'-vf','scale=256:208:flags=area',
                    '-an','-f','rawvideo','-pix_fmt','rgb24',str(raw)],check=True)
    f = np.memmap(raw,'u1','r').reshape(-1,208,256,3)
    times = np.arange(0,len(f),6)
    positions = offsets(f,times)
    print('Stopped at',round(positions[-1]),'px. Positions at 5 s intervals:',np.round(positions[::25],1))
    width = 256 + int(round(positions[-1]))
    world = np.empty((208,width,3),'uint8')
    for x in range(width):
        valid = np.flatnonzero((x-positions>=0)&(x-positions<=255))
        if not len(valid): valid=np.array([len(times)-1])
        sx = np.clip(np.rint(x-positions[valid]).astype(int),0,255)
        samples = f[times[valid],:,sx]
        world[:,x] = np.median(samples,axis=0)
    Image.fromarray(world).save(OUT/'mosaic.png')
    capture_motion(world,f,positions,times)
    prepare_art(world,f)
    return world

def capture_motion(world,frames,positions,times):
    # The two hull strips remain visible throughout the background fade.
    rows=np.r_[1:13,195:207]
    hull=world[rows,:,1].astype('int16')
    measured=[]
    for n,guess in enumerate(np.interp(np.arange(len(frames)),times,positions)):
        center=round(guess)
        shifts=np.arange(center-3,center+4)
        ref=frames[n,rows,12:244,1].astype('int16')
        scores=np.array([np.minimum(abs(hull[:,d+12:d+244]-ref),50).mean() for d in shifts])
        i=int(scores.argmin())
        dx=shifts[i]
        if 0<i<len(scores)-1:
            dx=float(dx)+.5*(scores[i-1]-scores[i+1])/max(.01,scores[i-1]+scores[i+1]-2*scores[i])
        measured.append(dx)
    track=np.maximum.accumulate(np.array(measured)-measured[0])
    track=np.clip(track,0,world.shape[1]-256)
    track[-1]=world.shape[1]-256
    (ROOT/'art/camera.bin').write_bytes(np.rint(16*track).astype('<u2').tobytes())

def prepare_art(m,f):
    w=m.shape[1]
    # The centered sample still has the complete ring. Retain its annulus only.
    t=386; pos=round(t*.6108)
    y,x=np.indices(m.shape[:2]);r=((x-406)/64.)**2+((y-103)/74.)**2
    zone=(r>.68)&(r<1.30)&(x>=pos)&(x<pos+256)
    m[zone]=f[t,y[zone],x[zone]-pos]
    patch=(x<406)&(x>331)&(y<85)&(r>.68)&(r<1.30)
    m[patch]=m[y[patch],812-x[patch]]
    # Remove the flying drone visible at only one end of a panel.
    m[78:100,1104:1134]=m[78:100,1061:1091]
    # Restore panel art under the time-dependent global fade. Preserve hulls.
    panel=m[:,620:748].copy()
    panel[:48]=panel[66:114]
    panel[148:]=panel[82:142]
    for x in range(w):
        if 178<=x<1135:
            continue
        col=m[:,x]
        if x>=1430:
            # Only the narrow hull continues behind the moving boss.
            top,bot=15,193
        else:
            warm=(col[:,0].astype(float)>col[:,2]*1.08)&(col[:,0]>84)
            up=np.flatnonzero(warm[:52])
            lo=np.flatnonzero(warm[155:])
            top=up[-1]+2 if len(up) else 0
            bot=lo[0]+154 if len(lo) else 208
        col[top:bot]=panel[top:bot,(x-620)%128]
    Image.fromarray(m).save(ROOT/'art/stage.png')

if __name__=='__main__':
    extract(sys.argv[1])
