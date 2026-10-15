"""MMC5Racingの保存済み原座標から、地面比較用メッシュと周回姿勢を生成。"""
import json,math
from pathlib import Path
from build_bitmap import ROOT

SOURCE=ROOT/'demos/ground/v002/course.json'

def distance(p,a,b):
    dx,dz=b[0]-a[0],b[1]-a[1]
    t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)))
    return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz)

def reduced_indices(points,count):
    ids=list(range(len(points)))
    while len(ids)>count:
        scores=[]
        for i,k in enumerate(ids):
            a,b=ids[i-1],ids[(i+1)%len(ids)];span=[];j=a
            while True:
                span.append(j)
                if j==b:break
                j=(j+1)%len(points)
            scores.append((max(distance(points[j],points[a],points[b]) for j in span),k))
        ids.remove(min(scores)[1])
    return ids

def unit(x,z):
    length=math.hypot(x,z)
    return x/length,z/length

def tangents(points):
    result=[]
    for i,p in enumerate(points):
        a,b=points[i-1],points[(i+1)%len(points)]
        incoming=unit(p[0]-a[0],p[1]-a[1]);outgoing=unit(b[0]-p[0],b[1]-p[1])
        result.append(unit(incoming[0]+outgoing[0],incoming[1]+outgoing[1]))
    return result

def source_data():return json.loads(SOURCE.read_text())

def road():
    data=source_data();points=data['source_centerline'];ids=reduced_indices(points,data['mesh_cross_sections'])
    directions=tangents(points)
    area=sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(points,points[1:]+points[:1]))
    sign=1 if area<0 else -1
    half,kerb=data['source_half_width'],data['source_kerb_width'];scale=data['world_scale']
    rings=[]
    for offset in [-half,-half+kerb,half-kerb,half]:
        ring=[]
        for k in ids:
            x,z=points[k];tx,tz=directions[k]
            ring.append((round((x-sign*tz*offset-320)/scale*128),0,
                         round((z+sign*tx*offset-320)/scale*128)))
        rings.append(ring)
    error=max(min(distance(p,points[a],points[b]) for a,b in zip(ids,ids[1:]+ids[:1])) for p in points)
    return rings,{'name':data['name'],'source_centerline':points,'selected_indices':ids,
                  'centerline_max_error_source_px':error,'world_scale':scale,
                  'source_revision':data['source_revision'],'source_files':data['source_files']}

def geometry():
    rings,metadata=road();n=len(rings[0]);vertices=[p for ring in rings for p in ring];faces=[]
    for lo,hi,color in [(1,2,2),(0,1,3),(2,3,3)]:
        for i in range(n):
            j=(i+1)%n;faces.append([color,0,lo*n+i,hi*n+i,hi*n+j,lo*n+j])
    first=len(vertices)
    local=[(round((1.6 if i&1 else -1.6)*128),round((1.6 if i&2 else .1)*128),round((3 if i&4 else -3)*128)) for i in range(8)]
    vertices+=local
    for base in [first]:
        for axis in range(3):
            other=[k for k in range(3) if k!=axis]
            for side in (0,1):
                if axis==1 and side==0:continue
                ids=[(side<<axis)|(a<<other[0])|(b<<other[1]) for a,b in [(0,0),(1,0),(1,1),(0,1)]]
                if (1 if axis%2==0 else -1)!=(1 if side else -1):ids.reverse()
                faces.append([3 if axis==1 else (0 if axis==0 else 2),1,*[base+k for k in ids]])
    return vertices,faces,rings,metadata

def route():
    data=source_data();points=data['source_centerline'];directions=tangents(points)
    lengths=[math.dist(a,b) for a,b in zip(points,points[1:]+points[:1])];total=sum(lengths);result=[]
    for phase in range(64):
        remaining=total*phase/64;segment=0
        while remaining>=lengths[segment] and segment<len(points)-1:
            remaining-=lengths[segment];segment+=1
        t=remaining/lengths[segment];a,b=points[segment],points[(segment+1)%len(points)]
        da,db=directions[segment],directions[(segment+1)%len(points)]
        tx,tz=unit(da[0]+t*(db[0]-da[0]),da[1]+t*(db[1]-da[1]))
        result.append((a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1]),tx,tz))
    return result

def poses(view,views):
    back,h,pitch=views[view];scale=source_data()['world_scale'];result=[]
    for sx,sz,sn,cs in route():
        x,z=(sx-320)/scale,(sz-320)/scale
        result.append([round((x-back*sn)*128),round((z-back*cs)*128),round(h*128),round(cs*256),round(sn*256),
                       round(math.cos(pitch)*256),round(math.sin(pitch)*256),round(x*128),round(z*128),round(cs*256),round(sn*256)])
    return result

def texture(rings,inside):
    result=bytearray()
    for v in range(64):
        for u in range(64):
            x,z=(u+.5)*2-64,(v+.5)*2-64
            c=1
            if inside(x,z,rings[3]) and not inside(x,z,rings[0]):
                c=2 if inside(x,z,rings[2]) and not inside(x,z,rings[1]) else 3
            elif (u*13+v*7)%47==0:c=2
            result.append(c)
    return result
