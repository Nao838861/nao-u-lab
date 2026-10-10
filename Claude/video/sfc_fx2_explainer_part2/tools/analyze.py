"""Derive overlay data from the recordings.

palgrid.json : for each field of the gsu_color clip (SuperFX layer only), which of the 8 BG palettes each
               8x8 tile uses. Found by matching the tile's visible colors against CGRAM 32..63.
intervals.json: how many fields each displayed image stayed on screen (1 = 60fps), from identical frames.
Usage: python tools/analyze.py <rec_out dir>
"""
import json, sys
from pathlib import Path
import numpy as np

root = Path(__file__).resolve().parent.parent
rec = Path(sys.argv[1])
VIS0, VIS1 = 29, 209  # visible rows in the 239-line buffer


def frames(name):
    return np.memmap(rec / name / 'frames.rgb', np.uint8, 'r').reshape(-1, 239, 256, 3)


def rgb5(w):
    r, g, b = w & 31, (w >> 5) & 31, (w >> 10) & 31
    return tuple((v << 3) | (v >> 2) for v in (r, g, b))


cg = np.frombuffer((rec / 'gsu_color' / 'cgram.bin').read_bytes(), '<u2')
pals = [[rgb5(int(cg[32 + p * 4 + k])) for k in range(4)] for p in range(8)]
palsets = [set(p[1:]) for p in pals]


def grid(img, y0):
    """img: 180x256x3 visible part. Returns string of rows*32 chars and the number of unmatched cells."""
    rows = (180 - y0) // 8
    out, bad = [], 0
    for r in range(rows):
        for c in range(32):
            cell = img[y0 + r * 8:y0 + r * 8 + 8, c * 8:c * 8 + 8].reshape(-1, 3)
            cols = {tuple(int(v) for v in x) for x in cell}
            obj = {x for x in cols if any(x in s for s in palsets)}
            if not obj:
                out.append('.')
                continue
            cand = [p for p in range(8) if obj <= palsets[p]]
            if not cand:
                bad += 1
                out.append('.')
            else:
                out.append(str(cand[0]))
    return ''.join(out), rows, bad


def palgrid():
    g = frames('gsu_color')
    sample = [g[i, VIS0:VIS1] for i in range(700, 2900, 200)]
    best = min(range(8), key=lambda y0: sum(grid(im, y0)[2] for im in sample))
    print('grid y0', best, 'unmatched', [grid(im, best)[2] for im in sample])
    START, END = 1200, 2700
    data = []
    for i in range(START, END):
        s, rows, _ = grid(g[i, VIS0:VIS1], best)
        data.append(s)
    hexpal = [['#%02x%02x%02x' % c for c in p] for p in pals]
    (root / 'src/palgrid.json').write_text(json.dumps({'start': START + 1, 'cols': 32, 'rows': rows, 'y0': best, 'palettes': hexpal, 'frames': data}))


# extra args: clip names to (re)measure intervals for; '--no-grid' skips the slow palette grid
only = [a for a in sys.argv[2:] if not a.startswith('--')]
if '--no-grid' not in sys.argv:
    palgrid()
iv = json.loads((root / 'src/intervals.json').read_text()) if (root / 'src/intervals.json').exists() else {}
for name, start, n in (('color', 1000, 6000), ('fourbpp', 1000, 6000), ('sa1', 600, 5000)):
    if only and name not in only:
        continue
    if not (rec / name / 'summary.json').exists():
        print('skip', name)
        continue
    fr = frames(name)
    seq, run = [], 1
    for i in range(start + 1, min(start + n, len(fr))):
        if np.array_equal(fr[i, VIS0:VIS1], fr[i - 1, VIS0:VIS1]):
            run += 1
        else:
            seq.append(run)
            run = 1
    hist = {str(k): seq.count(k) for k in sorted(set(seq))}
    iv[name] = {'start': start, 'seq': ''.join(str(min(x, 9)) for x in seq[:400]), 'hist': hist, 'images': len(seq), 'fields': sum(seq)}
    print(name, hist)
(root / 'src/intervals.json').write_text(json.dumps(iv))
