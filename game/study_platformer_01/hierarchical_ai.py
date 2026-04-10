"""Hierarchical AI Player — Goal / Plan / Action layered architecture.

Three layers:
  1. GOAL  (strategy): "max_coins" / "speedrun" / "no_skip" / ...
     Picks one strategy that biases plan scoring.
  2. PLAN  (tactics): Each frame, candidate plans are generated from the
     current state. Each plan has score(state, goal) -> float.
     The highest-scoring plan becomes the active plan.
  3. ACTION (execution): The active plan converts state -> input dict.

Plans are short-lived. They are re-evaluated every frame (cheap), but
once a plan is "committed" (e.g. mid-jump), it stays active until done.

Run:
  python hierarchical_ai.py            # default goal: max_coins
  python hierarchical_ai.py speedrun
"""

import json
import os
import sys
from api import MarioAPI
from tilemap import Tilemap, SOLID_TILES
from core import ONE


# ===================================================================
# State observation helpers — read game state, no level knowledge
# ===================================================================

HITTABLE = frozenset('?Qcms T'.replace(' ', ''))
COIN_BLOCKS = frozenset('?cT')
ITEM_BLOCKS = frozenset('Qm')


def observe_terrain(tm, mario_x, mario_y):
    """Scan tiles ahead of Mario. Returns dict of features."""
    col = int(mario_x) // 16
    mario_row = int(mario_y) // 16
    offset = int(mario_x) % 16

    pits = []       # [(distance, width)]
    walls = []      # [(distance, height)]
    blocks = []     # [(distance, col, row, char)] for hittable blocks ABOVE
    flag = None     # (distance, col)

    # Forward scan up to 20 tiles
    in_pit = False
    pit_start_dc = None
    SCAN_DC = 20

    for dc in range(0, SCAN_DC):
        c = col + dc
        if c < 0 or c >= tm.cols:
            continue
        dist = dc * 16 - offset

        # Bottom row check (pit detection)
        bottom_solid = False
        for r in range(tm.rows - 2, tm.rows):
            if r < tm.rows and tm.tiles[r][c] in SOLID_TILES:
                bottom_solid = True
                break

        if not bottom_solid:
            if not in_pit:
                in_pit = True
                pit_start_dc = dc
        elif in_pit:
            in_pit = False
            width = (dc - pit_start_dc) * 16
            pits.append((pit_start_dc * 16 - offset, width))

        # Wall: solid tile at body height (row mario_row or above ground)
        if dc > 0:
            h = 0
            for row in range(tm.rows - 3, -1, -1):
                if 0 <= row < tm.rows and tm.tiles[row][c] in SOLID_TILES:
                    h = (tm.rows - 2) - row
                else:
                    break
            if h > 0 and (tm.rows - 2 - h) <= mario_row + 1:
                walls.append((dist, h))

        # Hittable blocks above Mario (within jump reach: 4 rows up)
        for row in range(max(0, mario_row - 4), mario_row):
            ch = tm.tiles[row][c]
            if ch in HITTABLE:
                blocks.append((dist, c, row, ch))

        # Goal flag
        if tm.tiles[max(0, mario_row - 2)][c] == 'P' or \
           (mario_row < tm.rows and tm.tiles[mario_row][c] == 'P'):
            if flag is None:
                flag = (dist, c)

    # Flush open pit at edge of scan
    if in_pit:
        width = (SCAN_DC - pit_start_dc) * 16
        pits.append((pit_start_dc * 16 - offset, width))

    return {
        'pits': pits,
        'walls': walls,
        'blocks': blocks,
        'flag': flag,
    }


def observe_enemies(state):
    """Return list of enemies ahead. Each: dict with x, dx, kind, threat."""
    mx = state['x']
    enemies = []

    for g in state.get('goombas', []):
        if g['alive'] and not g.get('squished'):
            dx = g['x'] - mx
            if -32 < dx < 200:
                enemies.append({'x': g['x'], 'dx': dx, 'kind': 'goomba'})

    for k in state.get('koopas', []):
        if k['alive']:
            dx = k['x'] - mx
            if -32 < dx < 200:
                kind = 'shell' if k['state'] != 0 else 'koopa'
                enemies.append({'x': k['x'], 'dx': dx, 'kind': kind})

    enemies.sort(key=lambda e: abs(e['dx']))
    return enemies


