"""無射撃のROMと録画で同じ敵を追い、出現数と中心位置を照合する。"""
import argparse
import csv
from pathlib import Path
import subprocess

import numpy as np
import verify_actors

ROOT=verify_actors.ROOT
OUT=ROOT/'build/track-check'
RATE=60.0988/30
KINDS={'FLY':3,'DART':4,'POD':2,'GATE':2,'SCOUT':8,'WALK':5,'LAND':5}

def read_trace(path):
    rows={};spawns=[]
    with path.open() as fp:
        for line in csv.reader(fp):
            t=int(line[0])
            current=[tuple(map(int,col.split('/'))) for col in line[2:]]
            for slot,(kind,age,x,y) in enumerate(current):
                if kind and age==1:spawns.append((t,kind,slot))
            rows[t]=current
    return rows,spawns

def positions(path,baseline=False):
    states,spawns=read_trace(path)
    with (ROOT/'art/encounter-paths.csv').open(encoding='utf8') as fp:
        observations=list(csv.reader(fp))[1:]
    errors={};assigned={};used=set()
    for kind,entry,frame,x,y in observations:
        entry,frame=int(entry),int(frame);key=kind,entry
        if key not in assigned:
            expected=5 if baseline and kind=='SCOUT' else KINDS[kind]
            candidates=[s for s in spawns if s not in used and s[1]==expected and abs(s[0]/RATE-entry)<(15 if kind in ('SCOUT','LAND') else 7)]
            if not candidates:assigned[key]=None;continue
            start=min(candidates,key=lambda s:abs(s[0]/RATE-entry));assigned[key]=start;used.add(start)
        start=assigned[key];tick=round(frame*RATE)
        if start is None or tick<start[0]:continue
        # A slot may be reused later. A different birth is a different ship.
        if any(t>start[0] and t<=tick and slot==start[2] for t,_,slot in spawns):continue
        live,_,rx,ry=states[tick][start[2]]
        if live==start[1]:errors[kind,entry,frame]=(abs(rx-float(x)),abs(ry-float(y)))
    return errors,spawns

def check(baseline=None):
    errors,spawns=positions(OUT/'encounter-path.csv')
    assert sum(k==3 for t,k,i in spawns)==15
    assert sum(k==4 for t,k,i in spawns)==4
    assert int((OUT/'encounter-missed.txt').read_text())==0
    old=positions(baseline,True)[0] if baseline else None
    for kind in KINDS:
        keys=[k for k in errors if k[0]==kind]
        assert keys,kind
        xy=np.array([errors[k] for k in keys])
        print(kind,len(xy),'median X/Y',np.median(xy,axis=0),'90% X/Y',np.quantile(xy,.9,axis=0).round(1))
        assert np.quantile(xy,.9,axis=0).max()<7,(kind,xy.max(0))
        if old:
            both=[k for k in keys if k in old]
            if both:
                print('  matched frames',len(both),'median distance before/after',[
                    round(np.median([np.hypot(*group[k]) for k in both]),1) for group in (old,errors)])

def film():
    from PIL import Image,ImageDraw,ImageFont
    recording=np.memmap(ROOT/'build/stage.rgb','u1','r').reshape(-1,208,256,3)
    pic=Image.new('RGB',(1024,470),'#16191e')
    draw=ImageDraw.Draw(pic);font=ImageFont.truetype('C:/Windows/Fonts/meiryo.ttc',19)
    draw.text((12,7),'アーケード録画',font=font,fill='white')
    draw.text((524,7),'MMC5 ・ 敵の軌跡を確認するため射撃を停止',font=font,fill='white')
    # Source and ROM advance at their actual recorded rates.
    spans=[(120,191,'天井からの編隊'),(551,578,'段差を歩く小型敵'),(614,713,'赤い飛行敵'),
           (885,1004,'二つ目の降下編隊'),(1021,1051,'狭い通路の飛行体'),(1542,1609,'降下して着地する大型歩兵')]
    command=['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1024x470','-r','30',
             '-i','-','-an','-c:v','libx264','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',str(ROOT/'enemy-movement.mp4')]
    with subprocess.Popen(command,stdin=subprocess.PIPE) as encoder:
        for first,last,title in spans:
            draw.rectangle((0,450,1024,470),fill='#16191e')
            draw.text((12,446),title,font=font,fill='white')
            for t in range(first,last+1):
                tick=2*round(t*RATE/2)
                with Image.open(OUT/f'encounter{tick}.png') as emulated:
                    for x,image in ((0,Image.fromarray(recording[t])),(512,emulated.crop((0,16,256,224)))):
                        pic.paste(image.resize((512,416),Image.Resampling.NEAREST),(x,33))
                encoder.stdin.write(pic.tobytes())
        encoder.stdin.close()
        if encoder.wait():raise RuntimeError('比較動画の書き出しに失敗')

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--film',action='store_true');parser.add_argument('--baseline',type=Path)
    args=parser.parse_args()
    verify_actors.OUT=OUT
    verify_actors.run('rtype-mmc5-v004.nes','cart.lbl','encounter_test.lua',args.film)
    check(args.baseline)
    if args.film:film()
