"""整数の幾何式による独立参照。GSU命令やRAM配置には依存しない。"""
import math
from PIL import Image

def transform(config, view, phase):
    cx,cz,h,cs,sn,cp,sp,ox,oz,oc,os=config['views'][view]['poses'][phase]
    result=[]
    for i,(x,y,z) in enumerate(config['vertices']):
        if 64<=i<72:x,z=(x*oc//256+z*os//256+ox,z*oc//256-x*os//256+oz)
        x-=cx;z-=cz
        forward=x*sn//256+z*cs//256
        result.append((x*cs//256-z*sn//256,(h-y)*cp//256-forward*sp//256,
                       forward*cp//256+(h-y)*sp//256))
    return result

def clip(poly, plane, far=False):
    output=[]
    for a,b in zip(poly[-1:]+poly[:-1],poly):
        ain=(a[2]<=plane) if far else (a[2]>=plane)
        bin=(b[2]<=plane) if far else (b[2]>=plane)
        if ain!=bin:
            out,ins=(b,a) if ain else (a,b)
            t=(abs(plane-out[2])<<14)//abs(ins[2]-out[2])
            output.append((out[0]+(ins[0]-out[0])*t//16384,out[1]+(ins[1]-out[1])*t//16384,plane))
        if bin:output.append(b)
    return output

def project(p):
    x,y,z=p
    return (128+(1 if x>=0 else -1)*(abs(x)*128//z),96+(1 if y>=0 else -1)*(abs(y)*128//z))

def reference(config,view,mode,phase):
    horizon=max(0,min(192,math.ceil(96-128*math.tan(config['views'][view]['camera'][2]))))
    pixels=bytearray([0])*(horizon*256)+bytearray([1])*((192-horizon)*256)
    cx,cz,h,cs,sn,*_=config['views'][view]['poses'][phase]
    if mode:
        tex=config['texture']
        for y,(forward,half) in enumerate(config['views'][view]['rows']):
            if forward==32767:continue
            u=cx+forward*sn//256-half*cs//256+8192
            v=cz+forward*cs//256+half*sn//256+8192
            du=half*cs//32768;dv=-(half*sn//32768)
            for x in range(256):
                a,b=u//256,v//256
                pixels[y*256+x]=tex[b*64+a] if 0<=a<64 and 0<=b<64 else 1
                u+=du;v+=dv
    camera=transform(config,view,phase)
    visible=0
    for f,(color,cull,*ids) in enumerate(config['faces']):
        if mode and f<48:continue
        poly=clip([camera[i] for i in ids],256)
        if len(poly)<3:continue
        poly=clip(poly,18432,True)
        if len(poly)<3:continue
        xy=[project(p) for p in poly]
        if cull:
            a,b,c=xy[:3]
            if (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])<0:continue
        left=[32767]*192;right=[-32768]*192
        for a,b in zip(xy,xy[1:]+xy[:1]):
            if a[1]>b[1]:a,b=b,a
            dy=b[1]-a[1]
            if not dy:continue
            for y in range(max(0,a[1]),min(192,b[1])):
                numerator=a[0]*dy+(b[0]-a[0])*(y-a[1])
                left[y]=min(left[y],-(-numerator//dy))
                right[y]=max(right[y],numerator//dy)
        drawn=False
        for y in range(192):
            lo=max(0,left[y]);hi=min(255,right[y])
            if lo<=hi:pixels[y*256+lo:y*256+hi+1]=bytes([color])*(hi-lo+1);drawn=True
        visible+=drawn
    im=Image.new('RGB',(256,192));im.putdata([tuple(config['palette'][c]) for c in pixels])
    return pixels,im,visible
