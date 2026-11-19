"""通常のパッド入力で波動砲の撃ち分け、砲台の消去、全21基の撃破を調べる。"""
import argparse
import re
import subprocess
import numpy as np
from PIL import Image
from verify_actors import ROOT, OUT, run

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--film',action='store_true')
    args=parser.parse_args()
    for image_path in OUT.glob('cannon-*-x*.png'):
        image_path.unlink()
    run('rtype-mmc5-v004.nes','cart.lbl','wave_cannon_test.lua',args.film)
    print((OUT/'cannon-result.txt').read_text())
    for n in (99,105,128):
        path=next(OUT.glob(f'cannon-{n}-x*.png'))
        x=int(re.search(r'-x(\d+)$',path.stem).group(1))
        image=np.asarray(Image.open(path).convert('RGB')).astype(int)
        mount=image[169:179,x-5:x+6]
        metal=(mount.min(axis=2)>90).sum()
        if n==99:assert metal>9,(n,metal)
        if n==128:assert metal==0,(n,metal)
        if n==105:
            shot=image[166:182,95:122]
            cyan=(shot[:,:,1]>145)&(shot[:,:,1]>shot[:,:,0]+35)
            assert cyan.sum()>22 and (shot.min(axis=2)>190).sum()>12
    run('rtype-mmc5-v004.nes','cart.lbl','mount_sweep_test.lua')
    print((OUT/'mount-sweep.txt').read_text())
    if args.film:
        subprocess.run(['ffmpeg','-v','error','-y','-framerate','60.0988','-i',str(OUT/'weaponfilm%04d.png'),
            '-frames:v','450','-vf','scale=512:480:flags=neighbor','-c:v','libx264','-crf','16',
            '-pix_fmt','yuv420p','-movflags','+faststart',str(ROOT/'wave-cannon.mp4')],check=True)

if __name__=='__main__':main()