class CoinTargetTracker:
    """Pre-scans all hittable blocks in the level and tracks collection."""

    def __init__(self, tm):
        self.tm = tm
        self.targets = []
        ground_row = tm.rows - 2
        for r in range(tm.rows):
            for c in range(tm.cols):
                ch = tm.tiles[r][c]
                if ch in HITTABLE:
                    self.targets.append({
                        'col': c, 'row': r, 'char': ch,
                        'x': c * 16,
                        'ground_reachable': (ground_row - r) <= 6,
                    })
        self.targets.sort(key=lambda t: t['x'])

    def next_ground_targets(self, mario_x, ahead=3):
        """Return up to `ahead` unhit ground-reachable targets ahead."""
        result = []
        for t in self.targets:
            if len(result) >= ahead:
                break
            if t['x'] < mario_x - 32:
                continue
            if not t['ground_reachable']:
                continue
            if self.tm.tiles[t['row']][t['col']] not in HITTABLE:
                continue
            result.append(t)
        return result


def observe_mushrooms(game):
    """Return list of mushroom positions (x, y, dx). Reads game internals."""
    mx = game.x / ONE
    my = game.y / ONE
    out = []
    for m in game.mushrooms:
        if not m.alive or m.emerging:
            continue
        dx = m.x / ONE - mx
        dy = m.y / ONE - my
        out.append({'x': m.x / ONE, 'y': m.y / ONE, 'dx': dx, 'dy': dy})
    return out


# ===================================================================
# PLAN base class
# ===================================================================

class Plan:
    """Base class for all plans.

    Lifecycle:
      __init__ → score() → activate() → step() (each frame) → done?
    """
    name = 'plan'
    base_score = 0.0  # Default priority (higher = preferred)

    def __init__(self):
        self.committed = False  # Once True, stay active until done
        self.timer = 0

    def score(self, ctx):
        """Return priority score given context. Override."""
        return self.base_score

    def step(self, ctx):
        """Return input dict {left, right, a, b}. Override."""
        return {'left': False, 'right': True, 'a': False, 'b': True}

    @property
    def done(self):
        return False


# ===================================================================
# Concrete plans
# ===================================================================

class AdvancePlan(Plan):
    """Default plan: keep moving right with dash."""
    name = 'advance'
    base_score = 1.0

    def score(self, ctx):
        return 1.0  # Always available, low priority

    def step(self, ctx):
        return {'left': False, 'right': True, 'a': False, 'b': True}


class CrossPitPlan(Plan):
    """Jump over a specific pit. Tracks the absolute pit X position."""
    name = 'cross_pit'

    def __init__(self, pit_dist, pit_width, mario_x):
        super().__init__()
        self.pit_dist = pit_dist
        self.pit_width = pit_width
        # Lock in the absolute pit position
        self.pit_left_x = mario_x + pit_dist
        self.pit_right_x = self.pit_left_x + pit_width
        self.jump_hold = 0
        self._done = False

    def score(self, ctx):
        mx = ctx['state']['x']
        rel_dist = self.pit_left_x - mx
        # React early — give time to commit to the jump
        if rel_dist > 90 or rel_dist < -8:
            return 0
        if rel_dist <= 16:
            return 200  # Emergency
        # Higher score = more committed
        return 90 - rel_dist * 0.3

    def step(self, ctx):
        if not self.committed:
            self.committed = True
            self.jump_hold = 22
        self.timer += 1
        mx = ctx['state']['x']
        # Done when we land back on ground (whether successful or not)
        if ctx['state']['on_ground'] and self.timer > 5:
            self._done = True
        # First frame: release A so the next plan can re-trigger jump
        if self.timer == 1:
            return {'left': False, 'right': True, 'a': False, 'b': True}
        if self.timer <= self.jump_hold + 1:
            return {'left': False, 'right': True, 'a': True, 'b': True}
        return {'left': False, 'right': True, 'a': False, 'b': True}

    @property
    def done(self):
        return self._done


class ClimbWallPlan(Plan):
    """Jump over a specific wall (pipe/short wall)."""
    name = 'climb_wall'

    def __init__(self, wall_dist, wall_height):
        super().__init__()
        self.wall_dist = wall_dist
        self.wall_height = wall_height
        self.jump_hold = 0
        self._done = False

    def score(self, ctx):
        if self.wall_height >= 3:
            if 8 <= self.wall_dist <= 50:
                return 60 - self.wall_dist * 0.3
        else:
            if 4 <= self.wall_dist <= 20:
                return 50 - self.wall_dist * 0.5
        return 0

    def step(self, ctx):
        if not self.committed:
            self.committed = True
            self.jump_hold = 22 if self.wall_height >= 4 else (18 if self.wall_height >= 3 else 12)
        self.timer += 1
        if self.timer > 5 and ctx['state']['on_ground']:
            self._done = True
        if self.timer == 1:
            return {'left': False, 'right': True, 'a': False, 'b': True}
        if self.timer <= self.jump_hold:
            return {'left': False, 'right': True, 'a': True, 'b': True}
        return {'left': False, 'right': True, 'a': False, 'b': True}

    @property
    def done(self):
        return getattr(self, '_done', False) or (self.committed and self.timer > 30)


