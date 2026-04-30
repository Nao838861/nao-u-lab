"""sokoban_ash v01 — Sokoban クローン + 独自要素1個（手数制限による外部時計化）

着手前ゲート（Q-A/B/C） — devlog.md 冒頭参照
独自要素: 候補A（手数制限。M-30 の事前外部化）
"""
import pyxel

TILE = 8
W, H = 16, 16  # 128x128

# 記号: # 壁  . ゴール  $ 箱  @ プレイヤー  (空白 = 床)
LEVELS = [
    [
        "################",
        "#              #",
        "#              #",
        "#              #",
        "#  .   $@      #",
        "#              #",
        "#              #",
        "################",
    ],
]
MOVE_LIMIT = 6  # 最短4手（box距離4マス）のレベルに対し試行錯誤2手の余裕


class App:
    def __init__(self):
        pyxel.init(W * TILE, H * TILE, title="sokoban_ash v01", fps=30)
        self.load(0)
        pyxel.run(self.update, self.draw)

    def load(self, idx):
        rows = LEVELS[idx]
        self.walls = set()
        self.goals = set()
        self.boxes = set()
        self.player = (0, 0)
        for y, row in enumerate(rows):
            for x, c in enumerate(row):
                if c == "#":
                    self.walls.add((x, y))
                elif c == ".":
                    self.goals.add((x, y))
                elif c == "$":
                    self.boxes.add((x, y))
                elif c == "@":
                    self.player = (x, y)
        self.moves = 0
        self.cleared = False
        self.failed = False

    def try_move(self, dx, dy):
        if self.cleared or self.failed:
            return
        px, py = self.player
        nx, ny = px + dx, py + dy
        if (nx, ny) in self.walls:
            return
        if (nx, ny) in self.boxes:
            bx, by = nx + dx, ny + dy
            if (bx, by) in self.walls or (bx, by) in self.boxes:
                return
            self.boxes.discard((nx, ny))
            self.boxes.add((bx, by))
        self.player = (nx, ny)
        self.moves += 1
        if self.boxes == self.goals:
            self.cleared = True
        elif self.moves >= MOVE_LIMIT:
            self.failed = True

    def update(self):
        if pyxel.btnp(pyxel.KEY_R):
            self.load(0)
            return
        if pyxel.btnp(pyxel.KEY_LEFT):
            self.try_move(-1, 0)
        elif pyxel.btnp(pyxel.KEY_RIGHT):
            self.try_move(1, 0)
        elif pyxel.btnp(pyxel.KEY_UP):
            self.try_move(0, -1)
        elif pyxel.btnp(pyxel.KEY_DOWN):
            self.try_move(0, 1)
        if pyxel.btnp(pyxel.KEY_Q):
            pyxel.quit()

    def draw(self):
        pyxel.cls(0)
        for (x, y) in self.walls:
            pyxel.rect(x * TILE, y * TILE, TILE, TILE, 5)
        for (x, y) in self.goals:
            pyxel.rectb(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2, 10)
        for (x, y) in self.boxes:
            color = 11 if (x, y) in self.goals else 9
            pyxel.rect(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2, color)
        px, py = self.player
        pyxel.circ(px * TILE + TILE // 2, py * TILE + TILE // 2, TILE // 2 - 1, 7)
        pyxel.text(2, 2, f"MOVES {self.moves}/{MOVE_LIMIT}", 7)
        if self.cleared:
            pyxel.text(40, 60, "CLEAR! R=reset", 11)
        elif self.failed:
            pyxel.text(36, 60, "OVER MOVES R=reset", 8)


App()
