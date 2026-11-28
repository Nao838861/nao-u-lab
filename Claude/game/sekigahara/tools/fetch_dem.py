"""国土地理院 DEM10B (z14) タイルを取得し、関ヶ原一帯の標高グリッドを data/dem.bin に書き出す。
出力: Uint16 (標高[m]*10, リトルエンディアン) 行優先(北→南)。メタは data/dem.json。
"""
import json, math, os, struct, sys, urllib.request

LON0, LON1 = 136.430, 136.545   # 西端, 東端
LAT0, LAT1 = 35.330, 35.390     # 南端, 北端
Z = 14
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'data')
CACHE = os.path.join(HERE, '_cache')

def tile_xy(lon, lat):
    n = 2 ** Z
    x = (lon + 180) / 360 * n
    r = math.radians(lat)
    y = (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * n
    return x, y

def get_tile(tx, ty):
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, f'{Z}_{tx}_{ty}.txt')
    if not os.path.exists(p):
        url = f'https://cyberjapandata.gsi.go.jp/xyz/dem/{Z}/{tx}/{ty}.txt'
        req = urllib.request.Request(url, headers={'User-Agent': 'terrain-fetch/1.0'})
        with urllib.request.urlopen(req) as r, open(p, 'wb') as f:
            f.write(r.read())
    rows = []
    for line in open(p, encoding='utf-8').read().strip().splitlines():
        rows.append([float(v) if v != 'e' else 0.0 for v in line.split(',')])
    return rows

x0, y0 = tile_xy(LON0, LAT1)
x1, y1 = tile_xy(LON1, LAT0)
px0, py0 = int(x0 * 256), int(y0 * 256)
px1, py1 = int(x1 * 256), int(y1 * 256)
W, H = px1 - px0, py1 - py0
tiles = {}
def h_at(px, py):
    tx, ty = px // 256, py // 256
    if (tx, ty) not in tiles:
        tiles[(tx, ty)] = get_tile(tx, ty)
    return tiles[(tx, ty)][py % 256][px % 256]

buf = bytearray()
mn, mx = 1e9, -1e9
for py in range(py0, py1):
    for px in range(px0, px1):
        h = h_at(px, py)
        mn, mx = min(mn, h), max(mx, h)
        buf += struct.pack('<H', max(0, int(round(h * 10))))
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'dem.bin'), 'wb').write(buf)

def px2lonlat(px, py):
    n = 2 ** Z * 256
    lon = px / n * 360 - 180
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * py / n))))
    return lon, lat
w_lon, n_lat = px2lonlat(px0, py0)
e_lon, s_lat = px2lonlat(px1, py1)
mlat = (n_lat + s_lat) / 2
meta = dict(width=W, height=H, west=w_lon, east=e_lon, north=n_lat, south=s_lat,
            meters_x=(e_lon - w_lon) * 111320 * math.cos(math.radians(mlat)),
            meters_y=(n_lat - s_lat) * 110940, min=mn, max=mx,
            source='国土地理院 標高タイル DEM10B z14')
json.dump(meta, open(os.path.join(OUT, 'dem.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(meta)
