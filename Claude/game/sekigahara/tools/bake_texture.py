"""1600年10月(旧暦9月)の地表を想定した地表色テクスチャを DEM から生成する。
  - 平地: 刈り入れ後の田(稲株の黄土色)・一部まだ緑・畦
  - 斜面: 里山の草地(薄)→森(杉檜の濃緑＋紅葉しはじめの広葉樹)
  - 川: DEMの流量累積(D8)から自動抽出
  - 街道: 手入力ポリライン(data/geo.json と同じ座標)
出力: data/ground.jpg と data/ground.js(base64)、地表材質マスクと data/geo.js
"""
import base64, io, json, math, os
import numpy as np
from PIL import Image, ImageFilter
from scipy.spatial import cKDTree

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

# 谷ごとに緩く向きが違う耕地区を作る。各帯の幅・長さ・切れ目も変える。
def field_parcels():
    spacing = 190
    dx = cell / S
    sy, sx = np.mgrid[-1:int(OH * dx / spacing) + 2, -1:int(OW * dx / spacing) + 2]
    seeds = np.column_stack((sx.ravel(), sy.ravel())) * spacing
    seeds = seeds + rng.uniform(-0.42, 0.42, seeds.shape) * spacing
    tree = cKDTree(seeds)
    directions = rng.uniform(-0.92, 1.12, len(seeds))
    widths = rng.uniform(14, 34, len(seeds))
    lengths = rng.uniform(30, 76, len(seeds))
    angle = np.empty_like(h)
    soil = np.empty_like(h)
    bank = np.empty_like(h)
    xs = np.arange(OW, dtype=np.float32)[None, :] * dx
    for y0 in range(0, OH, 64):
        rows = slice(y0, min(y0 + 64, OH))
        ys = np.arange(rows.start, rows.stop, dtype=np.float32)[:, None] * dx
        x = xs + (n1[rows] - 0.5) * 13
        y = ys + (n2[rows] - 0.5) * 3 + (n1[rows] - 0.5) * 15
        dist, ids = tree.query(np.stack((x, y), axis=-1), k=2)
        region = ids[..., 0]
        a = directions[region]
        u = x * np.cos(a) + y * np.sin(a)
        v = -x * np.sin(a) + y * np.cos(a)
        width = widths[region]
        strip = np.floor(v / width).astype(np.int32)
        # 整数で種を混ぜる。大きな座標を浮動小数でハッシュすると縞が生じる。
        seed = (strip * 7919 + region * 241) % 1009
        length = lengths[region] * (0.68 + (seed * 193 % 997) / 997)
        along = u + (seed * 181 % 127)
        plot = np.floor(along / length).astype(np.int32)
        crop = ((seed * 59 + plot * 139) % 251) / 250
        dv = abs((v + width / 2) % width - width / 2)
        du = abs((along + length / 2) % length - length / 2)
        edge = np.minimum(np.minimum(dv, du), (dist[..., 1] - dist[..., 0]) * 0.48)
        bank[rows] = np.clip((2.0 - edge) / 2.4, 0, 1)
        angle[rows] = (a + 1.0) / 2.2
        soil[rows] = crop
    return angle, soil, bank

angle, crop, levee = field_parcels()

def rgb(c): return np.array(c, np.float32) / 255
stubble = rgb((176, 150, 92)); stubble2 = rgb((150, 124, 74))
leveec = rgb((118, 112, 66))
grass = rgb((150, 140, 88)); grass2 = rgb((122, 122, 72))
cedar = rgb((38, 56, 34)); broad = rgb((72, 84, 44)); autumn = rgb((128, 92, 44)); autumn2 = rgb((140, 70, 40))
water = rgb((70, 92, 96))

img = np.zeros((OH, OW, 3), np.float32)
# 田
# 刈田・休ませた土・草の混じる畑。畦だけに草色を残す。
pf = stubble2 + (stubble - stubble2) * crop[..., None]
rest = np.clip((0.25 - crop) * 5, 0, 1)[..., None]
pf = pf * (1 - rest) + rgb((128, 120, 78)) * rest
pf *= (0.89 + 0.13 * n1 + 0.10 * n2)[..., None]
pf = pf * (1 - levee[..., None]) + leveec * levee[..., None]
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

# 道の中心からの距離をメートルで求め、路肩を草地へなじませる。
meters = cell / S
road_edge = np.full((OH, OW), 10, np.float32)
for road in geo['roads']:
    line = np.array(road['pts'])
    points = np.column_stack(((line[:, 0] - m['west']) / (m['east'] - m['west']) * (OW - 1),
                              (m['north'] - line[:, 1]) / (m['north'] - m['south']) * (OH - 1)))
    radius = road['width_m'] / 2
    margin = int(np.ceil((radius + 10) / meters)) + 1
    for a, b in zip(points, points[1:]):
        xmin, ymin = np.maximum(0, np.floor(np.minimum(a, b)).astype(int) - margin)
        xmax, ymax = np.minimum([OW, OH], np.ceil(np.maximum(a, b)).astype(int) + margin + 1)
        yy, xx = np.mgrid[ymin:ymax, xmin:xmax]
        delta = b - a
        along = np.clip(((xx - a[0]) * delta[0] + (yy - a[1]) * delta[1]) / max(1e-8, delta @ delta), 0, 1)
        distance = np.hypot(xx - a[0] - along * delta[0], yy - a[1] - along * delta[1]) * meters
        region = road_edge[ymin:ymax, xmin:xmax]
        np.minimum(region, distance - radius, out=region)
# 写真素材を重ねる場所・向き・道の縁。川では土道と稲株を描かない。
road_edge[riv] = 10
road_cover = np.clip(0.5 - road_edge / meters, 0, 1)[..., None]
road_color = rgb((151, 127, 91)) * (0.92 + 0.14 * n2 + 0.05 * n3)[..., None]
img = img * (1 - road_cover) + road_color * road_cover
field_cover = w_field * (1 - levee) * (0.55 + 0.45 * np.clip(crop * 4, 0, 1))
field_cover[riv] = 0
# R=水面(0) / 陸(0.15)〜田(1)、G=田の向き、B=道の縁からの距離(-4〜10m)
mask = np.stack((np.where(riv, 0, 0.15 + 0.85 * field_cover), angle, (road_edge + 4) / 14), axis=2)

def encoded_image(image, fmt, **options):
    buf = io.BytesIO()
    image.save(buf, fmt, **options)
    mime = 'jpeg' if fmt == 'JPEG' else 'png'
    return 'data:image/' + mime + ';base64,' + base64.b64encode(buf.getvalue()).decode()

pil = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
pil.save(os.path.join(D, 'ground.jpg'), quality=85)
# 道の距離を正確に保つため、最終出力は原寸のまま可逆圧縮する。
mask_img = Image.fromarray(np.round(np.clip(mask, 0, 1) * 255).astype(np.uint8))
with open(os.path.join(D, 'ground.js'), 'w', encoding='utf-8') as f:
    f.write('window.GROUND_JPG=' + json.dumps(encoded_image(pil, 'JPEG', quality=85)) + ';\n')
    f.write('window.GROUND_MASK=' + json.dumps(encoded_image(mask_img, 'PNG')) + ';\n')
with open(os.path.join(D, 'geo.js'), 'w', encoding='utf-8') as f:
    f.write('window.GEO=' + json.dumps(geo, ensure_ascii=False) + ';\n')
print(OW, OH)