class StompEnemyPlan(Plan):
    """Jump on a specific enemy."""
    name = 'stomp'

    def __init__(self, enemy, mario_x):
        super().__init__()
        self.enemy_x = enemy['x']  # absolute position snapshot
        self.kind = enemy['kind']
        self.jump_hold = 0
        self._done = False

    def score(self, ctx):
        mx = ctx['state']['x']
        rel = self.enemy_x - mx
        if rel < -8 or rel > 70:
            return 0
        vx = abs(ctx['state']['vx'])
        # Earlier reaction at higher speed
        ideal = 30 + vx * 8
        if rel <= ideal + 10:
            # In range — score peaks near ideal
            return max(80 - abs(rel - ideal) * 1.5, 50)
        return 0

    def step(self, ctx):
        if not self.committed:
            self.committed = True
            self.jump_hold = 14
        self.timer += 1
        if self.timer > 5 and ctx['state']['on_ground']:
            self._done = True
        if self.timer == 1:
            return {'left': False, 'right': True, 'a': False, 'b': True}
        if self.timer <= self.jump_hold:
            return {'left': False, 'right': True, 'a': True, 'b': True}
        return {'left': False, 'right': True, 'a': False, 'b': True}

    @property
    def done(self):
        return self._done


class HitBlockPlan(Plan):
    """Jump under a specific block to break/collect it.

    Two modes:
      normal     — original reactive (narrow window, dash through)
      aggressive — walk approach, speed-adaptive trigger, fewer suppressions
    """
    name = 'hit_block'

    def __init__(self, block, gives_item):
        super().__init__()
        self.dist = block[0]
        self.col = block[1]
        self.row = block[2]
        self.char = block[3]
        self.gives_item = gives_item
        self._done = False
        self.aggressive = False  # Set True by generate_plans in max_coins

    def score(self, ctx):
        cdist = self.col * 16 - ctx['state']['x']
        if cdist < -8:
            return 0

        # Block already hit?
        tm = ctx['game'].tilemap
        if tm.tiles[self.row][self.col] not in HITTABLE:
            return 0

        if self.aggressive:
            # Speed-adaptive trigger: at dash 2.5px/f, head reaches row-9
            # at ~frame 10. head_x = start_x + vx*10 + 9.
            # So ideal cdist = vx*10 + 9 + margin.
            vx = max(abs(ctx['state']['vx']), 1.0)
            max_cdist = vx * 10 + 17  # +9 head offset + 8 margin
            if cdist > max_cdist:
                return 0
            # Wall BETWEEN Mario and block → yield to climb
            for wd, wh in ctx['terrain']['walls']:
                if 0 < wd < cdist - 5 and wh >= 2:
                    return 0
        else:
            if cdist > 16:
                return 0
            for wd, wh in ctx['terrain']['walls']:
                if 0 < wd < 48 and wh >= 2:
                    return 0
            if self.char not in ITEM_BLOCKS:
                for e in ctx['enemies']:
                    if 0 < e['dx'] < max(cdist, 16) and e['kind'] in ('goomba', 'koopa', 'shell'):
                        return 0

        if self.char in ITEM_BLOCKS and not ctx['state'].get('is_super', False):
            return 80
        if self.char in COIN_BLOCKS:
            return 30
        return 0

    def step(self, ctx):
        if not self.committed:
            self.committed = True
        self.timer += 1
        if self.timer > 5 and ctx['state']['on_ground']:
            self._done = True
        if self.timer == 1:
            return {'left': False, 'right': True, 'a': False, 'b': True}
        if self.timer <= 18:
            return {'left': False, 'right': True, 'a': True, 'b': True}
        return {'left': False, 'right': True, 'a': False, 'b': True}

    @property
    def done(self):
        return self._done


