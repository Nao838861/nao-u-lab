# B-2 マップ設計 v1 — 256×256・4市場の相互補完（正本: DECISIONS_20260814_b2_four_markets.md）
# 設計原則: 山塊は通行不可・峠だけが通り道 / どの圏も自給不能 / 同タイプの未開発候補地で迷いを作る
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from collections import deque

N = 256
rng = np.random.default_rng(20260814)

# ── 地形ID ──
SEA, SHALLOW, SAND, GRASS, FERT1, FERT2, FOREST, MOUNTAIN, ROCKDEP, ORE, COAL, PIER = range(12)

COLORS = {
    SEA: (27, 58, 92), SHALLOW: (46, 95, 134), SAND: (217, 197, 143),
    GRASS: (125, 168, 92), FERT1: (150, 191, 90), FERT2: (176, 208, 94),
    FOREST: (47, 106, 68), MOUNTAIN: (110, 105, 99), ROCKDEP: (154, 160, 166),
    ORE: (176, 112, 63), COAL: (58, 58, 61), PIER: (122, 87, 54),
}

yy, xx = np.mgrid[0:N, 0:N]

def blob(cx, cy, r, wobble=0.18, freq=5):
    """有機的な輪郭のかたまり(True=内側)"""
    ang = np.arctan2(yy - cy, xx - cx)
    noise = sum(np.sin(ang * f + rng.uniform(0, 6.28)) * (wobble / i)
                for i, f in enumerate(range(3, 3 + freq), 1))
    dist = np.hypot(xx - cx, yy - cy)
    return dist < r * (1 + noise)

# ── 1. 島の外形 ──
# 南西に母港の湾・東に漁港側の海岸線・北は山塊の高台が海に落ちる形
island = blob(128, 126, 102, wobble=0.10)
island |= blob(96, 190, 52, wobble=0.14)      # 南の張り出し(母港側)
island |= blob(196, 138, 46, wobble=0.14)     # 東の張り出し(漁港側)
island |= blob(120, 62, 78, wobble=0.10)      # 北の山地土台
island &= ~blob(88, 224, 24, wobble=0.25)     # 母港の湾を削る
island &= ~blob(238, 106, 26, wobble=0.2)     # 北東の入り江
island[:14, :] = False; island[-12:, :] = False
island[:, :12] = False; island[:, -12:] = False

terrain = np.full((N, N), SEA, dtype=np.int16)
terrain[island] = GRASS

# ── 2. 山塊（通行不可）──
mountains = np.zeros((N, N), bool)
# 北の大山塊: 島の北側を横断し、鉱山ポケットを抱く
for cx, cy, r in [(70, 66, 22), (100, 60, 26), (132, 52, 26), (164, 52, 26), (196, 66, 24),
                  (214, 90, 18), (84, 84, 13), (120, 84, 16), (176, 78, 16)]:
    mountains |= blob(cx, cy, r, wobble=0.16)
# 北の稜線は海まで落とす(海岸の抜け道を作らない——峠だけが通り道の担保)
ridge_line = 86 + (np.sin(xx * 0.045) * 7).astype(int)
mountains |= island & (yy < ridge_line)
# 鉱山ポケット(盆地状に山を抜く)
pocket = blob(150, 66, 18, wobble=0.12)
mountains &= ~pocket
# 東の海岸山脈: 盆地と漁港を隔てる
for cx, cy, r in [(180, 108, 13), (184, 128, 13), (186, 148, 13), (184, 168, 13), (178, 186, 12)]:
    mountains |= blob(cx, cy, r, wobble=0.14)
# 南西の小山脈(西の鉱脈候補を抱く)
for cx, cy, r in [(48, 108, 13), (58, 124, 11)]:
    mountains |= blob(cx, cy, r, wobble=0.15)
# 峠を切る(山を貫く回廊。これが唯一の通り道)
def corridor(x0, y0, x1, y1, width=4):
    steps = int(max(abs(x1-x0), abs(y1-y0))) * 2 + 1
    mask = np.zeros((N, N), bool)
    for t in np.linspace(0, 1, steps):
        cx, cy = x0 + (x1-x0)*t, y0 + (y1-y0)*t
        w = width * (1 + 0.35*np.sin(t*9))   # 幅が揺れる自然な峠道
        mask |= (np.hypot(xx-cx, yy-cy) < w)
    return mask
passes = np.zeros((N, N), bool)
passes |= corridor(116, 100, 138, 74)     # P1: 盆地→鉱山(南口)
passes |= corridor(206, 96, 164, 70)      # P2: 漁港→鉱山(東口)
passes |= corridor(172, 150, 192, 150)    # P3: 盆地→漁港
mountains &= ~passes
mountains &= island
terrain[mountains] = MOUNTAIN

