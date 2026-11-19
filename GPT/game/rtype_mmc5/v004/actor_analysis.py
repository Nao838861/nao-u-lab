"""録画を一コマずつ追う。再計測には stage_capture.py の RGB と OpenCV が必要。"""
import csv
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parent

def measure():
    import cv2
    frames=np.memmap(ROOT/'build/stage.rgb','u1','r').reshape(-1,208,256,3)
    # Templates are small rigid parts: cockpit, carrier chassis, walker's
    # shoulder and crystal. A destroyed target ends its observation interval.
    anchors=[
        ('灰色飛行体',45,(156,138,169,150),18,54),
        ('灰色飛行体2',45,(156,138,169,150),714,726),
        ('赤結晶の運搬体',45,(156,138,169,150),798,804),
        ('青結晶の運搬体',45,(156,138,169,150),1498,1516),
        ('床の運搬機',0,(183,174,197,183),0,48),
        ('下降編隊',145,(187,53,198,64),142,153),
        ('赤結晶',900,(164,148,175,159),824,1000),
        ('歩兵',1430,(123,153,138,169),1332,1510)]
    records=[]
    for name,t,(x,y,r,b),first,last in anchors:
        tpl=frames[t,y:b,x:r]
        for j in range(first,last+1):
            _,score,_,(sx,sy)=cv2.minMaxLoc(cv2.matchTemplate(frames[j],tpl,cv2.TM_CCOEFF_NORMED))
            if score>=.74:records.append((name,j,sx,sy,round(score,3)))
    for name,first,last,start,vx,vy in [
        ('橙弾・左上',950,966,(172,119),-2.85,-1.65),
        ('橙弾・左下',1590,1606,(84,65),-2.88,1.63)]:
        for j in range(first,last+1):
            x,y=np.rint(np.array(start)+(j-first)*np.array((vx,vy))).astype(int)
            crop=frames[j,y-3:y+5,x-3:x+5].astype(int)
            r,g,b=crop.transpose(2,0,1)
            points=np.argwhere((r>150)&(r>g*1.3)&(g>b*1.4)&(g>35))
            if len(points):
                yy,xx=np.median(points,axis=0)
                records.append((name,j,round(x-3+xx,1),round(y-3+yy,1),''))
    # Confirm stationary gun positions independently by world registration.
    from turret_layout import TURRETS
    camera=np.fromfile(ROOT/'art/camera.bin','<u2')/16
    for i,(wx,wy,last) in enumerate(TURRETS,1):
        t,x,y=(0,159,152) if wy==158 else (120,235,16)
        tpl=frames[t,y:y+13,x:x+13]
        for j in range(max(0,last-100),last+1,4):
            sx=round(wx-camera[j]);sy=wy
            if not 9<=sx<=245:continue
            roi=frames[j,sy-9:sy+10,sx-9:sx+10]
            _,score,_,(dx,dy)=cv2.minMaxLoc(cv2.matchTemplate(roi,tpl,cv2.TM_CCOEFF_NORMED))
            if score>.72:records.append((f'砲台{i:02d}',j,sx-3+dx,sy-3+dy,round(score,3)))
    with (ROOT/'art/actor-tracks.csv').open('w',encoding='utf8',newline='') as handle:
        writer=csv.writer(handle);writer.writerow(('対象','録画コマ','x','y','相関'));writer.writerows(records)
if __name__=='__main__':measure()
