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
            self.jump_hold = 20 if self.wall_height >= 3 else 12
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
    """Jump under a specific block to break/collect it."""
    name = 'hit_block'

    def __init__(self, block, gives_item):
        super().__init__()
        self.dist = block[0]
        self.col = block[1]
        self.row = block[2]
        self.char = block[3]
        self.gives_item = gives_item
        self._done = False
        self._jump_timer = 0

    def score(self, ctx):
        # Live distance to block
        cdist = self.col * 16 - ctx['state']['x']
        if cdist > 30 or cdist < -8:
            return 0
        # Wall nearby → skip block (need momentum for wall climb)
        for wd, wh in ctx['terrain']['walls']:
            if 0 < wd < 48 and wh >= 2:
                return 0
        # Enemy closer than block → yield to stomp
        for e in ctx['enemies']:
            if 0 < e['dx'] < max(cdist, 16) and e['kind'] in ('goomba', 'koopa', 'shell'):
                return 0
        if self.char in ITEM_BLOCKS and not ctx['state'].get('is_super', False):
            return 80  # High priority, wins over advance, loses to climb_wall for tall pipes
        if self.char in COIN_BLOCKS:
            return 30
        return 0

    def step(self, ctx):
        cdist = self.col * 16 - ctx['state']['x']
        self.timer += 1

        # Approach phase: dash toward block (keep speed for pipe crossing later)
        # NOT committed → plan re-selection can switch to stomp/climb_wall any frame
        if cdist > 16 and not self.committed:
            return {'left': False, 'right': True, 'a': False, 'b': True}

        # Jump phase: commit and jump under the block
        if not self.committed:
            self.committed = True
            self._jump_timer = 0

        self._jump_timer += 1
        if self._jump_timer > 5 and ctx['state']['on_ground']:
            self._done = True
        if self._jump_timer == 1:
            return {'left': False, 'right': True, 'a': False, 'b': True}
        if self._jump_timer <= 18:
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

def generate_plans(ctx):
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

    # Hittable blocks
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

            # Stuck escape: back up → dash forward → full jump
            if stuck_escape > 0:
                stuck_escape -= 1
                if stuck_escape > 35:
                    # Phase 1: back up (5 frames)
                    inp = {'left': True, 'right': False, 'a': False, 'b': True}
                elif stuck_escape > 30:
                    # Phase 2: turn around, start running right (5 frames)
                    inp = {'left': False, 'right': True, 'a': False, 'b': True}
                elif stuck_escape > 10:
                    # Phase 3: full dash-jump (20 frames of A hold)
                    inp = {'left': False, 'right': True, 'a': True, 'b': True}
                else:
                    # Phase 4: release A, coast
                    inp = {'left': False, 'right': True, 'a': False, 'b': True}
                state = api.step(**inp)
                if stuck_escape == 0:
                    active_plan = None
                continue

            # Stuck detection: <16px progress in 120 frames
            if state['frame'] - stuck_check_frame >= 120:
                if state['x'] - stuck_check_x < 16:
                    stuck_escape = 40  # 40 frames: 5 back + 5 turn + 20 jump + 10 coast
                stuck_check_x = state['x']
                stuck_check_frame = state['frame']

            # If active plan is committed and not done, keep using it
            if active_plan is None or active_plan.done or not active_plan.committed:
                plans = generate_plans(ctx)
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


if __name__ == '__main__':
    goal = sys.argv[1] if len(sys.argv) > 1 else 'max_coins'
    run(goal_name=goal)
