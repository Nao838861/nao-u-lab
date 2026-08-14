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

def value_noise(cell, seed_offset=0):
    g = np.random.default_rng(20260814 + seed_offset)
    gw = N // cell + 3
    grid = g.uniform(-1, 1, (gw, gw))
    gy, gx = yy / cell, xx / cell
    y0, x0 = gy.astype(int), gx.astype(int)
    fy, fx = gy - y0, gx - x0
    fy = fy * fy * (3 - 2 * fy); fx = fx * fx * (3 - 2 * fx)
    v = (grid[y0, x0] * (1-fx) * (1-fy) + grid[y0, x0+1] * fx * (1-fy)
         + grid[y0+1, x0] * (1-fx) * fy + grid[y0+1, x0+1] * fx * fy)
    return v

def fbm(seed_offset=0):
    return (value_noise(64, seed_offset) * 1.0 + value_noise(32, seed_offset+7) * 0.5
            + value_noise(16, seed_offset+13) * 0.25 + value_noise(8, seed_offset+29) * 0.12) / 1.87

# ドメインワープ: すべての形状評価をこの歪んだ座標系で行う→円が自然地形になる
WARP = 17.0
wx = xx + fbm(101) * WARP
wy = yy + fbm(202) * WARP
edge = fbm(303)  # 海岸線の細かい出入り

def blob(cx, cy, r, wobble=0.35, freq=None):
    """ワープ座標系のかたまり+輪郭ノイズ(True=内側)"""
    dist = np.hypot(wx - cx, wy - cy)
    return dist < r * (1 + edge * wobble)

# ── 1. 島の外形 ──
# 南西に母港の湾・東に漁港側の海岸線・北は山塊の高台が海に落ちる形
island = blob(128, 128, 92, wobble=0.22)
island |= blob(96, 190, 50, wobble=0.22)      # 南の張り出し(母港側)
island |= blob(196, 190, 42, wobble=0.22)     # 南東の張り出し(新しい漁港の家)
island |= blob(122, 66, 72, wobble=0.18)      # 北の土台
island &= ~blob(88, 224, 26, wobble=0.35)     # 母港の湾
island &= ~blob(242, 112, 30, wobble=0.3)     # 北東の入り江(広大な漁場側)
island &= ~blob(150, 236, 18, wobble=0.35)    # 南の入り江(母港と新漁港の間)
# 枠は直線で切らない: ノイズ入りの海マージン(14〜26タイル)で有機的に沈める
border = np.minimum.reduce([xx, yy, (N-1) - xx, (N-1) - yy]).astype(float)
island &= border > (15 + (fbm(404) + 1) * 6)

terrain = np.full((N, N), SEA, dtype=np.int16)
terrain[island] = GRASS  # islandはこの後の北の潟の切除で更新される

# ── 2. 山塊（通行不可）──
mountains = np.zeros((N, N), bool)
def dilate0(mask, n=1):
    out = mask.copy()
    for _ in range(n):
        out = out | np.roll(out, 1, 0) | np.roll(out, -1, 0) | np.roll(out, 1, 1) | np.roll(out, -1, 1)
    return out
# 北は海際の稜線だけ(内側は広大な盆地に明け渡す)。稜線は海岸から8タイル幅
north_rim = island & dilate0(~island, 10) & (yy < 74)
mountains |= north_rim
# 北の潟(わずかな海): 稜線を切って海を招き入れる
lagoon = blob(148, 22, 10, wobble=0.25) | blob(142, 30, 7, wobble=0.2)
island_cut = lagoon
# 中央盆地と北の大盆地を分ける丘陵(2つの広い口を開ける)
hill_line = np.zeros((N, N), bool)
for cx, cy, r in [(58, 82, 11), (74, 84, 11), (90, 86, 10),
                  (128, 80, 9), (142, 78, 9),
                  (172, 80, 10), (188, 78, 10), (202, 76, 11), (216, 72, 10)]:
    hill_line |= blob(cx, cy, r, wobble=0.25)
mountains |= hill_line          # 北への門: x≈110-124(西口) と x≈154-168(東口)の2つだけ
# 東の海岸山脈: 盆地と漁港を隔てる(v1のまま)
for cx, cy, r in [(182, 106, 13), (188, 124, 13), (192, 142, 12), (194, 158, 11)]:
    mountains |= blob(cx, cy, r, wobble=0.25)
# 西の山地(山間鉱山の新しい家): ポケットを抱く峠ロックの小山塊
for cx, cy, r in [(48, 124, 15), (62, 112, 13), (66, 138, 13), (50, 150, 12)]:
    mountains |= blob(cx, cy, r, wobble=0.15)