# ── 3. 肥沃度(畑適地) ──
fert1 = blob(122, 138, 33, wobble=0.13) & island & ~mountains          # 中央盆地
fert2core = blob(122, 138, 18, wobble=0.15) & fert1
fert_sw = blob(66, 176, 11, wobble=0.18) & island & ~mountains          # 第二の盆地(近いが狭い)
terrain[fert1 | fert_sw] = FERT1
terrain[fert2core] = FERT2

# ── 4. 森(燃料と木材・前線が動く場) ──
forest = np.zeros((N, N), bool)
for cx, cy, r in [(96, 158, 17), (140, 170, 15), (76, 138, 12),          # 盆地の南縁の帯
                  (56, 190, 12), (118, 200, 12),                          # 母港圏の際
                  (94, 106, 12), (152, 96, 11), (208, 116, 9),           # 山裾
                  (160, 40, 10), (128, 34, 9)]:                           # 北の斜面
    forest |= blob(cx, cy, r, wobble=0.2)
forest &= island & ~mountains & ~fert2core & ~pocket
forest &= ~(blob(122, 138, 24, wobble=0.1))   # 盆地の耕作コアは開けておく
terrain[forest] = FOREST

# ── 5. 砂浜と浅瀬 ──
def dilate(mask, n=1):
    out = mask.copy()
    for _ in range(n):
        out = out | np.roll(out, 1, 0) | np.roll(out, -1, 0) | np.roll(out, 1, 1) | np.roll(out, -1, 1)
    return out

coast_land = island & dilate(~island, 2)
sand = coast_land & (terrain == GRASS)
terrain[sand] = SAND
shallow = ~island & dilate(island, 3)
terrain[shallow & (terrain == SEA)] = SHALLOW

# ── 6. 鉱床(山際にだけ現れる) ──
def deposit(kind, cx, cy, r, count):
    ok = dilate(mountains, 2) & ~mountains & island
    zone = blob(cx, cy, r, wobble=0.2) & ok
    ys, xs = np.where(zone)
    if len(ys) == 0: return
    pick = rng.choice(len(ys), size=min(count, len(ys)), replace=False)
    terrain[ys[pick], xs[pick]] = kind

# 鉱山ポケット(主鉱床: 鉄+石炭+石材が揃う)
deposit(ORE, 142, 62, 12, 46)
deposit(COAL, 160, 72, 12, 46)
deposit(ROCKDEP, 150, 54, 12, 38)
# 西の鉱脈候補(小・鉄のみ・石炭なし)
deposit(ORE, 54, 114, 9, 18)
deposit(ROCKDEP, 48, 102, 8, 14)
# 盆地の南の岩場(採石のみ)
deposit(ROCKDEP, 148, 186, 8, 10)

# ── 7. 漁場(海側に豊かさとして描く) ──
fish_rich = np.zeros((N, N), bool)
fish_mid = np.zeros((N, N), bool)
sea_ok = ~island
fish_rich |= blob(226, 148, 17, wobble=0.2) & sea_ok      # 漁港沖(豊か)
fish_rich |= blob(236, 100, 11, wobble=0.2) & sea_ok      # 北東入り江(豊か・遠い候補)
fish_mid  |= blob(64, 226, 13, wobble=0.2) & sea_ok       # 母港西の入江(中程度=近いが痩せ)
fish_mid  |= blob(150, 226, 11, wobble=0.2) & sea_ok      # 南岸(中)

# ── 8. 市場と候補地 ──
MARKETS = {  # id: (x, y, 名前)
    1: (92, 206, '母港'),
    2: (122, 140, '中央盆地(農耕)'),
    3: (204, 150, '漁港'),
    4: (150, 66, '山間鉱山'),
}
CANDIDATES = {
    5: (66, 176, '第二の盆地(近いが狭い)'),
    6: (64, 222, '近い入江(漁は中程度)'),
    7: (52, 112, '西の鉱脈(小・石炭なし)'),
    8: (236, 104, '北東の入り江(豊か・遠い)'),
}
PASSES = {'P1': (126, 88), 'P2': (188, 84), 'P3': (182, 150)}

# ── 9. 経路検証(BFS: 山と海は通行不可) ──
passable = island & ~mountains

def snap_to_land(x, y):
    if passable[y, x]: return x, y
    best, bd = (x, y), 1e9
    ys, xs = np.where(passable)
    d = (xs - x)**2 + (ys - y)**2
    i = int(np.argmin(d))
    return int(xs[i]), int(ys[i])