class CollectMushroomPlan(Plan):
    """Move toward a mushroom item to collect it."""
    name = 'collect_mushroom'

    def __init__(self, mushroom):
        super().__init__()
        self.mush = mushroom  # snapshot

    def score(self, ctx):
        if ctx['state'].get('is_super', False):
            return 0  # Already super
        dist = abs(self.mush['dx'])
        if dist < 80:
            return 90 - dist * 0.5
        return 0

    def step(self, ctx):
        self.committed = True
        self.timer += 1
        # Re-read mushroom position from game (it moves)
        game = ctx['game']
        mx = ctx['state']['x']
        target_dx = 999
        target_dy = 0
        for m in game.mushrooms:
            if m.alive and not m.emerging:
                dx = m.x / ONE - mx
                if abs(dx) < abs(target_dx):
                    target_dx = dx
                    target_dy = m.y / ONE - ctx['state']['y']
        if target_dx == 999:
            self.timer = 100
            return {'left': False, 'right': True, 'a': False, 'b': True}
        if target_dx < -8:
            return {'left': True, 'right': False, 'a': False, 'b': False}
        if target_dy < -8 and abs(target_dx) < 24:
            return {'left': False, 'right': True, 'a': True, 'b': True}
        return {'left': False, 'right': True, 'a': False, 'b': True}

    @property
    def done(self):
        # Done when mushroom is gone or after timeout
        return self.timer > 60


# ===================================================================
# GOAL — strategy that biases plan scoring
# ===================================================================

class Goal:
    """Strategy: weights plans according to long-term objective."""

    def __init__(self, name='max_coins'):
        self.name = name

    def weight(self, plan):
        """Return multiplier for this plan's score."""
        if self.name == 'max_coins':
            if isinstance(plan, HitBlockPlan):
                return 2.0  # Strongly prefer hitting blocks
            if isinstance(plan, CollectMushroomPlan):
                return 1.5
            return 1.0
        elif self.name == 'speedrun':
            if isinstance(plan, HitBlockPlan):
                return 0.3  # Skip blocks
            if isinstance(plan, CollectMushroomPlan):
                return 0.5
            return 1.0
        elif self.name == 'no_skip':
            if isinstance(plan, StompEnemyPlan):
                return 2.0
            return 1.0
        return 1.0


# ===================================================================
# Plan generation + selection
# ===================================================================

def generate_plans(ctx, coin_tracker=None):
    """Generate all candidate plans from the current state."""
    state = ctx['state']
    terrain = ctx['terrain']
    enemies = ctx['enemies']
    mushrooms = ctx['mushrooms']

    plans = [AdvancePlan()]  # Always available

    mario_x = state['x']
    # Pits
    for dist, width in terrain['pits']:
        plans.append(CrossPitPlan(dist, width, mario_x))

    # Walls — generate for walls CLOSER than the nearest pit
    # (must climb wall before reaching the pit), or when pit is far
    nearest_pit_dist = min(
        (max(d, 0) for d, _ in terrain['pits']), default=999)
    for dist, height in terrain['walls']:
        if dist < nearest_pit_dist or nearest_pit_dist > 100:
            plans.append(ClimbWallPlan(dist, height))

    # Hittable blocks (only generate from ground — mid-air detection hits unreachable blocks)
    if state['on_ground']:
        if coin_tracker:
            # Pre-scanned targets (max_coins aggressive mode)
            for t in coin_tracker.next_ground_targets(mario_x, ahead=3):
                block = (t['x'] - mario_x, t['col'], t['row'], t['char'])
                plan = HitBlockPlan(block, t['char'] in ITEM_BLOCKS)
                plan.aggressive = True
                plans.append(plan)
        else:
            for block in terrain['blocks']:
                gives_item = block[3] in ITEM_BLOCKS
                plans.append(HitBlockPlan(block, gives_item))

    # Enemies (stomp candidates)
    for e in enemies:
        if e['dx'] > 0 and e['kind'] in ('goomba', 'koopa'):
            plans.append(StompEnemyPlan(e, mario_x))

    # Mushrooms
    for m in mushrooms:
        plans.append(CollectMushroomPlan(m))

    return plans


def select_plan(plans, ctx, goal):
    """Score all plans and pick the highest."""
    best = None
    best_score = -1
    for p in plans:
        s = p.score(ctx) * goal.weight(p)
        if s > best_score:
            best_score = s
            best = p
    return best, best_score


# ===================================================================
# Main loop
# ===================================================================