pocket = blob(54, 132, 9, wobble=0.15)
mountains &= ~pocket
# 峠(山を貫く回廊が唯一の道)
def corridor(x0, y0, x1, y1, width=4):
    steps = int(max(abs(x1-x0), abs(y1-y0))) * 2 + 1
    mask = np.zeros((N, N), bool)
    for t in np.linspace(0, 1, steps):
        cx, cy = x0 + (x1-x0)*t, y0 + (y1-y0)*t
        w = width * (1 + 0.35*np.sin(t*9))
        mask |= (np.hypot(xx-cx, yy-cy) < w)
    return mask
passes = np.zeros((N, N), bool)
passes |= corridor(84, 142, 60, 136)      # P1: 平野→西の鉱山
passes |= corridor(178, 138, 200, 136)    # P2: 盆地→東海岸(後半漁場への近道)
mountains &= ~passes
island &= ~island_cut
mountains &= island
terrain[mountains] = MOUNTAIN

# ── 3. 肥沃度(畑適地) ──
fert1 = blob(134, 102, 28, wobble=0.2) & island & ~mountains             # 中央盆地(母港から遠ざけた)
fert2core = blob(134, 102, 14, wobble=0.2) & fert1
north_basin = (blob(130, 46, 44, wobble=0.2) | blob(90, 50, 24, wobble=0.25) | blob(180, 50, 22, wobble=0.25))
north_basin &= island & ~mountains & (yy < 70 + (fbm(505) + 1) * 7)  # 南縁は直線にしない
fert2north = blob(126, 44, 20, wobble=0.25) & north_basin                # 北のコアは中央より広い
fert_sw = blob(66, 176, 10, wobble=0.18) & island & ~mountains           # 第二の盆地(近いが狭い)
fert_port = blob(100, 192, 6, wobble=0.2) & island & ~mountains          # 母港のわずかな畑(人口150の上限の根拠)
terrain[fert1 | fert_sw | north_basin | fert_port] = FERT1
terrain[fert2core | fert2north] = FERT2
# ── 4. 森(燃料と木材・前線が動く場) ──
forest = np.zeros((N, N), bool)
for cx, cy, r in [(96, 158, 15), (140, 170, 14), (78, 140, 11),          # 盆地の南縁の帯
                  (100, 214, 5), (82, 200, 5),                            # 母港のすぐ側の小さな森(約3年で尽きる較正)
                  (86, 108, 10), (150, 110, 9), (208, 116, 9),           # 丘陵の裾
                  (108, 42, 8), (166, 40, 7)]:                             # 北の少しの木
    forest |= blob(cx, cy, r, wobble=0.2)
forest &= island & ~mountains & ~fert2core & ~fert2north & ~pocket
forest &= ~(blob(134, 102, 20, wobble=0.15))
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

# 西の山間鉱山(主鉱床: 鉄+石炭+石材が揃う・峠P1ロック)
deposit(ORE, 50, 126, 10, 40)
deposit(COAL, 60, 140, 10, 40)
deposit(ROCKDEP, 46, 144, 10, 30)
# 北の大盆地の少しの鉱床(終盤開発の種)
deposit(ORE, 74, 46, 9, 14)
deposit(COAL, 196, 54, 9, 14)
# 盆地の南の岩場(採石のみ)
deposit(ROCKDEP, 148, 186, 8, 10)

# ── 7. 漁場(海側に豊かさとして描く) ──
fish_rich = np.zeros((N, N), bool)
fish_mid = np.zeros((N, N), bool)
sea_ok = ~island
# 後半用の広大な漁場: 東〜北東の沖を一続きの豊かな帯に
fish_rich |= (blob(238, 150, 22, wobble=0.3) | blob(246, 118, 24, wobble=0.3)
              | blob(240, 88, 20, wobble=0.3)) & sea_ok
fish_rich |= blob(204, 218, 13, wobble=0.3) & sea_ok     # 新漁港(南東)の沖: 6より大きく8より小さい
fish_mid  |= blob(88, 222, 8, wobble=0.3) & sea_ok        # 母港の湾内の小規模漁場(約3年で痩せる較正)
fish_mid  |= blob(148, 24, 8, wobble=0.3) & sea_ok        # 北の潟(終盤のわずかな海)

# ── 8. 市場と候補地 ──
MARKETS = {  # id: (x, y, 名前)
    1: (92, 206, '母港(枯渇するスターター)'),
    2: (134, 104, '中央盆地(農耕)'),
    3: (188, 200, '漁港(南東)'),
    4: (54, 132, '山間鉱山(西)'),
}
CANDIDATES = {
    5: (66, 176, '第二の盆地(近いが狭い)'),
    6: (97, 214, '母港の漁場(湾内・小・3年で痩せる)'),
    7: (128, 48, '北の大盆地(終盤の約束の土地)'),
    8: (226, 130, '東の大漁場(後半・広大)'),
    9: (146, 34, '北の潟(わずかな海)'),
}
PASSES = {'P1': (72, 139), 'P2': (188, 137)}

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
    blocked[max(0,py-11):py+11, max(0,px-11):px+11] = False
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