for table in (MARKETS, CANDIDATES):
    for mid, (x, y, name) in list(table.items()):
        nx, ny = snap_to_land(x, y)
        if (nx, ny) != (x, y):
            print(f'  snap: {name} ({x},{y})→({nx},{ny})')
        table[mid] = (nx, ny, name)
def bfs(sx, sy):
    dist = np.full((N, N), -1, np.int32)
    dq = deque([(sx, sy)]); dist[sy, sx] = 0
    while dq:
        x, y = dq.popleft()
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < N and 0 <= ny < N and passable[ny, nx] and dist[ny, nx] < 0:
                dist[ny, nx] = dist[y, x] + 1
                dq.append((nx, ny))
    return dist

d_port = bfs(*MARKETS[1][:2])
print('== 経路検証(母港からの道のりタイル / 荷車道なら50タイル=1日) ==')
for mid, (x, y, name) in {**MARKETS, **CANDIDATES}.items():
    t = d_port[y, x]
    print(f'  {mid}. {name}: {t}タイル ≒ {t*0.6/30:.1f}日' if t >= 0 else f'  {mid}. {name}: 到達不能!')
# 峠を塞いだら鉱山に行けないことの確認
blocked = passable.copy()
for px, py in PASSES.values():
    blocked[max(0,py-9):py+9, max(0,px-9):px+9] = False
def bfs2(grid, sx, sy):
    dist = np.full((N, N), -1, np.int32)
    dq = deque([(sx, sy)]); dist[sy, sx] = 0
    while dq:
        x, y = dq.popleft()
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < N and 0 <= ny < N and grid[ny, nx] and dist[ny, nx] < 0:
                dist[ny, nx] = dist[y, x] + 1
                dq.append((nx, ny))
    return dist
d_blocked = bfs2(blocked, *MARKETS[1][:2])
print('峠を全て塞いだ場合の山間鉱山:', '到達不能(峠が唯一の道) OK' if d_blocked[MARKETS[4][1], MARKETS[4][0]] < 0 else f'{d_blocked[MARKETS[4][1], MARKETS[4][0]]}タイルで到達=山が漏れている NG')

# ── 10. 描画 ──
HIGHMOUNT = (86, 82, 78)
mount_core = mountains & ~dilate(~mountains, 5)
img = Image.new('RGB', (N, N))
px_img = img.load()
for y in range(N):
    for x in range(N):
        px_img[x, y] = HIGHMOUNT if mount_core[y, x] else COLORS[terrain[y, x]]
# 漁場を点描
draw0 = ImageDraw.Draw(img)
for mask, color, step in [(fish_rich, (191, 232, 255), 3), (fish_mid, (150, 200, 230), 4)]:
    ys, xs = np.where(mask)
    for i in range(0, len(ys), step):
        px_img[xs[i], ys[i]] = color
img.save('/private/tmp/claude-503/-Users-Nao-u-nao-u-lab-Claude/c9cb35e1-aa97-4415-88e2-75290db11847/scratchpad/map_design/b2_map_raw.png')

# 注釈つき ×3
scale = 3
big = img.resize((N*scale, N*scale), Image.NEAREST)
draw = ImageDraw.Draw(big, 'RGBA')
try:
    font = ImageFont.truetype('/System/Library/Fonts/Hiragino Sans GB.ttc', 15)
    font_s = ImageFont.truetype('/System/Library/Fonts/Hiragino Sans GB.ttc', 12)
except Exception:
    font = font_s = ImageFont.load_default()
def marker(x, y, label, color, fill=(255,255,255,235)):
    X, Y = x*scale, y*scale
    draw.ellipse([X-10, Y-10, X+10, Y+10], fill=fill, outline=color, width=3)
    draw.text((X, Y), label, fill=(20,20,20), font=font, anchor='mm')
for mid, (x, y, name) in MARKETS.items():
    marker(x, y, str(mid), (200, 60, 40))
for mid, (x, y, name) in CANDIDATES.items():
    marker(x, y, str(mid), (60, 90, 200), fill=(235, 240, 255, 220))
for pname, (x, y) in PASSES.items():
    X, Y = x*scale, y*scale
    draw.rectangle([X-13, Y-9, X+13, Y+9], fill=(0,0,0,150))
    draw.text((X, Y), pname, fill=(255, 230, 150), font=font_s, anchor='mm')
big.save('/private/tmp/claude-503/-Users-Nao-u-nao-u-lab-Claude/c9cb35e1-aa97-4415-88e2-75290db11847/scratchpad/map_design/b2_map_annotated.png')
print('images saved')
