"""1600年10月(旧暦9月)の地表を想定した地表色テクスチャを DEM から生成する。
  - 平地: 刈り入れ後の田(稲株の黄土色)・一部まだ緑・畦
  - 斜面: 里山の草地(薄)→森(杉檜の濃緑＋紅葉しはじめの広葉樹)
  - 川: DEMの流量累積(D8)から自動抽出
  - 街道: 手入力ポリライン(js/geo.js と同じ座標)
出力: data/ground.jpg と data/ground.js(base64)、data/rivers.json
"""
import base64, io, json, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(HERE, '..', 'data')
m = json.load(open(os.path.join(D, 'dem.json'), encoding='utf-8'))
W, H = m['width'], m['height']
dem = np.frombuffer(open(os.path.join(D, 'dem.bin'), 'rb').read(), dtype='<u2').reshape(H, W).astype(np.float32) / 10
geo = json.load(open(os.path.join(D, 'geo.json'), encoding='utf-8'))
rng = np.random.default_rng(1600)
cell = m['meters_x'] / W  # ~7.8m

# ---- 窪地埋め (priority-flood + epsilon) → 平地でも川が途切れないように ----
import heapq
filled = dem.copy()
seen = np.zeros((H, W), bool)
pq = []
for x in range(W):
    for y in (0, H - 1):
        heapq.heappush(pq, (float(filled[y, x]), y, x)); seen[y, x] = True
for y in range(1, H - 1):
    for x in (0, W - 1):
        heapq.heappush(pq, (float(filled[y, x]), y, x)); seen[y, x] = True
EPS = 0.002
while pq:
    z, y, x = heapq.heappop(pq)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and not seen[ny, nx]:
                seen[ny, nx] = True
                if filled[ny, nx] <= z:
                    filled[ny, nx] = z + EPS
                heapq.heappush(pq, (float(filled[ny, nx]), ny, nx))
dem_raw = dem
dem = filled
# ---- 流量累積 (D8) ----
order = np.argsort(dem, axis=None)[::-1]
acc = np.ones(H * W, np.float32)
flat = dem.ravel()
nbr = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
# 低い方へ流す(最急勾配)
pad = np.pad(dem, 1, constant_values=1e4)
best = np.full((H, W), -1, np.int64); bestd = np.zeros((H, W), np.float32)
yy, xx = np.mgrid[0:H, 0:W]
for dy, dx in nbr:
    nb = pad[1+dy:1+dy+H, 1+dx:1+dx+W]
    drop = (dem - nb) / math.hypot(dy, dx)
    upd = drop > bestd
    bestd[upd] = drop[upd]
    tgt = (yy + dy) * W + (xx + dx)
    best[upd] = tgt[upd]
bf = best.ravel()
for i in order:
    t = bf[i]
    if t >= 0:
        acc[t] += acc[i]
acc = acc.reshape(H, W)
dem = dem_raw
river = acc > 14000   # 上流域 約0.85km2 以上を川とする

# ---- 出力解像度 ----
S = 3  # DEM 1px -> 3px (約2.6m/px)
OW, OH = W * S, H * S
def up(a):
    return np.array(Image.fromarray(a.astype(np.float32), mode='F').resize((OW, OH), Image.BICUBIC))
