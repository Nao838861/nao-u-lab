#!/usr/bin/env python3
"""
PotR001_descent.py — 地下に降りる (Ash, Phase 5 ローグライク最初の一本)

Phase 5 = 型から始める。
確立された型(ローグライク: 探索/戦闘/死/再挑戦)を主役にして、独自色は従属層に薄く置く。

方針:
- テキスト主役で頭で解く "pot テイスト" を避ける
  → 「見て動く」. 画面に世界が展開し、@を動かして敵と当たって階段に降りる
- 冒頭 1〜2 行だけ掴み (Nao_u 00:10: Zork 型の説明不足も pot テイストになりうる)
- フレーバーは従属 (モンスター名・アイテム説明の一行のみ). 詩は主役ではない

MVP 範囲 (これで "ちゃんとローグの形" と言えるライン):
- 60x18 のダンジョン, BSP で部屋+回廊, 階段 > で次階層
- 3 階層で勝利. 死ぬと終わり (permadeath)
- プレイヤー @ / HP / ATK / DEF
- 敵 3 種 (r ラット / g ゴブリン / s スケルトン)
- アイテム 3 種 (! ポーション / ) 剣 / [ 鎧)
- FOV: プレイヤー視界半径 6 の明順応で地形見え方が変わる
- 操作: hjkl/矢印/wasd 移動, . 足踏み, > 階段降, q 終了

プレイヤー自身で 5 回回す前に Nao_u には出さない (Log が宣言した縛りを流用).
"""

from __future__ import annotations

import os
import sys
import time
import random
import json
from datetime import datetime
from dataclasses import dataclass, field
from typing import List, Tuple, Optional


# ── リプレイログ (Nao_u 2026-04-17 18:39「ワンプレイごとに分割されたログ」対応) ──
# ゲームは seed と入力キー列で完全に決定的なので、それらを保存すれば再現できる。
class ReplayRec:
    def __init__(self, seed: int):
        self.t0 = time.time()
        self.seed = seed
        self.events: List[dict] = []

    def key(self, k: str):
        self.events.append({"t": round(time.time() - self.t0, 3), "type": "key", "k": k})

    def note(self, msg: str, **kw):
        self.events.append({"t": round(time.time() - self.t0, 3), "type": "note", "msg": msg, **kw})

    def save(self, result: dict) -> Optional[str]:
        try:
            logdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "playlogs")
            os.makedirs(logdir, exist_ok=True)
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            path = os.path.join(logdir, f"PotR001_descent_{ts}.jsonl")
            with open(path, "w", encoding="utf-8") as f:
                header = {
                    "game": "PotR001_descent",
                    "time": datetime.now().isoformat(),
                    "seed": self.seed,
                }
                header.update(result)
                f.write(json.dumps(header, ensure_ascii=False) + "\n")
                for e in self.events:
                    f.write(json.dumps(e, ensure_ascii=False) + "\n")
            return path
        except OSError:
            return None

# ── クロスプラットフォーム入力 ──
if os.name == "nt":
    import msvcrt

    def _setup(): pass
    def _teardown(): pass

    def getch() -> str:
        ch = msvcrt.getch()
        # 矢印キーは 0xe0 に続いて H/P/K/M
        if ch in (b"\x00", b"\xe0"):
            ch2 = msvcrt.getch()
            return {b"H": "UP", b"P": "DOWN", b"K": "LEFT", b"M": "RIGHT"}.get(ch2, "")
        try:
            return ch.decode("utf-8", errors="ignore")
        except Exception:
            return ""
else:
    import tty, termios
    _saved = None

    def _setup():
        global _saved
        _saved = termios.tcgetattr(sys.stdin)
        tty.setcbreak(sys.stdin.fileno())

    def _teardown():
        if _saved:
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, _saved)

    def getch() -> str:
        ch = sys.stdin.read(1)
        if ch == "\x1b":
            ch2 = sys.stdin.read(1)
            if ch2 == "[":
                ch3 = sys.stdin.read(1)
                return {"A": "UP", "B": "DOWN", "C": "RIGHT", "D": "LEFT"}.get(ch3, "")
        return ch

CLEAR = "\x1b[2J\x1b[H"
HIDE = "\x1b[?25l"
SHOW = "\x1b[?25h"

# ── マップ定数 ──
W, H = 60, 18
WALL, FLOOR, DOOR, STAIRS = "#", ".", "+", ">"

# ── データ ──
@dataclass
class Entity:
    x: int
    y: int
    glyph: str
    name: str
    hp: int
    atk: int
    defense: int = 0
    alive: bool = True

@dataclass
class Item:
    x: int
    y: int
    glyph: str
    name: str
    kind: str        # "heal" / "weapon" / "armor"
    power: int
    desc: str

