"""録画30 Hzの出現コマと座標から、NTSC用の配置表・飛行軌道を生成する。"""
from pathlib import Path
import math
import numpy as np

ROOT=Path(__file__).resolve().parent
RATE=60.0988/30

def write():
    camera=np.fromfile(ROOT/'art/camera.bin','<u2')/16
    # X/Y are centers in the 256x208 capture, before the NES border.
    events=[
        (0,'POW',190,183,'BLUE'),(15,'POD',255,94,0),(105,'POD',255,45,0),
        (558,'SCOUT',255,151,0),(619,'DART',255,140,0),
        (629,'DART',255,126,0),(646,'DART',253,142,0),
        (679,'POW',250,183,'BIT'),(692,'DART',255,57,0),
        (710,'POD',255,142,0),(795,'POD',255,142,'RED'),
        (1022,'GATE_POD',255,99,0),(1315,'WALK',252,170,0),
        (1496,'POD',255,46,'BLUE'),(1536,'FALLING_WALK',255,113,0)]
    for hatch,first,count in ((282,126,5),(749,890,10)):
        for i in range(count):
            t=first+8.73*i
            x=hatch-round(np.interp(t,np.arange(len(camera)),camera))
            events.append((t,'FLY',x,0,0))
    out=ROOT/'build'
    (out/'encounters.h').write_text('static const struct Event events[]={\n'+''.join(
        f'    {{{round(t*RATE)},{kind},{x},{y+16},{drop}}},\n'
        for t,kind,x,y,drop in sorted(events))+'};\n')
    # Straight descent to Y=54, then a quarter turn of about 39 pixels.
    # The two step tables contain world-space motion; the camera is added at runtime.
    def fly(t):
        distance=max(0,(t-1.5)*1.56)
        along=max(0,distance-54)
        angle=min(math.pi/2,along/39)
        return (39*(1-math.cos(angle))+max(0,along-39*math.pi/2),
                min(distance,54)+39*math.sin(angle))
    points=np.rint(np.array([fly(t) for t in range(78)])*16).astype(int)
    dx,dy=np.diff(points,axis=0).T
    # The first gray pod survives through the crest of its vertical pass.
    # Mirror that half-cycle for pods that survive the recorded shots.
    half=[0,1,2,6,11,17,24,31,38,43,47,50,51,51]
    pod=np.rint(np.interp(np.arange(64),np.linspace(0,63,len(half)),half)).astype(int)
    dart=np.rint(10.5*np.sin(np.arange(80)*2*math.pi/80)).astype(int)
    gate=np.rint(np.interp(np.arange(49),[0,4,8,13,20,27,32,39,44,48],
               [0,3,6,8,13,13,8,11,10,8])).astype(int)
    def table(name,seq):return name+': .byte '+','.join(str(int(v)%256) for v in seq)+'\n'
    (out/'flight.inc').write_text(table('fly_dx',dx)+table('fly_dy',dy)+'.segment "ACTORS"\n'+
        table('pod_height',list(pod)+list(pod[::-1]))+table('dart_height',dart)+table('gate_height',gate))
if __name__=='__main__':write()
