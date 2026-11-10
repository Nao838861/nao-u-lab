"""車のポリゴンモデルの解説用クリップを作る。形・面・色はすべてROM（Web版と同じ11月2日版）から読む。
描き方もゲームと同じ：面は記録の順に描き、裏を向いた面は描かず、2色の材質は1ドットごとの市松模様。
画素は実機と同じく横長（8:7）で拡大する。

出力（public/video/car_*.mp4 と public/img/car_*.png、時刻表 src/data/car_clips.json）:
  car_build  … 面を描く順に1枚ずつ足していく（19枚）
  car_tyre   … 一周回しながら、後輪の斜めの板2枚を強調
  car_lod    … 自車（19面）とライバル（17面）を並べて回す
  car_morph  … 形の変遷（GT風B → デザインD → 幅7/8・厚み → 背1.3倍）。車体とキャビンの16頂点だけを補間
  car_window_gray / car_window_mesh … 窓を灰一色にした場合と、灰白の市松模様の場合（道路の上）
"""
import json
import math
import struct
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
rom = (root / 'webcore/normal.nes').read_bytes()
OFF = 16 + 8192


def words(a, n=1):
    return struct.unpack_from('<%dH' % n, rom, OFF + a - 0x8000)


def verts(a, n):
    return [list(struct.unpack_from('<3h', rom, OFF + a - 0x8000 + i * 6)) for i in range(n)]


def faces(a, n):
    return [[(p - 0x8600) // 6 for p in words(a + i * 12, 6)[2:]] for i in range(n)]


BASE = verts(0x8cd8, 6) + verts(0x8e04, 10) + verts(0x8160, 16) + verts(0x81c0, 6)
FIRST, SHARED, LAST = faces(0x81e8, 2), faces(0x8200, 14), faces(0x82a8, 3)
CARS = []
for actor, block in enumerate(words(0x85a8, 4)):
    wing, panel, ptr = words(block, 3)
    mats = list(words(0x8500 + actor * 32, 16))
    v = BASE + verts(ptr + 8, 4)
    if actor == 0:
        CARS.append(dict(v=v, f=FIRST + SHARED + LAST, m=mats + [wing, 1, panel]))
    else:
        CARS.append(dict(v=v, f=SHARED + LAST, m=mats[:14] + [wing, 1, panel]))
PLAYER, RIVAL = CARS[0], CARS[3]
FACE_NAMES = (['後輪の斜めのポリゴン（左）', '後輪の斜めのポリゴン（右）'] +
              ['車体の側面（左）', '車体の側面（右）', 'ボンネットとトランク', '車体の後面', '車体の前面',
               'タイヤ（左後）', 'タイヤ（左前）', 'タイヤ（右後）', 'タイヤ（右前）',
               '窓（左）', '窓（右）', '屋根', '後ろの窓', 'フロントガラス'] +
              ['ウイング', 'ランプ', 'ナンバープレート'])

COL = {1: (181, 49, 32), 2: (12, 147, 0), 3: (102, 102, 102), 4: (255, 254, 255)}
BG = (10, 15, 30)
HL = (255, 200, 60)
NW, NH, S = 224, 144, 5          # 実画素の大きさと拡大率（横は8/7倍）
OW, OH = round(NW * S * 8 / 7), NH * S


def project(v, yaw, pitch, dist=1150, focal=440, cx=NW / 2, cy=NH / 2 + 6):
    out = []
    cyw, syw, cp, sp = math.cos(yaw), math.sin(yaw), math.cos(pitch), math.sin(pitch)
    for x, y, z in v:
        y -= 80
        x1 = x * cyw - z * syw
        z1 = x * syw + z * cyw
        y2 = y * cp + z1 * sp           # カメラは車の後ろ側の上から見下ろす
        z2 = z1 * cp - y * sp + dist
        f = focal / z2
        out.append((cx + x1 * f, cy - y2 * f))
    return out


def visible(pts):
    a = sum(pts[i][0] * pts[(i + 1) % 4][1] - pts[(i + 1) % 4][0] * pts[i][1] for i in range(4))
    return a > 0


CHECK = Image.new('1', (NW, NH))
CHECK.putdata([(x + y) & 1 for y in range(NH) for x in range(NW)])


def paint(img, pts, mat):
    lo, hi = mat & 15, (mat >> 4) & 15
    mask = Image.new('1', (NW, NH), 0)
    ImageDraw.Draw(mask).polygon(pts, fill=1)
    layer = Image.new('RGB', (NW, NH), COL.get(lo, (0, 0, 0)))
    if hi:
        layer = Image.composite(Image.new('RGB', (NW, NH), COL.get(hi, (0, 0, 0))), layer, CHECK)
    img.paste(layer, (0, 0), mask)


def render(car, yaw, pitch, upto=None, hl=(), wire=False, bg=BG, v=None, faces_on=None, force_hl=False, **kw):
    v = v or car['v']
    P = project(v, yaw, pitch, **kw)
    img = Image.new('RGB', (NW, NH), bg)
    shown = []
    for k, (f, m) in enumerate(zip(car['f'], car['m'])):
        if upto is not None and k >= upto:
            break
        if faces_on is not None and k not in faces_on:
            continue
        pts = [P[i] for i in f]
        if visible(pts):
            paint(img, pts, m)
            shown.append(k)
    big = img.resize((OW, OH), Image.NEAREST)
    d = ImageDraw.Draw(big)
    sx, sy = OW / NW, OH / NH
    up = lambda p: (p[0] * sx, p[1] * sy)
    if wire:  # まだ描いていない面も含めた全体の形を細い線で
        for f in car['f']:
            pts = [up(P[i]) for i in f]
            d.line(pts + [pts[0]], fill=(80, 110, 170), width=2)
    for k in hl:
        if k not in shown and not force_hl:  # 隠れている面は強調しない
            continue
        pts = [up(P[i]) for i in car['f'][k]]
        d.line(pts + [pts[0]], fill=HL, width=6, joint='curve')
    return big, shown


def encode(name, frames):
    out = root / 'public/video' / f'{name}.mp4'
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{OW}x{OH}', '-r', '60', '-i', '-',
                          '-c:v', 'libx264', '-crf', '12', '-pix_fmt', 'yuv420p', str(out)], stdin=subprocess.PIPE)
    n = 0
    for im in frames:
        p.stdin.write(im.tobytes())
        n += 1
    p.stdin.close()
    p.wait()
    print(name, n, 'frames')
    return n


