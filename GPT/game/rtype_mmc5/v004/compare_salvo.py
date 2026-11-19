"""指定録画と通常プレイの発射・追尾開始をそろえて、等速とスローで比較する。"""
import argparse
import csv
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont
import verify_actors as game


def film():
    frames = np.memmap(game.ROOT/'build/stage.rgb', 'u1', 'r').reshape(-1, 208, 256, 3)
    with (game.OUT/'salvo-frames.csv').open() as stream:
        events = [(kind, *map(int, data)) for kind, *data in csv.reader(stream)]
    def launch(color, time):
        return min((r for r in events if r[0]=='launch' and r[2]==color),
                   key=lambda r: abs(r[1]-time))

    red, blue = launch(1, 2390), launch(2, 3560)
    turn = min((r for r in events if r[0]=='turn' and 32<r[3]<226),
               key=lambda r: abs(r[1]-2900))
    # Each pair is aligned on the event itself. Inputs and stage progress differ.
    scenes = [('対空レーザーと上下のミサイル', 1196, red[1], (62, 101), (red[3]+49, red[4]-16)),
              ('反射レーザーと機首の通常弾', 2042, blue[1], (62, 101), (blue[3]+49, blue[4]-16)),
              ('ミサイルが敵に向かって曲がる瞬間', 1459, turn[1], (92, 106), (turn[3], turn[4]-16))]
    font = ImageFont.truetype('C:/Windows/Fonts/meiryo.ttc', 20)
    path = game.ROOT/'player-weapons.mp4'
    command = ['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1024x686',
               '-r','30','-i','-','-an','-c:v','libx264','-crf','16','-pix_fmt','yuv420p',
               '-movflags','+faststart',str(path)]
    with subprocess.Popen(command, stdin=subprocess.PIPE) as encoder:
        for title, reference, nes, ref_center, nes_center in scenes:
            for repeats, first, last in [(1,-7,48),(3,-5,25)]:
                canvas = Image.new('RGB',(1024,686),'#151a21')
                draw = ImageDraw.Draw(canvas)
                for x,label in [(12,'アーケード録画'),(524,'ファミコン MMC5')]:
                    draw.text((x,4),label,font=font,fill='white')
                speed = '等速' if repeats==1 else '1/3 倍速'
                draw.text((12,452),title+'　｜　'+speed,font=font,fill='white')
                for offset in range(first,last+1):
                    n = 2*round((nes+offset*60.0988/30)/2)
                    with Image.open(game.OUT/f'salvo{n:04d}.png') as shot:
                        for x,im,(cx,cy) in [(0,Image.fromarray(frames[reference+offset]),ref_center),
                                              (512,shot.crop((0,16,256,224)),nes_center)]:
                            left=max(0,min(128,cx-64));top=max(0,min(158,cy-25))
                            canvas.paste(im.resize((512,416),Image.Resampling.NEAREST),(x,32))
                            detail=im.crop((left,top,left+128,top+50))
                            canvas.paste(detail.resize((512,200),Image.Resampling.NEAREST),(x,486))
                    for _ in range(repeats):
                        encoder.stdin.write(canvas.tobytes())
        encoder.stdin.close()
        if encoder.wait():
            raise RuntimeError('射撃比較動画のエンコードに失敗')
    print(path)


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--captured',action='store_true',help='直前に採取した実機相当のフレームを使う')
    game.OUT=game.ROOT/'build/salvo-check'
    if not parser.parse_args().captured:
        game.run('rtype-mmc5-v004.nes','cart.lbl','journey_test.lua',salvo_clip=True)
    film()
