"""ROMのコース地図（Mode7が読む640×640・1ドット2ビットの画像）を取り出し、
録画した行テーブル（表示に使った u, v, du, dv）から、画面の各行が地図のどこを読んだかを線分にする。
地図の色は、地面だけの録画画面と地図の値を突き合わせて決める（推測で色を付けない）。
出力: public/img/course_map.png, src/data/mode7_<コマ>.json
"""
import collections
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
rom = (root / 'webcore/normal.nes').read_bytes()
prg = rom[4] * 16384
tex = np.frombuffer(rom, np.uint8, 640 * 640 // 4, 16 + prg + 8192)
idx = np.zeros(640 * 640, np.uint8)
for k in range(4):
    idx[k::4] = (tex >> (6 - 2 * k)) & 3
idx = idx.reshape(640, 640)

src = root / 'rec/main/layers'
votes = collections.defaultdict(collections.Counter)
frames = [int(a) for a in sys.argv[1:]]
for f in range(600, 4400, 100):
    g = np.fromfile(src / f'{f}_ground.rgb', np.uint8).reshape(240, 256, 3)
    rows = np.fromfile(src / f'{f}_rows.bin', np.int32).reshape(192, 6)
    for y in range(0, 192, 3):
        u, v, du, dv, bg, valid = rows[y]
        if not valid:
            continue
        for x in range(8, 256, 5):
            uu, vv = int(u) + x * int(du), int(v) + x * int(dv)
            if 0 <= uu < 640 * 65536 and 0 <= vv < 640 * 65536:
                votes[int(idx[vv >> 16, uu >> 16])][tuple(int(c) for c in g[y, x])] += 1
palette = {k: c.most_common(1)[0][0] for k, c in votes.items()}
print('地図の値→色', palette, {k: round(c.most_common(1)[0][1] / sum(c.values()), 3) for k, c in votes.items()})
rgb = np.zeros((640, 640, 3), np.uint8)
for k, c in palette.items():
    rgb[idx == k] = c
Image.fromarray(rgb).save(root / 'public/img/course_map.png')

for f in frames:
    rows = np.fromfile(src / f'{f}_rows.bin', np.int32).reshape(192, 6)
    segs = []
    for y in range(192):
        u, v, du, dv, bg, valid = (int(a) for a in rows[y])
        segs.append({'y': y, 'valid': valid, 'sky': bg,
                     'a': [u / 65536, v / 65536], 'b': [(u + 255 * du) / 65536, (v + 255 * dv) / 65536]} if valid else {'y': y, 'valid': 0, 'sky': bg})
    (root / f'src/data/mode7_{f}.json').write_text(json.dumps(segs), encoding='utf-8')
    print(f, '地面の行', sum(s['valid'] for s in segs), '空の行', sum(1 for s in segs if s['sky']))