data = {'size': [OW, OH], 'faces': {'player': len(PLAYER['f']), 'rival': len(RIVAL['f'])},
        'vertices': {'player': len({i for f in PLAYER['f'] for i in f}), 'rival': len({i for f in RIVAL['f'] for i in f})},
        'faceNames': FACE_NAMES}
R = math.radians

# 1) 面を1枚ずつ足す
STEP, HOLD = 22, 150
build_at = [k * STEP + 30 for k in range(len(PLAYER['f']))]


def build_frames():
    total = build_at[-1] + STEP + HOLD
    for t in range(total):
        upto = sum(1 for a in build_at if t >= a)
        newest = [upto - 1] if upto and t - build_at[upto - 1] < STEP else []
        yaw = R(-40 + 80 * t / total)   # 0度が真後ろ
        yield render(PLAYER, yaw, R(24), upto=upto, hl=newest, wire=True)[0]


data['build'] = {'frames': encode('car_build', build_frames()), 'faceAt': build_at}


# 2) 後輪の斜めの板を強調して一周
def tyre_frames():
    total = 600
    for t in range(total):
        yaw = R(360 * t / total)
        yield render(PLAYER, yaw, R(16), hl=[0, 1])[0]


data['tyre'] = {'frames': encode('car_tyre', tyre_frames()), 'startYaw': 0}

# 2b) 斜めの板だけ（車体は線）を真横から：板1枚であることを見せる静止画
img, _ = render(PLAYER, R(60), R(14), wire=True, faces_on={0, 1}, hl=[0, 1], force_hl=True)
img.save(root / 'public/img/car_tyre_side.png')
img, _ = render(PLAYER, R(0), R(16), hl=[0, 1])
img.save(root / 'public/img/car_tyre_rear.png')