@dataclass
class Room:
    x: int; y: int; w: int; h: int
    def center(self) -> Tuple[int, int]:
        return (self.x + self.w // 2, self.y + self.h // 2)
    def inner(self):
        for yy in range(self.y + 1, self.y + self.h - 1):
            for xx in range(self.x + 1, self.x + self.w - 1):
                yield xx, yy

# ── 生成 ──
def gen_map(rng: random.Random, depth: int):
    grid = [[WALL for _ in range(W)] for _ in range(H)]
    rooms: List[Room] = []
    attempts = 0
    while len(rooms) < 6 and attempts < 60:
        attempts += 1
        rw = rng.randint(4, 9)
        rh = rng.randint(3, 5)
        rx = rng.randint(1, W - rw - 2)
        ry = rng.randint(1, H - rh - 2)
        r = Room(rx, ry, rw, rh)
        if any(abs(r.x - o.x) < r.w + o.w and abs(r.y - o.y) < r.h + o.h for o in rooms if _overlap(r, o)):
            continue
        rooms.append(r)
        for x, y in r.inner():
            grid[y][x] = FLOOR
    # 回廊で接続
    for i in range(1, len(rooms)):
        ax, ay = rooms[i - 1].center()
        bx, by = rooms[i].center()
        if rng.random() < 0.5:
            _hcorr(grid, ax, bx, ay); _vcorr(grid, ay, by, bx)
        else:
            _vcorr(grid, ay, by, ax); _hcorr(grid, ax, bx, by)
    # 階段
    sx, sy = rooms[-1].center()
    grid[sy][sx] = STAIRS
    return grid, rooms

def _overlap(a: Room, b: Room) -> bool:
    return not (a.x + a.w <= b.x or b.x + b.w <= a.x or a.y + a.h <= b.y or b.y + b.h <= a.y)

def _hcorr(grid, x1, x2, y):
    for x in range(min(x1, x2), max(x1, x2) + 1):
        if grid[y][x] == WALL:
            grid[y][x] = FLOOR

def _vcorr(grid, y1, y2, x):
    for y in range(min(y1, y2), max(y1, y2) + 1):
        if grid[y][x] == WALL:
            grid[y][x] = FLOOR

# ── FOV (単純な影範囲: マンハッタン半径) ──
def compute_fov(grid, px, py, radius=6):
    vis = set()
    for y in range(max(0, py - radius), min(H, py + radius + 1)):
        for x in range(max(0, px - radius), min(W, px + radius + 1)):
            if abs(x - px) + abs(y - py) <= radius:
                # 単純な線形レイキャスト
                if _line_clear(grid, px, py, x, y):
                    vis.add((x, y))
    return vis

def _line_clear(grid, x0, y0, x1, y1) -> bool:
    dx, dy = abs(x1 - x0), abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx - dy
    cx, cy = x0, y0
    while (cx, cy) != (x1, y1):
        if (cx, cy) != (x0, y0) and grid[cy][cx] == WALL:
            return False
        e2 = 2 * err
        if e2 > -dy:
            err -= dy; cx += sx
        if e2 < dx:
            err += dx; cy += sy
    return True

# ── 初期配置 ──
MONSTERS = {
    # depth_min : (glyph, name, hp, atk)
    1: [("r", "ラット", 4, 2), ("b", "コウモリ", 3, 2)],
    2: [("g", "ゴブリン", 8, 3), ("r", "ラット", 4, 2)],
    3: [("s", "スケルトン", 12, 4), ("g", "ゴブリン", 8, 3)],
}

ITEM_POOL = [
    ("!", "治癒のポーション", "heal", 8, "ひと口で傷が閉じる."),
    (")", "鉄の短剣", "weapon", 2, "鈍い刃. それでも素手より早い."),
    ("[", "鎖かたびら", "armor", 1, "重いが矢を滑らせる."),
]

def spawn_entities(rng, rooms, depth):
    ents: List[Entity] = []
    items: List[Item] = []
    pool = MONSTERS[depth]
    for r in rooms[1:]:  # 最初の部屋はプレイヤー
        n_mon = rng.randint(1, 2)
        for _ in range(n_mon):
            glyph, name, hp, atk = rng.choice(pool)
            x, y = _rand_inside(rng, r)
            ents.append(Entity(x, y, glyph, name, hp, atk))
        if rng.random() < 0.5:
            glyph, name, kind, power, desc = rng.choice(ITEM_POOL)
            x, y = _rand_inside(rng, r)
            items.append(Item(x, y, glyph, name, kind, power, desc))
    return ents, items

def _rand_inside(rng, r: Room) -> Tuple[int, int]:
    return (rng.randint(r.x + 1, r.x + r.w - 2), rng.randint(r.y + 1, r.y + r.h - 2))

# ── ゲーム状態 ──
@dataclass
class State:
    grid: list
    player: Entity
    enemies: List[Entity]
    items: List[Item]
    rooms: List[Room]
    depth: int
    seen: set = field(default_factory=set)
    msgs: List[str] = field(default_factory=list)
    rng: random.Random = field(default_factory=random.Random)
    atk_bonus: int = 0
    def_bonus: int = 0

    def msg(self, s: str):
        self.msgs.append(s)
        if len(self.msgs) > 4:
            self.msgs = self.msgs[-4:]

def new_state(rng, depth=1, carry: Optional[Entity] = None) -> State:
    grid, rooms = gen_map(rng, depth)
    sx, sy = rooms[0].center()
    if carry:
        player = Entity(sx, sy, "@", carry.name, carry.hp, carry.atk, carry.defense)
    else:
        player = Entity(sx, sy, "@", "あなた", 20, 3, 0)
    ents, items = spawn_entities(rng, rooms, depth)
    st = State(grid, player, ents, items, rooms, depth, rng=rng)
    st.msg(f"—— 地下 {depth} 階 ——")
    return st

# ── 描画 ──
def render(st: State):
    vis = compute_fov(st.grid, st.player.x, st.player.y, radius=6)
    st.seen |= vis
    buf = [CLEAR]
    buf.append(f"地下 {st.depth}階  HP {st.player.hp:>2}  ATK {st.player.atk + st.atk_bonus}  DEF {st.player.defense + st.def_bonus}\n")
    for y in range(H):
        row = []
        for x in range(W):
            if (x, y) in vis:
                ch = st.grid[y][x]
                # entities / items
                for it in st.items:
                    if it.x == x and it.y == y:
                        ch = it.glyph; break
                for e in st.enemies:
                    if e.alive and e.x == x and e.y == y:
                        ch = e.glyph; break
                if st.player.x == x and st.player.y == y:
                    ch = "@"
                row.append(ch)
            elif (x, y) in st.seen:
                c = st.grid[y][x]
                row.append(c if c in (WALL, FLOOR, STAIRS) else ".")
            else:
                row.append(" ")
        buf.append("".join(row) + "\n")
    for m in st.msgs[-4:]:
        buf.append(m + "\n")
    buf.append("[hjkl/矢印/wasd 移動  . 待つ  > 階段  q 終了]\n")
    sys.stdout.write("".join(buf))
    sys.stdout.flush()

# ── 行動 ──
DIRS = {
    "h": (-1, 0), "j": (0, 1), "k": (0, -1), "l": (1, 0),
    "a": (-1, 0), "s": (0, 1), "w": (0, -1), "d": (1, 0),
    "LEFT": (-1, 0), "DOWN": (0, 1), "UP": (0, -1), "RIGHT": (1, 0),
}

def passable(grid, x, y) -> bool:
    if 0 <= x < W and 0 <= y < H:
        return grid[y][x] in (FLOOR, DOOR, STAIRS)
    return False

def enemy_at(st: State, x, y) -> Optional[Entity]:
    for e in st.enemies:
        if e.alive and e.x == x and e.y == y:
            return e
    return None

def item_at(st: State, x, y) -> Optional[Item]:
    for it in st.items:
        if it.x == x and it.y == y:
            return it
    return None

def attack(st: State, atk: Entity, dfn: Entity, atk_bonus=0, def_bonus=0):
    dmg = max(1, (atk.atk + atk_bonus) - (dfn.defense + def_bonus))
    dfn.hp -= dmg
    who_a = "あなた" if atk is st.player else atk.name
    who_d = "あなた" if dfn is st.player else dfn.name
    st.msg(f"{who_a} の攻撃. {who_d} に {dmg} ダメージ.")
    if dfn.hp <= 0:
        dfn.alive = False
        if dfn is not st.player:
            st.msg(f"{dfn.name} を倒した.")

def player_move(st: State, dx, dy) -> bool:
    nx, ny = st.player.x + dx, st.player.y + dy
    e = enemy_at(st, nx, ny)
    if e:
        attack(st, st.player, e, atk_bonus=st.atk_bonus)
        return True
    if not passable(st.grid, nx, ny):
        return False
    st.player.x, st.player.y = nx, ny
    it = item_at(st, nx, ny)
    if it:
        if it.kind == "heal":
            st.player.hp = min(20, st.player.hp + it.power)
            st.msg(f"{it.name}を飲んだ. HP+{it.power}. ({it.desc})")
        elif it.kind == "weapon":
            st.atk_bonus += it.power
            st.msg(f"{it.name}を拾った. ATK+{it.power}. ({it.desc})")
        elif it.kind == "armor":
            st.def_bonus += it.power
            st.msg(f"{it.name}を拾った. DEF+{it.power}. ({it.desc})")
        st.items.remove(it)
    return True

def enemy_turn(st: State):
    for e in st.enemies:
        if not e.alive:
            continue
        # プレイヤーを視界に入れたら近づく. 隣接なら殴る
        dx = st.player.x - e.x
        dy = st.player.y - e.y
        dist = abs(dx) + abs(dy)
        if dist == 1:
            attack(st, e, st.player, def_bonus=st.def_bonus)
            continue
        if dist > 6:
            continue
        # 視線が通るときだけ追う
        if not _line_clear(st.grid, e.x, e.y, st.player.x, st.player.y):
            continue
        step = (1 if dx > 0 else -1 if dx < 0 else 0,
                1 if dy > 0 else -1 if dy < 0 else 0)
        # 斜めを分解 — まず X, ダメなら Y
        for mv in ((step[0], 0), (0, step[1])):
            nx, ny = e.x + mv[0], e.y + mv[1]
            if passable(st.grid, nx, ny) and not enemy_at(st, nx, ny) and not (nx == st.player.x and ny == st.player.y):
                e.x, e.y = nx, ny
                break

# ── 開幕 & エンディング ──
INTRO = (
    "階段を降りた.\n"
    "石の床に, 赤黒い足跡が点々と奥へ続いていく.\n"
    "灯りはあなたの持つ松明だけ. 先を見通すことはできない.\n"
)

def intro(rng_seed: Optional[int]):
    sys.stdout.write(CLEAR)
    sys.stdout.write(INTRO)
    sys.stdout.write(f"\n[種子: {rng_seed}]  何かキーで開始 (q で終了).\n")
    sys.stdout.flush()
    c = getch()
    return c != "q"

def game_over(st: State, victory: bool, turns: int, rec: Optional["ReplayRec"] = None):
    sys.stdout.write(CLEAR)
    if victory:
        sys.stdout.write(f"地上に続く階段が見えた. 足跡はここで消えている.\n\n")
        sys.stdout.write(f"  地下 {st.depth}階 到達  {turns} ターン  HP {st.player.hp}\n\n")
    else:
        sys.stdout.write(f"\n視界が暗くなる. 松明が落ちる音.\n\n")
        sys.stdout.write(f"  地下 {st.depth}階で倒れた.  {turns} ターン.\n\n")
    if rec is not None:
        path = rec.save({
            "result": "victory" if victory else "defeat",
            "final_depth": st.depth,
            "final_hp": st.player.hp,
            "turns": turns,
        })
        if path:
            sys.stdout.write(f"  [リプレイログ: {os.path.relpath(path)}]\n\n")
    sys.stdout.write("[Enter で終了]\n")
    sys.stdout.flush()
    getch()

# ── メイン ──
def main():
    seed = int(time.time() * 1000) & 0xFFFFFFFF
    if len(sys.argv) > 1:
        try:
            seed = int(sys.argv[1])
        except ValueError:
            pass
    rng = random.Random(seed)
    rec = ReplayRec(seed)

    sys.stdout.write(HIDE)
    _setup()
    try:
        if not intro(seed):
            return
        st = new_state(rng, depth=1)
        turns = 0
        while True:
            render(st)
            c = getch()
            rec.key(c)
            if c == "q":
                rec.note("quit")
                break
            if c == ".":
                pass  # 待つ
            elif c == ">":
                if st.grid[st.player.y][st.player.x] == STAIRS:
                    if st.depth >= 3:
                        game_over(st, victory=True, turns=turns, rec=rec)
                        return
                    # 階層推進: プレイヤー状態(HP/ATK/DEF+bonus)を持ち越す
                    carry = Entity(
                        0, 0, "@", "あなた",
                        st.player.hp,
                        st.player.atk + st.atk_bonus,
                        st.player.defense + st.def_bonus,
                    )
                    new_depth = st.depth + 1
                    atk_b, def_b = st.atk_bonus, st.def_bonus
                    st = new_state(rng, depth=new_depth, carry=carry)
                    # bonus は装備で取得したもの. 持ち越し後は素の atk/def に畳み込んで 0 にしておく
                    st.atk_bonus = 0
                    st.def_bonus = 0
                    _ = (atk_b, def_b)
                    continue
                else:
                    st.msg("ここには階段が無い.")
                    continue
            elif c in DIRS:
                dx, dy = DIRS[c]
                if not player_move(st, dx, dy):
                    continue
            else:
                continue

            turns += 1
            if not st.player.alive or st.player.hp <= 0:
                render(st)
                game_over(st, victory=False, turns=turns, rec=rec)
                return
            enemy_turn(st)
            if not st.player.alive or st.player.hp <= 0:
                render(st)
                game_over(st, victory=False, turns=turns, rec=rec)
                return
    finally:
        _teardown()
        sys.stdout.write(SHOW)
        sys.stdout.flush()

if __name__ == "__main__":
    main()
