"""対空レーザーの発生・交差・飛行を、連続した上下の円弧から切り出す。"""
import math
import numpy as np

WIDTH, HEIGHT = 56, 56
OPENING = (34, 50, 68, 88, 111, 136, 158, 180)
FLIGHT_STEPS = 12

def position(angle):
    lobe = int(angle // math.pi)
    part = angle - lobe * math.pi
    radius_x, radius_y = (20, 21) if lobe == 0 else (12, 11)
    start = 0 if lobe == 0 else 40 + (lobe-1)*32
    return (4 + start + radius_x*(1-math.cos(part)),
            (-1)**lobe * radius_y * math.sin(part))

def make_phases():
    phases, offsets = [], []
    yy,xx = np.indices((HEIGHT,WIDTH))
    def angle_at(x):
        if x<40: return math.acos(1-x/20)
        lobe,local=divmod(x-40,24)
        return (1+lobe)*math.pi+math.acos(1-local/12)
    heads=[20*(1-math.cos(math.radians(a))) for a in OPENING]
    heads.extend(40+4*i for i in range(1,25))
    for head in heads:
        angle=angle_at(head)
        tail=angle_at(max(0,head-40))

        offset=int((position(tail)[0]-2)//8)
        offsets.append(offset)
        # Each strand has a saturated rim, a narrow light core and a bright cap.
        phase=np.zeros((HEIGHT,WIDTH),dtype='uint8')
        for sign,color in [(1,1),(-1,2)]:
            distance=np.full((HEIGHT,WIDTH),np.inf)
            for theta in np.linspace(tail,angle,100):
                x,y=position(theta)
                distance=np.minimum(distance,(xx-(x-8*offset))**2+(yy-(24+sign*y))**2)
            x,y=position(angle)
            cap=(xx-(x-8*offset))**2+(yy-(24+sign*y))**2
            phase[distance<=1.56**2]=color
            phase[(distance<=0.54**2)|(cap<=1.20**2)]=color+2
        phases.append(phase)
    return phases, offsets

def split_tile(tile):
    red=(tile==1)|(tile==3)
    blue=(tile==2)|(tile==4)
    if red.any() and blue.any():
        return 0, np.where(red,1,np.where(blue,2,0)).astype('u1').tobytes()
    palette=1 if red.any() else 2
    return palette, np.where(tile>2,2,np.where(tile>0,1,0)).astype('u1').tobytes()