def run(level_path='assets/level_1_1.txt', goal_name='max_coins',
        max_cycles=3, max_frames=5000):
    if not os.path.exists(level_path):
        level_path = 'level_1_1.txt'

    log_dir = os.path.join(os.path.dirname(__file__), 'logs', 'hierarchical_ai')
    os.makedirs(log_dir, exist_ok=True)

    goal = Goal(goal_name)
    api = MarioAPI(level_path)

    print(f'=== Hierarchical AI ===')
    print(f'Goal: {goal_name}')
    print(f'Level: {level_path} ({api._tm.cols}x{api._tm.rows})')
    print()

    best_x = 0
    for cycle in range(1, max_cycles + 1):
        state = api.reset()
        tm = api._tm  # Fresh tilemap after reset
        active_plan = None
        plan_history = {}  # name -> count

        # Pre-scan blocks for max_coins mode
        coin_tracker = CoinTargetTracker(tm) if goal_name == 'max_coins' else None

        # Stuck detection: if Mario doesn't advance 16px in 120 frames, force a dash-jump
        stuck_check_x = 0
        stuck_check_frame = 0
        stuck_escape = 0  # >0 = frames of escape dash-jump remaining

        while not api.done and state['frame'] < max_frames:
            game = api._game
            terrain = observe_terrain(tm, state['x'], state['y'])
            enemies = observe_enemies(state)
            mushrooms = observe_mushrooms(game)

            ctx = {
                'state': state,
                'game': game,
                'terrain': terrain,
                'enemies': enemies,
                'mushrooms': mushrooms,
            }

            # Stuck escape: back up far → full dash-jump to clear walls
            if stuck_escape > 0:
                stuck_escape -= 1
                if stuck_escape > 40:
                    # Phase 1: back up 10 frames (~30px left)
                    inp = {'left': True, 'right': False, 'a': False, 'b': True}
                elif stuck_escape > 38:
                    # Phase 2: turn around 2 frames
                    inp = {'left': False, 'right': True, 'a': False, 'b': True}
                elif stuck_escape > 15:
                    # Phase 3: full dash-jump (23 frames of A hold)
                    inp = {'left': False, 'right': True, 'a': True, 'b': True}
                else:
                    # Phase 4: coast
                    inp = {'left': False, 'right': True, 'a': False, 'b': True}
                state = api.step(**inp)
                if stuck_escape == 0:
                    active_plan = None
                continue

            # Stuck detection: <16px progress in 100 frames (faster reaction)
            if state['frame'] - stuck_check_frame >= 100:
                if state['x'] - stuck_check_x < 16:
                    stuck_escape = 50
                stuck_check_x = state['x']
                stuck_check_frame = state['frame']

            # If active plan is committed and not done, keep using it
            if active_plan is None or active_plan.done or not active_plan.committed:
                plans = generate_plans(ctx, coin_tracker=coin_tracker)
                active_plan, _ = select_plan(plans, ctx, goal)
                plan_history[active_plan.name] = plan_history.get(active_plan.name, 0) + 1

            inp = active_plan.step(ctx)
            state = api.step(**inp)

        result = ('CLEAR' if state['cleared']
                  else 'DEAD' if state['dead']
                  else 'TIMEOUT')
        print(f'Cycle {cycle}: {result} x={state["x"]:.0f} '
              f'frame={state["frame"]} coins={state.get("coins", 0)} '
              f'super={state.get("is_super", False)}')
        print(f'  Plan usage: {plan_history}')

        if state['x'] > best_x:
            best_x = state['x']

        if state['cleared']:
            log_path = os.path.join(log_dir, f'clear_{goal_name}.json')
            api.save_log(log_path)
            print(f'  Log: {log_path}')
            print(f'  Replay: python play.py --replay {log_path}')
            return True

    print(f'\nFailed. Best x={best_x:.0f}')
    return False


# ===================================================================
# 4-Layer AI (Nao_u design 2026-04-10)
#
#  Layer 1  Grand strategy : collect every coin, then reach flag
#  Layer 2  Mid strategy   : pick best visible block to target
#  Layer 3  Tactics        : move below target → stop → jump straight up
#  Layer 4  Reflex         : override on imminent pit / enemy danger
#
# Design constraint: use only information visible on the 256px screen.
# ===================================================================

SCREEN_W_PX = 256