h = up(dem)
gy, gx = np.gradient(h, cell / S)
slope = np.hypot(gx, gy)
# ノイズ
def noise(scale, seed):
    r = np.random.default_rng(seed)
    small = r.random((OH // scale + 2, OW // scale + 2)).astype(np.float32)
    return np.array(Image.fromarray(small, mode='F').resize((OW + scale, OH + scale), Image.BICUBIC))[:OH, :OW]
n1, n2, n3 = noise(40, 1), noise(9, 2), noise(3, 3)

# ---- 田の区画 (回転した不規則格子) ----
X, Y = np.meshgrid(np.arange(OW, dtype=np.float32), np.arange(OH, dtype=np.float32))
mx, my = X * cell / S, Y * cell / S
ang = math.radians(18)
u = mx * math.cos(ang) + my * math.sin(ang) + n1 * 40
v = -mx * math.sin(ang) + my * math.cos(ang) + n1 * 25
fw, fh = 30.0 + 0*n2, 20.0
cu, cv = np.floor(u / fw), np.floor(v / fh)
cid = (cu * 73856093 + cv * 19349663) % 1000 / 1000.0
fu, fv = u / fw - cu, v / fh - cv
levee = (np.minimum(np.minimum(fu, 1 - fu) * fw, np.minimum(fv, 1 - fv) * fh) < 0.9)

def rgb(c): return np.array(c, np.float32) / 255
stubble = rgb((176, 150, 92)); stubble2 = rgb((150, 124, 74)); dry = rgb((160, 140, 100))
green = rgb((120, 128, 70)); hasa = rgb((190, 160, 90)); leveec = rgb((118, 112, 66))
grass = rgb((150, 140, 88)); grass2 = rgb((122, 122, 72))
cedar = rgb((38, 56, 34)); broad = rgb((72, 84, 44)); autumn = rgb((128, 92, 44)); autumn2 = rgb((140, 70, 40))
water = rgb((70, 92, 96)); road = rgb((168, 150, 118)); bare = rgb((140, 124, 96))

img = np.zeros((OH, OW, 3), np.float32)
# 田
pf = np.where(cid[..., None] < 0.55, stubble, np.where(cid[..., None] < 0.8, stubble2, np.where(cid[..., None] < 0.92, green, dry)))
pf = pf * (0.92 + 0.16 * n3[..., None])
pf = np.where(levee[..., None], leveec, pf)
# 草地
gr = grass * (1 - n2[..., None]) + grass2 * n2[..., None]
gr = gr * (0.85 + 0.25 * n3[..., None])
# 森
mixA = np.clip((n2 - 0.35) * 3, 0, 1)[..., None]
fo = cedar * (1 - mixA) + broad * mixA
aut = np.clip((n3 - 0.78) * 6, 0, 1)[..., None] * np.clip((n1 - 0.3) * 3, 0, 1)[..., None]
fo = fo * (1 - aut) + (autumn * (n2[..., None] > 0.5) + autumn2 * (n2[..., None] <= 0.5)) * aut
fo = fo * (0.7 + 0.5 * n3[..., None])

flatness = np.clip((0.10 - slope) / 0.05, 0, 1)
lowland = np.clip((175 - h) / 25, 0, 1) * np.clip((n1 - 0.08) * 6, 0, 1)
w_field = flatness * lowland
w_forest = np.clip((slope - 0.16) / 0.12 + (n1 - 0.5) * 1.2, 0, 1) * (1 - w_field)
w_grass = 1 - w_field - w_forest
img = pf * w_field[..., None] + fo * w_forest[..., None] + gr * np.clip(w_grass, 0, 1)[..., None]

# 川
riv = up(river.astype(np.float32)) > 0.5
riv = np.array(Image.fromarray(riv.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(3))) > 0
bank = np.array(Image.fromarray(riv.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(7))) > 0
img[bank & ~riv] = img[bank & ~riv] * 0.6 + rgb((90, 100, 60)) * 0.4
img[riv] = water

# 陰影(細部)
hs = np.clip(0.75 + (-gx * 0.6 + gy * 0.4) * 0.6, 0.55, 1.15)
img = img * hs[..., None]

pil = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
dr = ImageDraw.Draw(pil)
def P(lon, lat):
    return ((lon - m['west']) / (m['east'] - m['west']) * OW, (m['north'] - lat) / (m['north'] - m['south']) * OH)
for rd in geo['roads']:
    pts = [P(*p) for p in rd['pts']]
    dr.line(pts, fill=(112, 98, 72), width=rd.get('w', 3) + 2, joint='curve')
    dr.line(pts, fill=(186, 168, 132), width=rd.get('w', 3), joint='curve')
pil.save(os.path.join(D, 'ground.jpg'), quality=82)
buf = io.BytesIO(); pil.save(buf, 'JPEG', quality=82)
open(os.path.join(D, 'ground.js'), 'w').write('window.GROUND_JPG="data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode() + '";\n')
print(OW, OH, len(buf.getvalue()))
open(os.path.join(D, 'geo.js'), 'w', encoding='utf-8').write('window.GEO=' + json.dumps(geo, ensure_ascii=False) + ';
')