# 3) 自車とライバルを並べる
def lod_frames():
    total = 600
    for t in range(total):
        yaw = R(360 * t / total)
        a = render(PLAYER, yaw, R(16), hl=[0, 1])[0]
        b = render(RIVAL, yaw, R(16))[0]
        both = Image.new('RGB', (OW, OH), BG)
        both.paste(a.resize((OW // 2, OH // 2), Image.NEAREST), (0, OH // 4))
        both.paste(b.resize((OW // 2, OH // 2), Image.NEAREST), (OW // 2, OH // 4))
        yield both


data['lod'] = {'frames': encode('car_lod', lod_frames())}

# 4) 形の変遷：車体とキャビンの16頂点（面は同じつながり）
shapes = root / 'rec/shapes'
STAGES = [
    ('GT風（デザインB）', json.loads((shapes / 'B.json').read_text())['body_and_cabin_vertices']),
    ('デザインD', json.loads((shapes / 'D.json').read_text())['body_and_cabin_vertices']),
    ('厚み・幅8分の7・タイヤ位置', json.loads((shapes / 'W3.json').read_text())['body_and_cabin_vertices']),
    ('背を1.3倍（現在）', [list(v) for v in BASE[:16]]),
]
BODY = dict(v=None, f=[SHARED[i] for i in (0, 1, 2, 3, 4, 9, 10, 11, 12, 13)],
            m=[PLAYER['m'][2 + i] for i in (0, 1, 2, 3, 4, 9, 10, 11, 12, 13)])
HOLD_S, MORPH = 150, 70
stage_at = []


def morph_frames():
    t = 0
    for si, (_, vs) in enumerate(STAGES):
        stage_at.append(t)
        for _ in range(HOLD_S):
            yield render(BODY, R(35 + 10 * math.sin(t / 90)), R(14), v=vs)[0]
            t += 1
        if si + 1 < len(STAGES):
            nxt = STAGES[si + 1][1]
            for k in range(MORPH):
                a = 0.5 - 0.5 * math.cos(math.pi * (k + 1) / MORPH)
                mv = [[p + (q - p) * a for p, q in zip(u, w)] for u, w in zip(vs, nxt)]
                yield render(BODY, R(35 + 10 * math.sin(t / 90)), R(14), v=mv)[0]
                t += 1


data['morph'] = {'frames': encode('car_morph', morph_frames()), 'stageAt': stage_at, 'labels': [s[0] for s in STAGES],
                 'note': '車体とキャビンの16頂点のみ。色は現在の材質で統一'}

# 5) 窓：灰一色と灰白の市松模様（道路の灰色の上、真後ろから）
ROAD = COL[3]
win = dict(PLAYER)
gray = dict(PLAYER, m=list(PLAYER['m']))
for k in (11, 12, 14, 15):  # 窓（左右）・後ろの窓・フロントガラス
    gray['m'][k] = 3
render(gray, R(0), R(20), bg=ROAD)[0].save(root / 'public/img/car_window_gray.png')
render(win, R(0), R(20), bg=ROAD)[0].save(root / 'public/img/car_window_mesh.png')

(root / 'src/data').mkdir(parents=True, exist_ok=True)
(root / 'src/data/car_clips.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
print(json.dumps({k: data[k] for k in ('faces', 'vertices')}, ensure_ascii=False))


# 6) SuperFXの流れ：頂点 → 画面に写す → 裏の面を捨てる → 順に塗る
PIPE = 150


def pipeline_frames():
    edges = set()
    for f in PLAYER['f']:
        for i in range(4):
            a, b = f[i], f[(i + 1) % 4]
            if a != b:
                edges.add((min(a, b), max(a, b)))
    for t in range(PIPE * 4):
        stage, u = divmod(t, PIPE)
        yaw, pitch = R(-30 + 40 * t / (PIPE * 4)), R(22)
        P = project(PLAYER['v'], yaw, pitch)
        sx, sy = OW / NW, OH / NH
        up = lambda p: (p[0] * sx, p[1] * sy)
        if stage < 3:
            img = Image.new('RGB', (OW, OH), BG)
            d = ImageDraw.Draw(img)
            used = sorted({i for f in PLAYER['f'] for i in f})
            if stage >= 1:
                for a, b in edges:
                    d.line([up(P[a]), up(P[b])], fill=(90, 130, 200), width=3)
            if stage == 2:
                a = min(1, u / 40)
                for f in PLAYER['f']:
                    pts = [P[i] for i in f]
                    if not visible(pts):
                        q = [up(p) for p in pts]
                        col = tuple(int(c * (1 - a) + 10 * a) for c in (255, 80, 90))
                        d.line(q + [q[0]], fill=col, width=5)
            for i in used:
                x, y = up(P[i])
                r = 9 if stage == 0 else 6
                d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 200, 60))
            yield img
        else:
            upto = min(len(PLAYER['f']), 1 + u * len(PLAYER['f']) // (PIPE - 30))
            yield render(PLAYER, yaw, pitch, upto=upto, hl=[upto - 1] if upto < len(PLAYER['f']) else [], wire=False)[0]


data['pipeline'] = {'frames': encode('car_pipeline', pipeline_frames()), 'stageFrames': PIPE,
                    'labels': ['座標変換', '透視投影', '裏面除去', '奥から順に描画']}

# 7) 1行ずつ塗る：車の後面1枚を、ゲームと同じ実画素で走査線に分ける
yaw, pitch = R(12), R(18)
P = project(PLAYER['v'], yaw, pitch, dist=900, focal=150)
face = PLAYER['f'][2 + 3]            # 車体の後面
mat = PLAYER['m'][2 + 3]
pts = [P[i] for i in face]
mask = Image.new('1', (NW, NH), 0)
ImageDraw.Draw(mask).polygon(pts, fill=1)
box = mask.getbbox()
rows = []
for y in range(box[1], box[3]):
    xs = [x for x in range(box[0], box[2]) if mask.getpixel((x, y))]
    if xs:
        rows.append([y - box[1], xs[0] - box[0], xs[-1] - box[0]])
lo, hi = mat & 15, (mat >> 4) & 15
data['raster'] = {'w': box[2] - box[0], 'h': box[3] - box[1], 'rows': rows, 'ox': box[0], 'oy': box[1],
                  'colors': [list(COL[lo]), list(COL[hi])], 'face': '車体の後面', 'material': mat,
                  'pixels': sum(r[2] - r[1] + 1 for r in rows)}
(root / 'src/data/car_clips.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
print('raster', data['raster']['w'], data['raster']['h'], data['raster']['pixels'])


# 8) 車・家・木をY軸回転：ライティングがないので、隣り合う面をタイリングで塗り分けている
def model(va, vn, fa, fn):
    vs = verts(va, vn)
    fl, ml = [], []
    for i in range(fn):
        d = words(fa + i * 12, 6)
        ml.append(d[0])
        fl.append([(p - 0x8600) // 6 for p in d[2:]])
    return dict(v=vs, f=fl, m=ml)


TREE = model(0x8300, 11, 0x8c00, 7)    # 幹3枚＋葉4枚（ROMのモデル記述 $8400）
HOUSE = model(0x8348, 24, 0x8c60, 10)  # 壁・屋根・妻・ドア・窓（$8410）
# 家と木は頂点の並びが車と逆向き（ゲームでは面の平面式で裏面を判定している）ので、表裏の判定を反転する
OBJS = [('自車', PLAYER, 1, False), ('家', HOUSE, 3, True), ('木', TREE, 2, True)]  # 単色にするときの色
PW, PH, PS = 96, 96, 4                 # 1つのモデルの実画素の枠と拡大率


def render_obj(car, yaw, pitch, flat=None, inward=False):
    vs = car['v']
    ys = [p[1] for p in vs]
    cyw = (max(ys) + min(ys)) / 2
    R = max(math.sqrt(x * x + (y - cyw) ** 2 + z * z) for x, y, z in vs)
    dist, focal = R * 4.2, 60 * 4.2 / 2 * 1.15
    cy_, sy_, cp, sp = math.cos(yaw), math.sin(yaw), math.cos(pitch), math.sin(pitch)
    P = []
    for x, y, z in vs:
        y -= cyw
        x1 = x * cy_ - z * sy_
        z1 = x * sy_ + z * cy_
        y2 = y * cp + z1 * sp
        z2 = z1 * cp - y * sp + dist
        f = focal / z2
        P.append((PW / 2 + x1 * f, PH / 2 - y2 * f))
    img = Image.new('RGB', (PW, PH), BG)
    chk = Image.new('1', (PW, PH))
    chk.putdata([(x + y) & 1 for y in range(PH) for x in range(PW)])
    for f, m in zip(car['f'], car['m']):
        pts = [P[i] for i in f]
        if visible(pts) == inward:
            continue
        mm = flat if flat is not None else m
        lo, hi = mm & 15, (mm >> 4) & 15
        mask = Image.new('1', (PW, PH), 0)
        ImageDraw.Draw(mask).polygon(pts, fill=1)
        layer = Image.new('RGB', (PW, PH), COL.get(lo, (0, 0, 0)))
        if hi:
            layer = Image.composite(Image.new('RGB', (PW, PH), COL.get(hi, (0, 0, 0))), layer, chk)
        img.paste(layer, (0, 0), mask)
    return img


def lighting_frames(flat):
    total = 720
    for t in range(total):
        yaw = R(360 * t / total)
        row = Image.new('RGB', (PW * 3, PH), BG)
        for i, (_, car, col, inward) in enumerate(OBJS):
            row.paste(render_obj(car, yaw, R(10), flat=col if flat else None, inward=inward), (i * PW, 0))
        yield row.resize((round(PW * 3 * PS * 8 / 7) // 2 * 2, PH * PS), Image.NEAREST)


def encode_any(name, frames):
    frames = iter(frames)
    first = next(frames)
    w, h = first.size
    out = root / 'public/video' / f'{name}.mp4'
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', '60', '-i', '-',
                          '-c:v', 'libx264', '-crf', '12', '-pix_fmt', 'yuv420p', str(out)], stdin=subprocess.PIPE)
    n = 0
    for im in [first, *frames]:
        p.stdin.write(im.tobytes())
        n += 1
    p.stdin.close()
    p.wait()
    print(name, n, 'frames', w, h)
    return n, w, h


n, w, h = encode_any('obj_flat', lighting_frames(True))
encode_any('obj_tiled', lighting_frames(False))
data['lighting'] = {'frames': n, 'size': [w, h], 'labels': [o[0] for o in OBJS],
                    'faces': {'tree': len(TREE['f']), 'house': len(HOUSE['f'])},
                    'note': '同じモデル・同じ角度。上は全ポリゴンを単色、下はROMの材質（2色の市松を含む）'}
(root / 'src/data/car_clips.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
