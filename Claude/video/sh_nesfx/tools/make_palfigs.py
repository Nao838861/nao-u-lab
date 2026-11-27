"""Figures for the palette scene (S05), derived from the sprites-off recording.

The cartridge picks one of 4 background palettes per 8x1 span (spans start at x = 0, 8, 16, ...).
The palette of a span is recovered from its colors, following the selection rule:
  sky purple $23 or the sky-only dark green $09 visible -> sky palette
  pale ground green $39 visible                         -> ground palette
  red $16 visible                                       -> red palette
  otherwise                                             -> black palette
(checked on 5 frames: with spans starting at x = 0 no span mixes colors of two palettes; any other offset does)

usage: python tools/make_palfigs.py rec/final_ns [--frame 600]
outputs public/img/palmap.png, public/img/edge_{ideal,1a,19,final}.png, src/palspan.json
"""
import argparse, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / 'public'
PUR = (198, 118, 255); P09 = (11, 72, 0); P19 = (56, 135, 0); P1A = (12, 147, 0); P39 = (207, 239, 150)
RED = (181, 49, 32); BLK = (0, 0, 0)
MAPCOL = {'sky': PUR, 'ground': P39, 'red': RED, 'black': (0, 0, 0)}


def has(cell, c):
    return bool((cell == c).all(1).any())


def classify(A):
    pal = np.empty((240, 32), object)
    for y in range(240):
        for cx in range(32):
            cell = A[y, cx * 8:cx * 8 + 8]
            pal[y, cx] = ('sky' if has(cell, PUR) or has(cell, P09) else 'ground' if has(cell, P39)
                          else 'red' if has(cell, RED) else 'black')
    return pal


def font(n):
    try:
        return ImageFont.truetype('C:/Windows/Fonts/YuGothB.ttc', n)
    except OSError:
        return ImageFont.load_default()


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('nospr', type=Path); ap.add_argument('--frame', type=int, default=600)
    ap.add_argument('--crop', default='0,80,128,96')  # x, y, w, h  (x and w multiples of 8)
    a = ap.parse_args()
    A = np.array(Image.open(a.nospr / 'png' / f'{a.frame:05d}.png').convert('RGB'))
    pal = classify(A)
    x0, y0, w, h = map(int, a.crop.split(','))
    z = 4
    crop = A[y0:y0 + h, x0:x0 + w]

    # palette map: the screen next to the palette chosen for every 8x1 span
    W, H = 2 * w * z + 40, h * z
    img = Image.new('RGB', (W, H), (8, 12, 24)); d = ImageDraw.Draw(img)
    img.paste(Image.fromarray(crop).resize((w * z, h * z), Image.NEAREST), (0, 0))
    ox = w * z + 40
    for yy in range(h):
        for cx in range(w // 8):
            k = pal[y0 + yy, x0 // 8 + cx]
            d.rectangle([ox + cx * 8 * z, yy * z, ox + (cx + 1) * 8 * z - 2, yy * z + z - 1], fill=MAPCOL[k])
    img.save(PUB / 'img/palmap.png')

    # edge comparison: where black could not be used (sky palette), the object's dark shows as the sky palette's dark green
    m09 = (crop == P09).all(2)
    for name, col in (('ideal', BLK), ('1a', P1A), ('19', P19), ('final', P09)):
        c = crop.copy(); c[m09] = col
        Image.fromarray(c).resize((w * z, h * z), Image.NEAREST).save(PUB / f'img/edge_{name}.png')
        t = c[4:68]  # the enemy only (screen rows y0+4 .. y0+68), for the large before/after panels
        Image.fromarray(t).resize((w * z, 64 * z), Image.NEAREST).save(PUB / f'img/edget_{name}.png')

    # one real 8x1 span on an object edge in the sky: purple + the dark that wanted to be black + gray
    best = None
    for y in range(y0, y0 + h):
        for cx in range(x0 // 8, (x0 + w) // 8):
            cell = A[y, cx * 8:cx * 8 + 8]
            n09 = int((cell == P09).all(1).sum()); npur = int((cell == PUR).all(1).sum())
            ngray = int((cell == (173, 173, 173)).all(1).sum())
            if n09 >= 2 and npur >= 2 and ngray >= 1:
                score = min(n09, npur) * 10 + ngray
                if best is None or score > best[0]:
                    best = (score, y, cx)
    _, sy, scx = best
    cell = A[sy, scx * 8:scx * 8 + 8]
    span = {'frame': a.frame, 'crop': [x0, y0, w, h], 'x': scx * 8, 'y': sy,
            'pixels': ['#%02x%02x%02x' % tuple(int(v) for v in p) for p in cell],
            'counts': {k: int((pal == k).sum()) for k in MAPCOL}}
    (ROOT / 'src/palspan.json').write_text(json.dumps(span, ensure_ascii=False, indent=1))
    print(span)


if __name__ == '__main__':
    main()
