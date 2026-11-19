"""歩兵の踏み込みと離陸を、録画と通常プレイの同じ時刻で横に並べる。"""
from pathlib import Path
import subprocess
import numpy as np
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parent
def compare():
    raw=np.memmap(ROOT/'build/stage.rgb','u1','r').reshape(-1,208,256,3)
    report=(ROOT/'build/actor-check/journey-result.txt').read_text()
    first=int(dict(entry.split('=') for entry in report.split())['first'])
    screen=Image.new('RGB',(1024,458),'#15181c')
    font=ImageFont.truetype('C:/Windows/Fonts/meiryo.ttc',20)
    draw=ImageDraw.Draw(screen)
    draw.text((12,5),'アーケード録画',font=font,fill='white')
    draw.text((524,5),'ファミコン MMC5 ・ Mesen',font=font,fill='white')
    command=['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1024x458',
             '-r','30','-i','-','-an','-c:v','libx264','-crf','17','-pix_fmt','yuv420p',
             '-movflags','+faststart',str(ROOT/'walker-comparison.mp4')]
    with subprocess.Popen(command,stdin=subprocess.PIPE) as encoder:
        for t in range(1321,1512):
            frame=round((first+t*60.0988/30-14)/2)
            with Image.open(ROOT/f'build/actor-check/play{frame:04d}.png') as nes:
                right=nes.convert('RGB').crop((0,16,256,224))
            for x,pic in ((0,Image.fromarray(raw[t])),(512,right)):
                screen.paste(pic.resize((512,416),Image.Resampling.NEAREST),(x,42))
            encoder.stdin.write(screen.tobytes())
        encoder.stdin.close()
        if encoder.wait():raise RuntimeError('動画を書き出せなかった')
if __name__=='__main__':compare()
