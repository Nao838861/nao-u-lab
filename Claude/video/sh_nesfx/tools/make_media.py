"""Build the video assets in public/ from a recording (tools/record.py) and its sprites-off twin.

usage: python tools/make_media.py rec/main rec/nospr [--clips src/clips.json]
src/clips.json: frame numbers of main.mp4 (60fps) shared with the Remotion scenes

Layer split (for the S03 thumbnails) is derived from pixels, not from the hardware:
  sprites = pixels that differ between the normal and the sprites-off frame
  SuperFX objects = sprites-off pixels that are neither sky nor ground colors (outside the distant-scenery band)
  ground = everything else of the sprites-off frame
"""
import argparse, json, subprocess, sys, wave
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / 'public'
SKY = (198, 118, 255); GROUND = [(92, 228, 48), (56, 135, 0), (207, 239, 150)]
RED = (181, 49, 32); BLACK = (0, 0, 0)
DARK = np.array([10, 15, 30], np.uint8)


def load(d, i):
    # the first frame(s) after power-on may have no screenshot yet: fall back to black
    try:
        return np.array(Image.open(d / 'png' / f'{i:05d}.png').convert('RGB'))
    except (OSError, ValueError):
        return np.zeros((240, 256, 3), np.uint8)


def is_col(a, c):
    return (a[..., 0] == c[0]) & (a[..., 1] == c[1]) & (a[..., 2] == c[2])


def horizon(a):
    sky = is_col(a, SKY)
    for y in range(4, 236):
        if not sky[y, 0] and not sky[y, 255]:
            return y
    return 200


