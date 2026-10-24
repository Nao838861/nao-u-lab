"""図解用データを作る。入力は rec/（リプレイ録画のRAMログ、最新ROMから組み立てた128枚の絵）。

src/data/drift.json  : DRIFT1位の走りの毎フレームの向き・書き込みコスト
src/data/grip.json   : GRIP1位の走りの毎フレームの4輪の値（容量・前後の力・横の力・超過）
public/gen/thumbs.png: 128枚の一覧（16x8）
public/gen/dedupe_*.png: 同じ模様のタイルを同じ色で塗った図と元の絵
public/gen/jitter8/NNN.png: 回転を打ち消した現行版（木8本）の切り抜き
"""
from pathlib import Path
import json
import random
import sys

import numpy as np
from PIL import Image

R = Path(__file__).resolve().parents[1]
GEN = R / 'public' / 'gen'
DATA = R / 'src' / 'data'
GEN.mkdir(parents=True, exist_ok=True)
DATA.mkdir(parents=True, exist_ok=True)
S = 920
STEP = 360 / 128


def logs(name):
    return [json.loads(l) for l in open(R / 'rec' / name / 'log.jsonl')]


def drift():
    L = logs('drift1')
    json.dump({'angle': [r['angle'] for r in L], 'cost': [r['cost'] for r in L], 'scene': [r['scene'] for r in L],
               'tick': [r['tick'] for r in L]}, open(DATA / 'drift.json', 'w'))


def grip():
    L = logs('grip1')
    json.dump({k: [r[k] for r in L] for k in ('cap', 'lon', 'lat', 'over', 'angle', 'scene')}, open(DATA / 'grip.json', 'w'))


def pic(a):
    return Image.open(R / 'public' / 'pictures' / f'angle_{a:03d}.png').convert('RGB')


def thumbs(size=100, cols=16):
    sheet = Image.new('RGB', (cols * size, (128 // cols) * size), (10, 15, 30))
    for a in range(128):
        im = pic(a).crop((60, 60, 860, 860)).resize((size - 6, size - 6), Image.Resampling.LANCZOS)
        sheet.paste(im, (a % cols * size + 3, a // cols * size + 3))
    sheet.save(GEN / 'thumbs.png')


def dedupe(a=0, box=(560, 300, 816, 556)):
    """絵をタイルに切った時の格子位置を、固有模様が最少になる位置として求め、同じ模様を同じ色で塗る。"""
    arr = np.asarray(pic(a))
    best = None
    for oy in range(8):
        for ox in range(8):
            sub = arr[oy:oy + 896, ox:ox + 896]
            t = sub.reshape(112, 8, 112, 8, 3).transpose(0, 2, 1, 3, 4).reshape(-1, 192)
            u = len(np.unique(t, axis=0))
            if best is None or u < best[0]:
                best = (u, ox, oy)
    u, ox, oy = best
    x0 = ox + ((box[0] - ox) // 8) * 8
    y0 = oy + ((box[1] - oy) // 8) * 8
    w = (box[2] - box[0]) // 8 * 8
    h = (box[3] - box[1]) // 8 * 8
    crop = arr[y0:y0 + h, x0:x0 + w]
    tiles = crop.reshape(h // 8, 8, w // 8, 8, 3).transpose(0, 2, 1, 3, 4).reshape(h // 8, w // 8, 192)
    keys = {}
    rng = random.Random(3)
    out = np.zeros_like(crop)
    for ty in range(h // 8):
        for tx in range(w // 8):
            k = tiles[ty, tx].tobytes()
            if k not in keys:
                keys[k] = [rng.randint(40, 255) for _ in range(3)]
            out[ty * 8:ty * 8 + 8, tx * 8:tx * 8 + 8] = keys[k]
    Image.fromarray(crop).save(GEN / 'dedupe_src.png')
    Image.fromarray(out).save(GEN / 'dedupe_map.png')
    info = {'picture_unique': int(u), 'crop_tiles': (h // 8) * (w // 8), 'crop_unique': len(keys), 'grid': [int(ox), int(oy)],
            'x0': int(x0), 'y0': int(y0), 'w': int(w), 'h': int(h)}
    json.dump(info, open(DATA / 'dedupe.json', 'w'))
    print('dedupe', info)


def jitter8(box=(105, 127, 485, 477)):
    (GEN / 'jitter8').mkdir(exist_ok=True)
    for a in range(128):
        back = pic(a).rotate(a * STEP, resample=Image.Resampling.NEAREST, center=(S / 2, S / 2), fillcolor=(56, 135, 0))
        back.crop(box).save(GEN / 'jitter8' / f'{a:03d}.png')




def tree128(world=(160, 170), W0=(330, 340), r=22, size=60):
    """1本の木（内側の目印）を128枚の絵から切り出して並べる。"""
    import math
    sheet = Image.new('RGB', (16 * size, 8 * size), (10, 15, 30))
    for a in range(128):
        th = math.radians(a * STEP)
        dx, dy = world[0] - W0[0], world[1] - W0[1]
        px = S / 2 + dx * math.cos(th) - dy * math.sin(th)
        py = S / 2 + dx * math.sin(th) + dy * math.cos(th)
        im = pic(a).crop((round(px) - r, round(py) - r, round(px) + r, round(py) + r)).resize((size - 6, size - 6), Image.Resampling.NEAREST)
        sheet.paste(im, (a % 16 * size + 3, a // 16 * size + 3))
    sheet.save(GEN / 'tree128.png')


def shelves():
    """模様の棚（10/15版のCHR区画0の全16,384枚）と、1画面ぶんの窓で使っているタイルの位置。"""
    sys.path.insert(0, str(R.parent / 'mmc5racing_explainer' / 'tools'))
    import decode_course as dc
    dec = dc.Decoder(dc.DEV / 'releases/MMC5Racing_AllIntegrated_144x176.nes', dc.DEV / 'build/direct/kernel/prepare.lbl', 116)
    rom = dec.rom
    img = Image.new('RGB', (1024, 1024))
    for t in range(16384):
        w = t  # パレット0で表示
        tile = Image.new('RGB', (8, 8))
        at = 1048592 + t * 16
        b = rom[at:at + 16]
        tile.putdata([dc.PALETTES[0][(b[y] >> (7 - x) & 1) | (b[y + 8] >> (7 - x) & 1) << 1] for y in range(8) for x in range(8)])
        img.paste(tile, (t % 128 * 8, t // 128 * 8))
    img.save(GEN / 'shelf_q0.png')
    ws, _ = dec.words(0)
    used = sorted({ws[ty][tx] & 16383 for ty in range(30, 53) for tx in range(21, 38)})
    banks = [[(ws[ty][tx] >> 8) & 63 for tx in range(21, 38)] for ty in range(30, 53)]
    json.dump({'used': used, 'banks': banks}, open(DATA / 'shelf.json', 'w'))
    print('window uses', len(used), 'patterns from', len({u >> 8 for u in used}), 'shelves')


if __name__ == '__main__':
    steps = sys.argv[1:] or ['drift', 'grip', 'thumbs', 'dedupe', 'jitter8', 'tree128', 'shelves']
    for s in steps:
        globals()[s]()
    print('ok', steps)
