"""Build layer PNG sequences and tile-transfer overlays from the deterministic layer recordings."""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

REC = Path(__import__('os').environ.get('FX2_REC_DIR', Path(__file__).parent))
PUB = Path('D:/AI/Nao_u_BOT/Claude/video/sfc_fx2_explainer/public')
FS = 256 * 239 * 3
START, END = 1700, 3200        # fields used for the layer / tile scenes
TOP = 29                       # first visible line in the 239-line Mesen buffer
TILE_OFF = 2                   # FB tile rows start 6 lines above the 180-line crop


def frame(name, n):
    with open(REC / name / 'frames.rgb', 'rb') as f:
        f.seek(FS * n)
        return np.frombuffer(f.read(FS), np.uint8).reshape(239, 256, 3)[TOP:TOP + 180]


def backdrop(objonly):
    # per-row most common colour of the OBJ-only frame = sky/backdrop colour of that line
    out = np.zeros((180, 3), np.uint8)
    for y in range(180):
        cols, cnt = np.unique(objonly[y], axis=0, return_counts=True)
        out[y] = cols[cnt.argmax()]
    return out


def occupied_tiles(mask):
    pad = np.zeros((192, 256), bool)
    pad[6:186] = mask
    t = pad.reshape(24, 8, 32, 8).any(axis=(1, 3))
    return t  # [24 rows, 32 cols]


def main():
    for sub in ('bg', 'obj', 'gsu', 'tiles'):
        (PUB / 'seq' / sub).mkdir(parents=True, exist_ok=True)
    counts = []
    prev = None
    for n in range(START - 1, END):
        o = frame('objonly', n)
        g = frame('gsu', n)
        bd = backdrop(o)[:, None, :]
        gmask = (g != bd).any(axis=2)
        omask = (o != bd).any(axis=2)
        tiles = occupied_tiles(gmask)
        if prev is not None:
            send = tiles | prev
            i = n - START
            Image.fromarray(frame('bgonly', n)).save(PUB / 'seq/bg' / f'{i:05d}.png')
            Image.fromarray(np.dstack([o, omask * 255]).astype(np.uint8), 'RGBA').save(PUB / 'seq/obj' / f'{i:05d}.png')
            Image.fromarray(np.dstack([g, gmask * 255]).astype(np.uint8), 'RGBA').save(PUB / 'seq/gsu' / f'{i:05d}.png')
            # overlay at 4x so tile borders stay crisp: 1024x720
            ov = np.zeros((192 * 4, 256 * 4, 4), np.uint8)
            for ty, tx in zip(*np.nonzero(send)):
                y0, x0 = ty * 32, tx * 32
                ov[y0:y0 + 32, x0:x0 + 32] = (0, 220, 255, 70)
                ov[y0:y0 + 32, x0:x0 + 2] = ov[y0:y0 + 32, x0 + 30:x0 + 32] = (0, 240, 255, 230)
                ov[y0:y0 + 2, x0:x0 + 32] = ov[y0 + 30:y0 + 32, x0:x0 + 32] = (0, 240, 255, 230)
            Image.fromarray(ov[24:24 + 720], 'RGBA').save(PUB / 'seq/tiles' / f'{i:05d}.png')
            counts.append(int(send.sum()))
        prev = tiles
        if n % 250 == 0:
            print(n, flush=True)
    stats = {'start': START, 'end': END, 'tiles': counts, 'meanTiles': float(np.mean(counts)), 'maxTiles': int(max(counts)),
             'note': 'tiles with GSU pixels in the previous or current displayed frame; an approximation of the rectangle-union transfer'}
    (PUB / 'seq/tiles.json').write_text(json.dumps(stats))
    print('mean tiles', stats['meanTiles'], 'bytes', stats['meanTiles'] * 16, 'max', stats['maxTiles'])


if __name__ == '__main__':
    main()
