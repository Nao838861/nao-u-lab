"""stage_capture.py が生成した位置合わせ済み素材から胴体と尻尾の座標を取り出す。"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.graph import route_through_array

ROOT=Path(__file__).resolve().parent
FIRST,LAST=2125,2203
ROOT_JOINT=np.array((173.,169.))

def extract():
    frames=np.memmap(ROOT/'build/stage.rgb','u1','r').reshape(-1,208,256,3)
    camera=np.fromfile(ROOT/'art/camera.bin','<u2')/16
    panorama=Image.open(ROOT/'build/mosaic.png')
    panorama.crop((1448,14,1590,193)).save(ROOT/'art/boss-body.png')
    base=np.array(panorama.crop((1334,0,1590,208))).astype('int16')
    yy,xx=np.indices(base.shape[:2])
    last=np.array((118.,106.))
    poses=[]
    for frame in range(FIRST,LAST+1):
        shift=1334-round(camera[frame])
        image=np.zeros_like(base)
        image[:,:256-shift]=frames[frame,:,shift:]
        r,g,b=image.transpose(2,0,1)
        delta=abs(image-base).max(2)
        green=(g>r+5)&(g>b+24)&(g>78)&(delta>26)&(xx>35)&(xx<199)&(yy>45)&(yy<190)
        labels,num=ndimage.label(green)
        candidates=[]
        for i,part in enumerate(ndimage.find_objects(labels),1):
            pixels=np.argwhere(labels[part]==i)
            if not 9<=len(pixels)<=31:continue
            tip=pixels.mean(0)[::-1]+[part[1].start,part[0].start]
            candidates.append((np.linalg.norm(tip-last)+.32*abs(len(pixels)-16),tip))
        tip=min(candidates,key=lambda item:item[0])[1]
        assert np.linalg.norm(last-tip)<15,frame
        last=tip
        skin=(r>95)&(r>g+19)&(g>b+6)&(yy>48)&(yy<193)&(xx>36)&(xx<197)
        skin&=(delta>40)|((xx>=161)&(yy>153)&(yy<176))
        radius=ndimage.distance_transform_edt(ndimage.binary_closing(skin))
        path,_=route_through_array(1+18/(.6+radius)**1.7,
                                  tuple(ROOT_JOINT[::-1].astype(int)),tuple(np.rint(tip[::-1]).astype(int)))
        xy=ndimage.gaussian_filter1d(np.array(path,float)[:,::-1],1.4,axis=0,mode='nearest')
        xy[0],xy[-1]=ROOT_JOINT,tip
        distance=np.r_[0,np.cumsum(np.linalg.norm(np.diff(xy,axis=0)*[1,.85],axis=1))]
        nodes=np.linspace(0,distance[-1],18)
        poses.append(np.stack([np.interp(nodes,distance,col) for col in xy.T],axis=1))
    (ROOT/'art/boss-tail.bin').write_bytes(np.rint(poses).astype('u1').tobytes())

if __name__=='__main__':
    extract()