def visible_blocks(tm, scroll_x):
    """Return hittable blocks currently on screen."""
    left_col = max(0, int(scroll_x) // 16)
    right_col = min(tm.cols - 1, int(scroll_x + SCREEN_W_PX) // 16)
    blocks = []
    for c in range(left_col, right_col + 1):
        for r in range(tm.rows):
            ch = tm.tiles[r][c]
            if ch in HITTABLE:
                blocks.append((c, r, ch))
    return blocks


def find_platform_below(tm, target_col, ground_row):
    """Find a row of solid blocks that can serve as a platform under a high block.

    Returns (left_col, right_col, platform_row) or None.
    """
    platform_row = ground_row - 3  # Typically row 9 for ground at row 12
    if platform_row < 0 or platform_row >= tm.rows:
        return None
    platforms = []
    for pc in range(max(0, target_col - 5), min(tm.cols, target_col + 6)):
        if tm.tiles[platform_row][pc] in SOLID_TILES:
            platforms.append(pc)
    if not platforms:
        return None
    return (min(platforms), max(platforms), platform_row)


def pick_best_target(blocks, mx, my, tm=None):
    """Mid-strategy: pick the most reachable block on screen.

    Returns (target, platform_info).
    target: (col, row, char) or None.
    platform_info: (left_col, right_col, platform_row) or None.
    """
    mario_row = int(my) // 16
    ground_row = mario_row + 1  # Approximate ground row
    best = None
    best_score = -999
    best_platform = None

    for c, r, ch in blocks:
        block_x = c * 16
        dx = block_x - mx
        if dx < -20 or dx > 200:
            continue
        rows_above = mario_row - r
        if rows_above < 1:
            continue

        platform = None
        if rows_above <= 6:
            # Ground-reachable
            score = 200 - abs(dx)
        elif rows_above <= 10 and tm is not None:
            # Too high from ground — need to jump onto a platform first
            platform = find_platform_below(tm, c, ground_row)
            if platform is None:
                continue
            # Platform items (mushroom) get high priority: worth the detour
            score = (250 if ch in ITEM_BLOCKS else 160) - abs(dx)
        else:
            continue

        if ch in COIN_BLOCKS:
            score += 50
        elif ch in ITEM_BLOCKS:
            score += 80
        if score > best_score:
            best_score = score
            best = (c, r, ch)
            best_platform = platform
    return best, best_platform


class FourLayerAI:
    """4-layer architecture: Grand → Mid → Tactics → Reflex."""

    def __init__(self):
        self.target = None           # (col, row, char) or None
        self.platform = None         # (left_col, right_col, row) for high blocks
        self.phase = 'seek'          # seek | approach | stopping | jumping
                                     #   | plat_approach | plat_arc
        self.jump_timer = 0
        self.jump_hold = 20
        self.jump_horizontal = False # True = obstacle jump (move right)
        self.reflex_timer = 0
        self.reflex_inp = None
        self.hit_blocks = set()      # (row, col) of blocks already hit
        self._pit_override = False   # Pit-during-reflex one-shot flag
        # Stuck detection
        self.stuck_x = 0
        self.stuck_frame = 0

    def update(self, state, game, tm):
        mx = state['x']; my = state['y']
        vx = state['vx']; on_ground = state['on_ground']
        scroll_x = state['scroll_x']
        terrain = observe_terrain(tm, mx, my)
        enemies = observe_enemies(state)

        # --- Stuck detection (100 frames, <16px) ---
        if state['frame'] - self.stuck_frame >= 100:
            if mx - self.stuck_x < 16:
                self.reflex_timer = 50
                self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
                self._reset()
            self.stuck_x = mx
            self.stuck_frame = state['frame']

        # === Layer 4 — Reflex (highest priority) ===
        if self.reflex_timer > 0:
            # Critical: pit jump even during active reflex (fire once)
            if on_ground and not self._pit_override:
                for pd, pw in terrain['pits']:
                    if 0 < pd < 16 and vx >= 0:
                        self._pit_override = True
                        self.reflex_timer = 25
                        self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
                        # One frame a=False for clean trigger
                        return {'left': False, 'right': True, 'a': False, 'b': True}
            if not on_ground:
                self._pit_override = False
            self.reflex_timer -= 1
            return self.reflex_inp

        danger = self._check_danger(on_ground, vx, state['vy'], terrain, enemies)
        if danger:
            return danger

        # === Layer 2 — Mid-strategy: pick / validate target ===
        self._update_target(state, tm, scroll_x)

        # === Layer 3 — Tactics ===
        return self._tactics(state, terrain)

    # ------ Layer 4 helpers ------

    def _check_danger(self, on_ground, vx, vy, terrain, enemies):
        """Return override input if imminent danger, else None."""
        # Airborne: steer away from enemies directly below
        if not on_ground and vy > 0:
            for e in enemies:
                if abs(e['dx']) < 12 and e['kind'] in ('goomba', 'koopa'):
                    # Enemy directly below while falling — nudge away
                    if e['dx'] >= 0:
                        return {'left': True, 'right': False, 'a': False, 'b': False}
                    else:
                        return {'left': False, 'right': True, 'a': False, 'b': False}

        if not on_ground:
            return None
        # Pit very close ahead
        for pd, pw in terrain['pits']:
            if 0 < pd < 20 and vx >= 0:
                self.reflex_timer = 24
                self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
                self._reset()
                return self.reflex_inp
        # Enemy collision imminent
        close = [e for e in enemies
                 if -8 < e['dx'] < 80 and e['kind'] in ('goomba', 'koopa')]
        imminent = [e for e in close if e['dx'] < 30]
        if imminent:
            if self.phase in ('approach', 'stopping'):
                # During block approach: short stomp, preserve momentum
                self.reflex_timer = 8
                self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': False}
            elif len(close) >= 3:
                # Enemy group — high dash-jump to clear all
                self.reflex_timer = 22
                self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
            elif len(close) >= 2:
                self.reflex_timer = 16
                self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
            else:
                self.reflex_timer = 10
                self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
            return self.reflex_inp
        return None

    # ------ Layer 2 helpers ------

    def _update_target(self, state, tm, scroll_x):
        mx = state['x']; my = state['y']
        on_ground = state['on_ground']

        if self.target:
            tc, tr, _ = self.target
            if tm.tiles[tr][tc] not in HITTABLE:
                self.hit_blocks.add((tr, tc))
                self._reset()          # already hit
            elif tc * 16 < mx - 60:
                self._reset()          # passed it (wide margin to allow walk-back)

        if self.target is None and on_ground and self.phase == 'seek':
            blocks = visible_blocks(tm, scroll_x)
            blocks = [(c, r, ch) for c, r, ch in blocks
                      if (r, c) not in self.hit_blocks]
            t, plat = pick_best_target(blocks, mx, my, tm)
            if t:
                self.target = t
                self.platform = plat
                if plat:
                    self.phase = 'plat_approach'
                else:
                    self.phase = 'approach'

    def _reset(self):
        self.target = None
        self.platform = None
        self.phase = 'seek'

    # ------ Layer 3 ------

    def _tactics(self, state, terrain):
        if self.target is None:
            return self._advance(state, terrain)

        mx = state['x']; vx = state['vx']
        on_ground = state['on_ground']
        tc, tr, tch = self.target

        # --- Platform phases (reach elevated platform first) ---
        if self.phase == 'plat_approach':
            return self._plat_approach(state)
        if self.phase == 'plat_arc':
            return self._plat_arc(state)

        # Ideal x: head at px+9, block spans [tc*16, tc*16+16).
        ideal_x = tc * 16 - 5
        dx = ideal_x - mx

        # --- Jumping ---
        if self.phase == 'jumping':
            return self._do_jump(state)

        # --- Stopping ---
        if self.phase == 'stopping':
            if on_ground and abs(vx) < 0.1:
                # vx ≈ 0 — check head alignment by column, not dx
                head_col = (int(mx) + 9) // 16
                if head_col == tc:
                    # Head is in the target column — jump!
                    self.phase = 'jumping'
                    self.jump_timer = 0
                    self.jump_hold = 20
                    self.jump_horizontal = False
                    return {'left': False, 'right': False, 'a': False, 'b': False}
                else:
                    self.phase = 'approach'  # re-adjust position
            # Active brake only when fast; otherwise friction
            if vx > 1.0:
                return {'left': True, 'right': False, 'a': False, 'b': False}
            elif vx < -1.0:
                return {'left': False, 'right': True, 'a': False, 'b': False}
            return {'left': False, 'right': False, 'a': False, 'b': False}

        # --- Approach ---
        if not on_ground:
            # Airborne (from obstacle jump etc.) — drift toward target
            if dx > 5:
                return {'left': False, 'right': True, 'a': False, 'b': False}
            elif dx < -5:
                return {'left': True, 'right': False, 'a': False, 'b': False}
            return {'left': False, 'right': False, 'a': False, 'b': False}

        # Wall between Mario and target?
        for wd, wh in terrain['walls']:
            if 0 < wd < max(dx, 8) and wh >= 2:
                self.phase = 'jumping'
                self.jump_timer = 0
                self.jump_horizontal = True
                self.jump_hold = 22 if wh >= 4 else (18 if wh >= 3 else 12)
                return {'left': False, 'right': True, 'a': False, 'b': True}

        head_col_now = (int(mx) + 9) // 16
        if head_col_now == tc or abs(dx) < 6:
            # Head already in target column, or very close — start stopping
            self.phase = 'stopping'
            if vx > 0.8:
                return {'left': True, 'right': False, 'a': False, 'b': False}
            elif vx < -0.8:
                return {'left': False, 'right': True, 'a': False, 'b': False}
            return {'left': False, 'right': False, 'a': False, 'b': False}
        elif dx > 40:
            return {'left': False, 'right': True, 'a': False, 'b': True}   # dash
        elif dx > 0:
            return {'left': False, 'right': True, 'a': False, 'b': False}  # walk
        else:
            return {'left': True, 'right': False, 'a': False, 'b': False}  # back up

    def _plat_approach(self, state):
        """Dash to the jump point ~80px before the platform left edge."""
        if self.platform is None:
            self._reset()
            return {'left': False, 'right': True, 'a': False, 'b': True}
        plat_left_x = self.platform[0] * 16
        jump_x = plat_left_x - 80  # Jump from 80px before platform
        dx = jump_x - state['x']
        if dx > 5:
            return {'left': False, 'right': True, 'a': False, 'b': True}  # Dash
        elif state['on_ground']:
            # At jump point — begin arc jump onto platform
            self.phase = 'plat_arc'
            self.jump_timer = 0
            return {'left': False, 'right': True, 'a': False, 'b': True}
        return {'left': False, 'right': True, 'a': False, 'b': True}

    def _plat_arc(self, state):
        """Full dash-jump that arcs over the platform and lands on top."""
        self.jump_timer += 1
        if self.jump_timer == 1:
            return {'left': False, 'right': True, 'a': False, 'b': True}
        if self.jump_timer <= 22:
            return {'left': False, 'right': True, 'a': True, 'b': True}
        # Descending — wait for landing
        if state['on_ground'] and self.jump_timer > 5:
            # Landed on platform! Switch to normal approach for the high block.
            self.platform = None  # Platform reached, no longer needed
            self.phase = 'approach'
            self.jump_timer = 0
        return {'left': False, 'right': True, 'a': False, 'b': True}

    def _do_jump(self, state):
        self.jump_timer += 1
        on_ground = state['on_ground']

        if self.jump_horizontal:
            # Obstacle jump — move right throughout
            if self.jump_timer == 1:
                return {'left': False, 'right': True, 'a': False, 'b': True}
            if self.jump_timer <= self.jump_hold:
                return {'left': False, 'right': True, 'a': True, 'b': True}
            if on_ground and self.jump_timer > 5:
                self.phase = 'approach' if self.target else 'seek'
                self.jump_timer = 0
            return {'left': False, 'right': True, 'a': False, 'b': True}
        else:
            # Block jump — face right first (so head offset = +9), then straight up
            if self.jump_timer == 1:
                # Tap right to ensure facing right (flip=False → head at px+9)
                return {'left': False, 'right': True, 'a': False, 'b': False}
            if self.jump_timer == 2:
                # Release everything for clean a_trigger
                return {'left': False, 'right': False, 'a': False, 'b': False}
            if self.jump_timer <= self.jump_hold + 2:
                return {'left': False, 'right': False, 'a': True, 'b': False}
            if on_ground and self.jump_timer > 5:
                self._reset()  # re-pick next target
            return {'left': False, 'right': False, 'a': False, 'b': False}

    def _advance(self, state, terrain):
        """No target — advance right, handle obstacles."""
        on_ground = state['on_ground']
        if not on_ground:
            return {'left': False, 'right': True, 'a': False, 'b': True}
        for wd, wh in terrain['walls']:
            if 0 < wd < 20 and wh >= 2:
                self.phase = 'jumping'
                self.jump_timer = 0
                self.jump_horizontal = True
                self.jump_hold = 22 if wh >= 4 else (18 if wh >= 3 else 12)
                return {'left': False, 'right': True, 'a': False, 'b': True}
        for pd, pw in terrain['pits']:
            if 0 < pd < 30:
                self.phase = 'jumping'
                self.jump_timer = 0
                self.jump_horizontal = True
                self.jump_hold = 22
                return {'left': False, 'right': True, 'a': False, 'b': True}
        return {'left': False, 'right': True, 'a': False, 'b': True}


def run_4layer(level_path='assets/level_1_1.txt', max_frames=8000):
    """Run 4-layer AI to collect all coins."""
    if not os.path.exists(level_path):
        level_path = 'level_1_1.txt'

    api = MarioAPI(level_path)
    state = api.reset()
    tm = api._tm
    ai = FourLayerAI()

    print(f'=== 4-Layer AI (collect all coins) ===')
    print(f'Level: {level_path} ({tm.cols}x{tm.rows})')

    while not api.done and state['frame'] < max_frames:
        inp = ai.update(state, api._game, tm)
        state = api.step(**inp)

    result = ('CLEAR' if state['cleared']
              else 'DEAD' if state['dead']
              else 'TIMEOUT')
    coins = state.get('coins', 0)
    print(f'{result} x={state["x"]:.0f} frame={state["frame"]} '
          f'coins={coins} super={state.get("is_super", False)}')

    log_dir = os.path.join(os.path.dirname(__file__), 'logs', 'hierarchical_ai')
    os.makedirs(log_dir, exist_ok=True)
    api.save_log(os.path.join(log_dir, 'last_4layer.json'))
    if state['cleared']:
        api.save_log(os.path.join(log_dir, 'clear_4layer.json'))
    print(f'Replay: python play.py --replay logs/hierarchical_ai/last_4layer.json')
    return state


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else '4layer'
    if mode == '4layer':
        run_4layer()
    else:
        run(goal_name=mode)
