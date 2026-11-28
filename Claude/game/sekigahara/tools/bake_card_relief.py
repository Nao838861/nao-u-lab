"""解説図用の段彩陰影図を作る。国土地理院 DEM10B、琵琶湖の湖岸は Natural Earth 1:10m。"""
import base64
import io
import json
from pathlib import Path
from urllib.request import urlopen

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import map_coordinates

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'tools' / '_cache' / 'card_relief'
WATER = (163, 200, 206)


def cached(name, url):
    file = CACHE / name
    if not file.exists():
        with urlopen(url, timeout=30) as response:
            file.write_bytes(response.read())
    return file.read_bytes()


def render(name, bounds, width, zoom):
    west, south, east, north = bounds
    cos_lat = np.cos(np.radians((north + south) / 2))
    height = round(width * (north - south) / ((east - west) * cos_lat))
    lon = west + (np.arange(width) + 0.5) * (east - west) / width
    lat = north - (np.arange(height) + 0.5) * (north - south) / height
    world = 256 * 2 ** zoom
    x = (lon + 180) / 360 * world - 0.5
    y = (1 - np.arcsinh(np.tan(np.radians(lat))) / np.pi) / 2 * world - 0.5
    tx0, tx1 = int(x.min()) // 256, int(np.ceil(x.max())) // 256
    ty0, ty1 = int(y.min()) // 256, int(np.ceil(y.max())) // 256
    mosaic = np.empty(((ty1-ty0+1)*256, (tx1-tx0+1)*256))
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            data = cached(f'{zoom}_{tx}_{ty}.png',
                          f'https://cyberjapandata.gsi.go.jp/xyz/dem_png/{zoom}/{tx}/{ty}.png')
            rgb = np.array(Image.open(io.BytesIO(data)).convert('RGB'), dtype=np.int32)
            code = rgb[:, :, 0] * 65536 + rgb[:, :, 1] * 256 + rgb[:, :, 2]
            dem = np.where(code >= 2**23, code - 2**24, code) * 0.01
            dem[code == 2**23] = np.nan
            row, col = (ty - ty0) * 256, (tx - tx0) * 256
            mosaic[row:row+256, col:col+256] = dem
    samples = np.meshgrid(y - ty0 * 256, x - tx0 * 256, indexing='ij')
    z = map_coordinates(np.nan_to_num(mosaic), samples, order=1)
    sea = map_coordinates(np.isnan(mosaic).astype(float), samples, order=0) > 0.5
    spacing = (east - west) * cos_lat * 111320 / width
    dy, dx = np.gradient(z, spacing)
    # 低地の起伏は紙色に近く、急な斜面は北西からの光で尾根と谷を見分けられるようにする。
    shade = np.clip((dy + dx) * 0.52, -0.24, 0.18)
    levels = [0, 100, 180, 350, 700, 1400]
    colors = np.array([[249,237,201], [242,232,193], [217,218,169],
                       [165,187,143], [133,159,125], [120,135,111]])
    rgb = np.stack([np.interp(z, levels, colors[:, ch]) for ch in range(3)], axis=-1)
    rgb = np.clip(rgb * (1 + shade[:, :, None]), 0, 255)
    rgb[sea] = WATER
    image = Image.fromarray(rgb.astype(np.uint8))
    if name == 'region':
        lakes = json.loads(cached('ne_10m_lakes.geojson',
            'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_lakes.geojson'))
        biwa = next(f for f in lakes['features'] if f['properties']['name'] == 'Biwa Ko')
        mask = Image.new('L', image.size, 0)
        for i, ring in enumerate(biwa['geometry']['coordinates']):
            pixels = [((a-west)/(east-west)*width, (north-b)/(north-south)*height) for a, b in ring]
            ImageDraw.Draw(mask).polygon(pixels, fill=0 if i else 255)
        image.paste(WATER, (0, 0, width, height), mask)
    buf = io.BytesIO()
    image.save(buf, format='WEBP', quality=87, method=6)
    return dict(w=west, s=south, e=east, n=north,
                url='data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode())


if __name__ == '__main__':
    CACHE.mkdir(parents=True, exist_ok=True)
    maps = dict(region=render('region', (135.72, 34.84, 137.20, 35.69), 940, 10),
                local=render('local', (136.39, 35.27, 136.69, 35.44), 1400, 12))
    (ROOT / 'data' / 'card_relief.js').write_text('window.CARD_RELIEF=' + json.dumps(maps) + ';\n', encoding='utf8')