def ff(args, inp_fmt, size, rate, out, vf=None, audio=None, crf=16, extra=()):
    cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{size[0]}x{size[1]}', '-framerate', str(rate), '-i', '-']
    if audio: cmd += ['-i', str(audio)]
    if vf: cmd += ['-vf', vf]
    cmd += ['-c:v', 'libx264', '-crf', str(crf), '-g', '60', '-pix_fmt', 'yuv420p', *extra]
    if audio: cmd += ['-c:a', 'aac', '-b:a', '192k', '-shortest']
    cmd += [str(out)]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('rec', type=Path); ap.add_argument('nospr', type=Path)
    ap.add_argument('--clips', type=Path, default=ROOT / 'src/clips.json'); ap.add_argument('--only', default='')
    a = ap.parse_args(); clips = json.loads(a.clips.read_text())
    n = len(list((a.rec / 'png').glob('*.png')))
    only = set(a.only.split(',')) if a.only else None
    want = lambda k: only is None or k in only
    (PUB / 'video').mkdir(parents=True, exist_ok=True); (PUB / 'img').mkdir(parents=True, exist_ok=True)

    if want('main'):
        p = ff(a, 'rgb24', (256, 240), 60, PUB / 'video/main.mp4', vf='scale=1024:960:flags=neighbor', audio=a.rec / 'game_audio.wav')
        for i in range(1, n + 1): p.stdin.write(load(a.rec, i).tobytes())
        p.stdin.close(); p.wait()

    if want('layers'):
        s0 = clips['layers']; L = 60 * 40
        ps = {k: ff(a, 'rgb24', (256, 240), 60, PUB / f'video/layer_{k}.mp4', vf='scale=512:480:flags=neighbor', crf=20) for k in ('spr', 'ground', 'fx')}
        # pad so that startFrom=CLIP.layers lines up with main.mp4
        blank = np.zeros((240, 256, 3), np.uint8); blank[:] = DARK
        for i in range(1, s0 + 1):
            for p in ps.values(): p.stdin.write(blank.tobytes())
        for i in range(s0 + 1, min(n, s0 + L) + 1):
            A = load(a.rec, i); B = load(a.nospr, i)
            spr = np.any(A != B, axis=2)
            hz = horizon(B)
            sky = is_col(B, SKY)
            gnd = np.zeros_like(sky)
            for g in GROUND: gnd |= is_col(B, g)
            rows = np.arange(240)[:, None]
            # above the distant-scenery band: anything that is not sky; below the horizon: anything not a ground color
            obj = ((rows < hz - 18) & ~sky) | ((rows >= hz + 2) & ~gnd)
            out = {k: np.empty_like(A) for k in ps}
            out['spr'][:] = DARK; out['spr'][spr] = A[spr]
            out['fx'][:] = DARK; out['fx'][obj] = B[obj]
            out['ground'][:] = B; out['ground'][obj] = DARK
            for k, p in ps.items(): p.stdin.write(out[k].tobytes())
        for p in ps.values(): p.stdin.close(); p.wait()

    if want('cmp30'):
        s0 = clips['cmp']; L = 60 * 12
        p = ff(a, 'rgb24', (256, 240), 60, PUB / 'video/cmp30.mp4', vf='scale=1024:960:flags=neighbor')
        for i in range(L): p.stdin.write(load(a.rec, s0 + 1 + (i // 2) * 2).tobytes())
        p.stdin.close(); p.wait()

    if want('horizon'):
        s0 = clips['horizon']; L = 60 * 14
        hz = horizon(load(a.nospr, s0 + 1))
        y0 = max(0, hz - 44)
        p = ff(a, 'rgb24', (256, 64), 60, PUB / 'video/horizon.mp4', vf='scale=1792:448:flags=neighbor', crf=18)
        for i in range(s0 + 1, s0 + L + 1): p.stdin.write(np.ascontiguousarray(load(a.nospr, i)[y0:y0 + 64]).tobytes())  # sprites off: no player in front
        p.stdin.close(); p.wait()
        print('horizon crop rows', y0, y0 + 64)

    if want('trees'):
        s0 = clips['trees']; L = 60 * 12
        p = ff(a, 'rgb24', (176, 121), 60, PUB / 'video/trees.mp4', vf='scale=1056:726:flags=neighbor', crf=18)
        x0 = clips.get('trees_x', 40); y0 = clips.get('trees_y', 100)
        for i in range(s0 + 1, s0 + L + 1): p.stdin.write(np.ascontiguousarray(load(a.rec, i)[y0:y0 + 121, x0:x0 + 176]).tobytes())
        p.stdin.close(); p.wait()

    if want('pal81'):
        make_pal81(a, clips)

    if want('meters'):
        m = json.loads((a.rec / 'meters.json').read_text()); s0 = clips['sound']; L = 60 * 60
        (ROOT / 'src/meters.json').write_text(json.dumps({k: v[s0:s0 + L] for k, v in m.items()}))

    if want('attr16'):
        make_attr16(a, clips)

    if want('darkgreen'):
        make_darkgreen(a, clips)

    if want('thumb'):
        Image.fromarray(load(a.rec, clips['thumb'])).resize((1920, 1800), Image.NEAREST).crop((0, 360, 1920, 1440)).save(PUB / 'img/thumb_frame.png')


def make_pal81(a, clips):
    i = clips['pal81']; x0, y0 = clips.get('pal81_x', 96), clips.get('pal81_y', None)
    A = load(a.rec, i); B = load(a.nospr, i); hz = horizon(B)
    if y0 is None: y0 = max(0, hz - 32)
    w, h, z = 64, 48, 8
    crop = A[y0:y0 + h, x0:x0 + w]
    colmap = {'sky': (198, 118, 255), 'ground': (92, 228, 48), 'red': (230, 60, 50), 'black': (235, 235, 235)}
    pal = np.zeros((h, w // 8), object)
    for yy in range(h):
        for cx in range(w // 8):
            cell = B[y0 + yy, x0 + cx * 8:x0 + cx * 8 + 8]
            tup = [tuple(c) for c in cell]
            # ground colors count as background only below the horizon (above it they are parts of objects)
            has_sky = SKY in tup; has_gr = y0 + yy >= hz and any(g in tup for g in GROUND)
            if has_sky: k = 'sky'
            elif has_gr: k = 'ground'
            elif RED in tup: k = 'red'
            elif BLACK in tup: k = 'black'
            else: k = 'sky' if y0 + yy < hz else 'ground'
            pal[yy, cx] = k
    W, H = 1100, 800
    img = Image.new('RGB', (W, H), (8, 12, 24)); d = ImageDraw.Draw(img)
    big = Image.fromarray(crop).resize((w * z, h * z), Image.NEAREST)
    ox1, oy = 20, 90; ox2 = ox1 + w * z + 36
    img.paste(big, (ox1, oy))
    for yy in range(h):
        for cx in range(w // 8):
            x = ox2 + cx * 8 * z; y = oy + yy * z
            d.rectangle([x, y, x + 8 * z - 1, y + z - 1], fill=colmap[pal[yy, cx]], outline=(10, 14, 26))
    for cx in range(w // 8 + 1):
        d.line([ox1 + cx * 8 * z, oy, ox1 + cx * 8 * z, oy + h * z], fill=(255, 255, 255), width=1)
    try:
        font = ImageFont.truetype('C:/Windows/Fonts/YuGothB.ttc', 30); fs = ImageFont.truetype('C:/Windows/Fonts/YuGothB.ttc', 26)
    except OSError:
        font = fs = ImageFont.load_default()
    d.text((ox1, 30), '画面（拡大）', font=font, fill=(238, 243, 255))
    d.text((ox2, 30), '8×1ごとのパレット', font=font, fill=(238, 243, 255))
    lx = ox2
    for name, k in (('空', 'sky'), ('地面', 'ground'), ('赤', 'red'), ('黒', 'black')):
        d.rectangle([lx, oy + h * z + 30, lx + 34, oy + h * z + 64], fill=colmap[k]); d.text((lx + 44, oy + h * z + 30), name, font=fs, fill=(238, 243, 255)); lx += 130
    img.save(PUB / 'img/pal81.png')


def make_attr16(a, clips):
    """Same crop as pal81 with the ordinary NES attribute grid (one palette per 16x16 dots)."""
    i = clips['pal81']; x0, y0 = clips.get('pal81_x', 96), clips['pal81_y']
    A = load(a.rec, i); w, h, z = 64, 48, 8
    W, H = 1100, 800
    img = Image.new('RGB', (W, H), (8, 12, 24)); d = ImageDraw.Draw(img)
    ox, oy = 20, 90
    img.paste(Image.fromarray(A[y0:y0 + h, x0:x0 + w]).resize((w * z, h * z), Image.NEAREST), (ox, oy))
    # attribute grid is aligned to the screen: lines at multiples of 16
    for gx in range(x0 - x0 % 16 + 16 if x0 % 16 else x0, x0 + w + 1, 16):
        d.line([ox + (gx - x0) * z, oy, ox + (gx - x0) * z, oy + h * z], fill=(255, 181, 71), width=3)
    for gy in range(y0 - y0 % 16 + 16 if y0 % 16 else y0, y0 + h + 1, 16):
        d.line([ox, oy + (gy - y0) * z, ox + w * z, oy + (gy - y0) * z], fill=(255, 181, 71), width=3)
    ox2 = ox + w * z + 36
    img.paste(Image.fromarray(A[y0:y0 + h, x0:x0 + w]).resize((w * z, h * z), Image.NEAREST), (ox2, oy))
    for cx in range(w // 8 + 1):
        d.line([ox2 + cx * 8 * z, oy, ox2 + cx * 8 * z, oy + h * z], fill=(63, 224, 255), width=1)
    for yy in range(h + 1):
        d.line([ox2, oy + yy * z, ox2 + w * z, oy + yy * z], fill=(63, 224, 255), width=1)
    try:
        f = ImageFont.truetype('C:/Windows/Fonts/YuGothB.ttc', 30)
    except OSError:
        f = ImageFont.load_default()
    d.text((ox, 30), '普通のファミコン：16×16ドット', font=f, fill=(255, 181, 71))
    d.text((ox2, 30), '今回の回路：8×1ドット', font=f, fill=(63, 224, 255))
    img.save(PUB / 'img/attr16.png')


def make_darkgreen(a, clips):
    """Tree across the horizon: its dark green is $09 above (sky palette) and $19 below (ground palette)."""
    i = clips['darkgreen']; B = load(a.nospr, i); hz = horizon(B)
    x0, y0, w, h, z = 56, 76, 72, 130, 4
    crop = B[y0:y0 + h, x0:x0 + w]
    W, H = 840, 560
    img = Image.new('RGB', (W, H), (8, 12, 24)); d = ImageDraw.Draw(img)
    img.paste(Image.fromarray(crop).resize((w * z, h * z), Image.NEAREST), (20, 20))
    yy = 20 + (hz - y0) * z
    for x in range(10, 20 + w * z + 10, 16): d.line([x, yy, x + 8, yy], fill=(255, 181, 71), width=3)
    try:
        f = ImageFont.truetype('C:/Windows/Fonts/YuGothB.ttc', 32); fs = ImageFont.truetype('C:/Windows/Fonts/YuGothB.ttc', 26)
    except OSError:
        f = fs = ImageFont.load_default()
    lx = 20 + w * z + 40
    d.text((lx, yy - 18), '地平線', font=fs, fill=(255, 181, 71))
    d.text((lx, 60), '地平線より上（空側）', font=fs, fill=(238, 243, 255))
    d.rectangle([lx, 100, lx + 90, 170], fill=(11, 72, 0), outline=(255, 255, 255)); d.text((lx + 105, 115), '暗い緑 $09', font=f, fill=(238, 243, 255))
    d.text((lx, yy + 40), '地平線より下（地面側）', font=fs, fill=(238, 243, 255))
    d.rectangle([lx, yy + 80, lx + 90, yy + 150], fill=(56, 135, 0), outline=(255, 255, 255)); d.text((lx + 105, yy + 95), '暗い緑 $19', font=f, fill=(238, 243, 255))
    d.text((lx, H - 70), '同じ木でも、空側と地面側で', font=fs, fill=(159, 176, 214)); d.text((lx, H - 38), '暗い緑が違う色になる', font=fs, fill=(159, 176, 214))
    img.save(PUB / 'img/darkgreen.png')


if __name__ == '__main__':
    main()
