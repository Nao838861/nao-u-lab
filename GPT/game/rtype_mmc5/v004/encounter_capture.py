"""提供録画から編隊の腹、赤い翼、コックピット、歩兵の肩を再計測する。"""
import csv
from pathlib import Path

import cv2
import numpy as np

ROOT=Path(__file__).resolve().parent

def measure():
    frames=np.memmap(ROOT/'build/stage.rgb','u1','r').reshape(-1,208,256,3)
    camera=np.fromfile(ROOT/'art/camera.bin','<u2')/16
    samples=[]
    def record(kind,entry,t,x,y):
        samples.append((kind,entry,t,round(float(x),1),round(float(y),1)))
    # Association windows only disambiguate neighboring ships. Coordinates
    # below always come from actual color components or template matches.
    for hatch,first,count in ((282,126,5),(749,890,10)):
        for i in range(count):
            entry=round(first+8.73*i)
            for age in range(2,39):
                t=entry+age
                y=np.interp(age,[0,17,25,31,38],[0,53,77,89,95])
                dx=np.interp(age,[0,17,25,31,38],[0,0,9,23,42])
                x=hatch-camera[t]-dx
                x0,y0=round(x)-8,max(0,round(y)-7)
                crop=frames[t,y0:round(y)+8,x0:round(x)+9].astype(int)
                r,g,b=crop.transpose(2,0,1)
                mask=(g>r+13)&(g>b+16)&(g>65)
                yy,xx=np.where(mask)
                if not 17<=len(xx)<=35 or np.ptp(xx)>12 or np.ptp(yy)>10:continue
                record('FLY',entry,t,x0+xx.mean()+1.5,y0+yy.mean()-3.5)
    for entry,base,last in ((619,140,633),(629,126,633),(646,142,655),(692,57,701)):
        for t in range(entry,last+1):
            x=round(254-3*(t-entry));y=base+5
            x0=max(0,x-9);y0=y-13
            crop=frames[t,y0:y+15,x0:min(256,x+11)].astype(int);r,g,b=crop.transpose(2,0,1)
            yy,xx=np.where((r>87)&(r>g*2.7+20)&(b<g+47))
            if len(xx)>=20:record('DART',entry,t,x0+xx.mean(),y0+yy.mean())
    for kind,entry,first,last,frame,box,offset,region in (
        ('POD',15,17,54,45,(156,138,169,150),(7,7),(115,85,256,155)),
        ('POD',105,107,126,45,(156,138,169,150),(7,7),(150,33,256,105)),
        ('POD',710,713,726,45,(156,138,169,150),(7,7),(180,125,256,190)),
        ('POD',795,798,804,45,(156,138,169,150),(7,7),(200,126,256,170)),
        ('GATE',1022,1024,1048,45,(156,138,169,150),(7,7),(211,82,256,125)),
        ('POD',1496,1498,1516,45,(156,138,169,150),(7,7),(160,30,256,110)),
        ('WALK',1315,1332,1510,1430,(123,153,138,169),(4,18),(80,82,256,188)),
        ('LAND',1536,1548,1622,1430,(123,153,138,169),(4,18),(164,95,256,180)),
        ('SCOUT',557,562,574,570,(228,142,240,154),(5,9),(210,131,256,169))):
        x,y,r,b=box;l,u,v,d=region
        template=frames[frame,y:b,x:r]
        for t in range(first,last+1):
            _,score,_,(sx,sy)=cv2.minMaxLoc(cv2.matchTemplate(frames[t,u:d,l:v],template,cv2.TM_CCOEFF_NORMED))
            if score>=.74:record(kind,entry,t,l+sx+offset[0],u+sy+offset[1])
    with (ROOT/'art/encounter-paths.csv').open('w',newline='',encoding='utf8') as fp:
        writer=csv.writer(fp);writer.writerow(('対象','出現コマ','録画コマ','中心X','中心Y'))
        writer.writerows(sorted(samples,key=lambda row:(row[1],row[2])))
if __name__=='__main__':measure()
