"""GSU命令を使わない数式による独立参照。透視・面ソート・16.16辺と画面クリップ。"""
from PIL import Image


def project(config,phase,obj):
    m=config['matrices'][(phase+obj[3])&63]
    result=[]
    for v in config['vertices']:
        x,y,z=[(sum(v[k]*m[a*3+k] for k in range(3))>>7)+obj[a] for a in range(3)]
        if not 32<=z<512:result.append((x,y,0));continue
        factor=32768//z
        result.append(((x*factor>>8)+128,(y*factor>>8)+120,z))
    return result


def slope(dx,dy):
    if dy==0:return 0
    if dy==1:return dx<<16
    magnitude=(abs(dx)*((1<<24)//dy))>>8
    return magnitude if dx>=0 else -magnitude


def triangle(xyz):
    (x0,y0),(xm,ym),(x1,y1)=sorted(xyz,key=lambda v:v[1])
    if y1==y0 or y1-y0>=512:return
    long=slope(x1-x0,y1-y0)
    for ya,yb,xa,xb in [(y0,ym,x0,xm),(ym,y1,xm,x1)]:
        short=slope(xb-xa,yb-ya)
        for y in range(max(ya,0),min(yb,240)):
            a=(x0<<16)+long*(y-y0);b=(xa<<16)+short*(y-ya)
            lo=max(0,(min(a,b)+65535)>>16);hi=min(255,max(a,b)>>16)
            if lo<=hi:yield y,lo,hi


def bresenham_triangle(xyz):
    spans={}
    for i in range(3):
        x,y=xyz[i];x1,y1=xyz[(i+1)%3]
        dx=abs(x1-x);sx=1 if x<x1 else -1;dy=-abs(y1-y);sy=1 if y<y1 else -1;err=dx+dy
        while True:
            if 0<=y<240:
                lo,hi=spans.get(y,(32767,-32768));spans[y]=(min(lo,x),max(hi,x))
            if (x,y)==(x1,y1):break
            twice=err*2
            if twice>=dy:err+=dy;x+=sx
            if twice<=dx:err+=dx;y+=sy
    for y,(lo,hi) in sorted(spans.items()):
        lo=max(0,lo);hi=min(255,hi)
        if lo<=hi:yield y,lo,hi


def small_triangle(vertices):
    p,q,r=vertices
    low=min(v[1] for v in vertices);high=max(v[1] for v in vertices)
    return high-low<16 and abs(q[0]-p[0])<=16 and abs(r[0]-p[0])<=16


def reference(config,phase):
    pixels=bytearray(61440)
    stats={'vertices':0,'submitted':0,'visible':0,'near_rejected':0,'drawn':0,'spans':0,'pixel_writes':0}
    last=None
    objects=config['objects']
    if 'depth_motion' in config:
        entries=[((o[0],o[1],o[2]+config['depth_motion'][(phase+o[3])&63],o[3]),(o[2]<<6)|o[3]) for o in objects]
        objects=[e[0] for e in sorted(entries,key=lambda e:(-e[0][2],e[1]))]
    for obj in objects:
        projected=project(config,phase,obj);last=projected;stats['vertices']+=len(projected)
        visible=[]
        for color,a,b,c in config['triangles']:
            stats['submitted']+=1
            p,q,r=projected[a],projected[b],projected[c]
            if min(p[2],q[2],r[2])==0:stats['near_rejected']+=1;continue
            area=(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])
            if area>=0:continue
            visible.append((p[2]+q[2]+r[2],color,(p[:2],q[:2],r[:2])))
        stats['visible']+=len(visible)
        for z,color,vertices in sorted(visible,key=lambda v:-v[0]):
            use_bresenham=config.get('renderer')=='baseline' or small_triangle(vertices)
            spans=list((bresenham_triangle if use_bresenham else triangle)(vertices))
            stats['drawn']+=bool(spans)
            for y,lo,hi in spans:
                pixels[y*256+lo:y*256+hi+1]=bytes([color])*(hi-lo+1)
                stats['spans']+=1;stats['pixel_writes']+=hi-lo+1
    stats['covered_pixels']=sum(c!=0 for c in pixels)
    stats['overdraw']=stats['pixel_writes']/max(1,stats['covered_pixels'])
    colors=[(0,0,0),(255,254,255),(72,205,222),(160,26,204)]
    image=Image.frombytes('RGB',(256,240),b''.join(bytes(colors[c]) for c in pixels))
    return pixels,image,stats,last
