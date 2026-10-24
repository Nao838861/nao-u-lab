"""図解用の画像とJSONを public/gen/ へ出す。decode_course.py の出力（course/, course18/）を前提にする。

- atlas_q0.png        : 角度区画0で使われる固有タイルを並べた一覧
- blocks_000.json     : 角度0の29x29ブロックの種類（u=一様, d=辞書）と辞書番号
- jitter/{v8,v18}/NNN.png : 回転を打ち消した同じ場所の切り抜き（木のガタつき比較）
"""
from pathlib import Path
import json
import sys

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import decode_course as dc

GEN = dc.OUT
STEP = 360 / 128


def atlas(dec, quarter=0, cols=128):
    seen = []
    have = set()
    for a in range(quarter, 128, 4):
        ws, _ = dec.words(a)
        for row in ws:
            for w in row:
                if (w & 16383) not in have:
                    have.add(w & 16383)
                    seen.append(w)
    rows = (len(seen) + cols - 1) // cols
    img = Image.new('RGB', (cols * 8, rows * 8), (12, 14, 18))
    for i, w in enumerate(seen):
        img.paste(dec.tile_image(w, quarter), (i % cols * 8, i // cols * 8))
    img.save(GEN / f'atlas_q{quarter}.png')
    return len(seen)


def blocks(dec, angle=0):
    _, kinds = dec.words(angle)
    out = [[('d' if k[0] == 'dict' else 'u') for k in row] for row in kinds]
    ids = [[(k[1] if k[0] == 'dict' else None) for k in row] for row in kinds]
    (GEN / f'blocks_{angle:03d}.json').write_text(json.dumps({'kinds': out, 'ids': ids}), encoding='utf-8')


def jitter(name, out, box):
    (GEN / 'jitter' / out).mkdir(parents=True, exist_ok=True)
    for a in range(128):
        im = Image.open(GEN / name / f'angle_{a:03d}.png')
        # 角度aの絵は世界を時計回りに a*STEP 度回したもの。反時計回りに戻して向きをそろえる
        back = im.rotate(a * STEP, resample=Image.Resampling.NEAREST, center=(464, 464), fillcolor=dc.GRASS)
        back.crop(box).save(GEN / 'jitter' / out / f'{a:03d}.png')


def main():
    dec = dc.Decoder(dc.DEV / 'releases/MMC5Racing_AllIntegrated_144x176.nes',
                     dc.DEV / 'build/direct/kernel/prepare.lbl', 116)
    print('atlas q0 tiles', atlas(dec, 0))
    blocks(dec, 0)
    box = tuple(int(v) for v in sys.argv[1].split(',')) if len(sys.argv) > 1 else (240, 380, 560, 700)
    jitter('course', 'v8', box)
    jitter('course18', 'v18', box)


if __name__ == '__main__':
    main()


def window_words(dec, angle=0, tx=21, ty=30, w=17, h=23):
    ws, _ = dec.words(angle)
    rows = [[[w_ & 255, w_ >> 8] for w_ in ws[ty + y][tx:tx + w]] for y in range(h)]
    (GEN / f'window_{angle:03d}.json').write_text(json.dumps({'tx': tx, 'ty': ty, 'rows': rows}), encoding='utf-8')


def thumbs(name='course', size=72, cols=16):
    sheet = Image.new('RGB', (cols * size, (128 // cols) * size), (7, 9, 13))
    for a in range(128):
        im = Image.open(GEN / name / f'angle_{a:03d}.png').crop((96, 96, 832, 832)).resize((size - 4, size - 4), Image.Resampling.LANCZOS)
        sheet.paste(im, (a % cols * size + 2, a // cols * size + 2))
    sheet.save(GEN / 'thumbs.png')


def extras():
    import shutil
    dec = dc.Decoder(dc.DEV / 'releases/MMC5Racing_AllIntegrated_144x176.nes',
                     dc.DEV / 'build/direct/kernel/prepare.lbl', 116)
    window_words(dec, 0)
    thumbs()
    for f in ('explosion-fire.png', 'explosion-white.png', 'game-over.png', 'apex-west.png'):
        shutil.copy(dc.DEV / 'verification/scenery' / f, GEN / f)
