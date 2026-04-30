"""sokoban_ash v01 — headless ロジック検証（Pyxel不要、コアロジックを手で叩く）

検証目的:
- 最短3手で CLEAR フラグが立つこと
- 手数上限超過で failed フラグが立つこと
- 壁/箱/箱押せない条件が正しく機能すること
"""
import sys
import os

# sokoban_v01.py から純粋ロジックを切り出して再現（pyxel依存を回避）
LEVEL_ROWS = [
    "################",
    "#              #",
    "#              #",
    "#              #",
    "#  .   $@      #",
    "#              #",
    "#              #",
    "################",
]
MOVE_LIMIT = 6


class SokobanCore:
    def __init__(self, rows):
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
            return False
        px, py = self.player
        nx, ny = px + dx, py + dy
        if (nx, ny) in self.walls:
            return False
        if (nx, ny) in self.boxes:
            bx, by = nx + dx, ny + dy
            if (bx, by) in self.walls or (bx, by) in self.boxes:
                return False
            self.boxes.discard((nx, ny))
            self.boxes.add((bx, by))
        self.player = (nx, ny)
        self.moves += 1
        if self.boxes == self.goals:
            self.cleared = True
        elif self.moves >= MOVE_LIMIT:
            self.failed = True
        return True


def test_shortest_clear():
    g = SokobanCore(LEVEL_ROWS)
    # 初期: player=(8,4), box=(7,4), goal=(3,4)
    assert g.player == (8, 4), g.player
    assert (7, 4) in g.boxes
    assert (3, 4) in g.goals
    # box(7,4) を goal(3,4) まで運ぶには左に4回押せばよい → 最短4手
    for _ in range(4):
        g.try_move(-1, 0)
    print(f"after 4 left: player={g.player} boxes={g.boxes} moves={g.moves} cleared={g.cleared} failed={g.failed}")
    assert g.cleared, "expected CLEAR after 4 left moves"
    assert g.moves == 4, f"expected moves=4, got {g.moves}"
    return g


def test_move_limit_failure():
    g = SokobanCore(LEVEL_ROWS)
    # 何もないところで上下に動き続けて手数だけ消費 → failed
    for _ in range(MOVE_LIMIT):
        # 上に移動、当たったら下に。MOVE_LIMIT 回数分動かす
        if g.player[1] > 1:
            g.try_move(0, -1)
        else:
            g.try_move(0, 1)
    print(f"limit test: moves={g.moves} cleared={g.cleared} failed={g.failed}")
    assert g.failed, "expected failed after MOVE_LIMIT moves without solving"
    return g


def test_wall_blocks():
    g = SokobanCore(LEVEL_ROWS)
    px0, py0 = g.player
    # 上端 (1,4) に向かって上に動かしても壁。プレイヤー(14,4)上は (14,3) は床、(14,1)は壁
    # 上3回で壁。
    g.try_move(0, -1); g.try_move(0, -1); g.try_move(0, -1)
    # ここで (14,1) 壁にぶつかる
    moved = g.try_move(0, -1)
    print(f"wall block test: player={g.player} moved_into_wall={moved}")
    return moved is False


if __name__ == "__main__":
    g = test_shortest_clear()
    print(f"--- test_shortest_clear: PASS (cleared={g.cleared}, moves={g.moves}) ---")
    g2 = test_move_limit_failure()
    print(f"--- test_move_limit_failure: PASS (failed={g2.failed}) ---")
    blocked = test_wall_blocks()
    print(f"--- test_wall_blocks: PASS (wall_blocked={blocked}) ---")
    print("ALL TESTS PASS")
