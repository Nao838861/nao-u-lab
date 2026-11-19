"""指定録画を384×270 RGB24に縮小したbuild/video.rgbから制作素材を取り出す。"""
from pathlib import Path
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parent
out=root/'art'
out.mkdir(exist_ok=True)
frames=np.memmap(root/'build/video.rgb','u1','r').reshape(-1,270,384,3)
base=frames[0].astype('int16')
samples=[]
for frame in range(0,100,2):
    pic=frames[frame].astype('int16')
    # 背景の横ずれは遠景パネルだけから推定。スプライトの画素差は打ち切る。
    expected=round(frame*.9)
    dx=min(range(max(0,expected-8),expected+9),key=lambda d:
           np.minimum(abs(base[65:195,105:355]-pic[65:195,105-d:355-d]),22).mean())
    aligned=np.full(base.shape,np.nan,'float32')
    aligned[:,dx:]=pic[:,:384-dx]
    samples.append(aligned)
clean=np.nanmedian(samples,axis=0).astype('uint8')
# 装甲と手前の壁は遠景と異なる速度。上下端と左円盤を元フレームから採る。
clean[:32]=base[:32];clean[238:]=base[238:]
clean[:90,:23]=base[:90,:23];clean[173:,:23]=base[173:,:23]
# 画面左端に留まる自機・ビットの下は同じパネル列の別の反復から補う。
clean[91:158,:74]=clean[91:158,64:138].copy()
# 下辺のプレイヤーUIの赤点は映像外のため、隣の縁を使用。
clean[262:,:23]=clean[262:,24:47]
# Moving objects are localized; keep the unfiltered frame everywhere else.
scene=base.astype('uint8')
for x,y,r,b in [(7,91,128,169),(126,77,148,94),(150,31,218,65),
                 (190,105,236,143),(256,91,384,159),(300,192,362,239),(0,262,24,270)]:
    scene[y:b,x:r]=clean[y:b,x:r]
clean=scene
im=Image.fromarray(clean).resize((256,208),Image.Resampling.LANCZOS)
im.save(out/'corridor.png')
def sprite_group(name,box,size,times):
    strip=Image.new('RGB',(size[0]*len(times),size[1]))
    for i,t in enumerate(times):
        part=Image.fromarray(frames[t]).crop(box).resize(size,Image.Resampling.LANCZOS)
        strip.paste(part,(i*size[0],0))
    strip.save(out/(name+'.png'))
sprite_group('r9',(11,126,47,145),(25,13),[270])
sprite_group('force',(42,120,71,155),(20,24),[270,275,279,284])
sprite_group('bit',(20,97,39,116),(13,13),[270,274,280,285,287])
sprite_group('walker',(305,195,361,247),(31,30),[0])
sprite_group('drone',(209,109,233,135),(16,18),[0])
