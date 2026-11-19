"""50fpsのアーケード録画から腹部の頭を切り出す。入力は146秒からの256×208 RGB24。"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
# Frames are relative to 02:26.00. Outline in registered playfield pixels.
POSES = [
    (312, [(202,102),(208,100),(209,102),(209,117),(204,116),(202,112),(201,108),(199,108)]),
    (327, [(200,102),(207,100),(209,102),(209,118),(203,116),(199,114),(197,110),(197,105)]),
    (337, [(195,103),(200,101),(207,100),(209,102),(209,119),(201,117),(195,114),(193,110),(191,108)]),
    (355, [(189,104),(196,101),(204,100),(208,101),(209,109),(208,119),(201,119),(196,117),(190,114),(190,112),(195,113),(200,114),(196,111),(190,111),(187,108)]),
    (487, [(188,103),(194,100),(200,99),(207,100),(209,104),(208,120),(200,120),(192,117),(190,114),(192,114),(199,116),(200,115),(196,111),(190,110),(187,107)]),
    (604, [(188,102),(193,99),(198,98),(206,99),(209,103),(208,120),(201,121),(192,120),(190,116),(193,116),(198,118),(200,116),(199,112),(196,109),(190,109),(187,106)]),
]
def extract(path):
    frames = np.memmap(path, 'u1', 'r').reshape(-1,208,256,3)
    strip = Image.new('RGBA', (24*len(POSES),24))
    for i,(n,outline) in enumerate(POSES):
        pic = Image.fromarray(frames[n,10:188,6:252]).resize((256,208),Image.Resampling.BILINEAR)
        box = (186,98,210,122)
        core = pic.crop(box).convert('RGBA')
        mask = Image.new('L',(24,24))
        ImageDraw.Draw(mask).polygon([(x-box[0],y-box[1]) for x,y in outline],fill=255)
        core.putalpha(mask)
        strip.paste(core,(24*i,0))
    strip.save(ROOT/'art/boss-core.png')
if __name__=='__main__':
    extract(sys.argv[1])
