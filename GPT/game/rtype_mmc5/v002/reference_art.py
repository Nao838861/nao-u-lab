"""指定録画を384×270 RGB24に縮小したbuild/video.rgbから制作素材を取り出す。"""
from pathlib import Path
import numpy as np
from scipy.ndimage import median_filter
from PIL import Image, ImageDraw
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
# 各時点で赤と青それぞれの線の中心を取り、白い芯・圧縮ノイズを除く。
def beam(t,left,top,w,h,skip=0):
    data=frames[t,top:top+h,left:left+w].astype(float)
    r,g,b=data.transpose(2,0,1)
    img=Image.new('L',(w,h));d=ImageDraw.Draw(img)
    for color,weight in [(1,r-(g+b)/2),(2,(g+b)/2-r)]:
        pts=[]
        for x in range(w):
            ys=np.flatnonzero((weight[:,x]>28)&(data[:,x,:].max(axis=1)>133))
            if len(ys) and (x>=skip or (ys.max()-ys.min()<10)):
                pts.append((x,float(np.median(ys))))
        if len(pts)>1: d.line(pts,fill=color,width=3)
    return img
# 離弾後、赤が谷→上り→山→下り、青は逆位相。
steady=[beam(t,x,114,62,40) for t,x in [(14,246),(16,285),(18,315),(5,109)]]
# 発生時は上下の円弧。機首・他弾が重なるため端点と頂点から補間。
def opening(phase):
    im=Image.new('L',(62,65));d=ImageDraw.Draw(im)
    for c,sign in [(1,1),(2,-1)]:
        pts=[]
        for k in range(120):
            a=np.pi*k/119
            x=30-28*np.cos(a)
            pts.append((x,32+sign*29*np.sin(a+phase)))
        d.line(pts,fill=c,width=3)
    return im
atlas=Image.new('L',(48*7,56))
for i,im in enumerate([opening(0),opening(.48),opening(1.03),*steady]):
    height=48 if i<3 else 29
    atlas.paste(im.resize((48,height),Image.Resampling.NEAREST),(48*i,(56-height)//2))
atlas.save(out/'waves.png')

