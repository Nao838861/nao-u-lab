"""TargetPosition-Driven AI — strategy selects a world position, action layer moves there.

Architecture:
  Strategy  → evaluates screen, picks TargetPos + markers for debug
  Action    → converts (mario, target, mode) into Input
  Reflex    → overrides on imminent danger (pit / enemy collision)

Run live with debug visualization:
  python play.py --ai
"""

from tilemap import SOLID_TILES
from core import ONE, GOOMBA_SPEED, KOOPA_WALK_SPEED

# ── Block categories (same as hierarchical_ai) ──────────────────────
HITTABLE = frozenset('?QcmsT')
COIN_BLOCKS = frozenset('?cT')
ITEM_BLOCKS = frozenset('Qm')

SCREEN_W = 256

# ── Trajectory-based jump checks ────────────────────────────────────

def trajectory_passes_over(game, tm, plat_left_col, plat_right_col, plat_row,
                           jump_right=True, use_dash=True):
    """Check if a jump trajectory passes over the platform surface.

    Instead of detecting a specific landing, checks if ANY frame has
    Mario descending through the platform's column range at the right height.
    Returns (frame_index, x, y) of the best pass-over frame, or None.
    """
    from trajectory import predict
    path = predict(game, tm, frames=70, override_jump=True,
                   inp_a=True,
                   inp_right=jump_right, inp_left=not jump_right,
                   inp_b=use_dash)
    plat_top_y = plat_row * 16
    mario_h = 31 if game.is_super else 15
    standing_y = plat_top_y - mario_h
    peaked = False
    prev_y = None
    stable_count = 0
    for i, (px, py) in enumerate(path):
        if py < plat_top_y - 20:
            peaked = True
        mario_col = int(px) // 16
        in_plat = mario_col >= plat_left_col - 1 and mario_col <= plat_right_col
        in_range = standing_y - 10 < py < standing_y + 20

        # Method 1: peaked then descending over platform (original arc landing)
        if peaked and prev_y is not None and py >= prev_y and in_plat and in_range:
            return (i, px, py)

        # Method 2: stable on platform (landed — y barely changes for 2+ frames)
        if in_plat and in_range and prev_y is not None and abs(py - prev_y) < 2:
            stable_count += 1
            if stable_count >= 2:
                return (i, px, py)
        else:
            stable_count = 0

        prev_y = py
    return None


def predict_jump_landing(game, tm):
    """Predict where Mario lands if jumping NOW.

    Tries dash-jump first (long arc), then walk-jump (short arc).
    Returns the CLOSEST landing that is higher than current position.
    """
    from trajectory import predict
    start_y = game.y / ONE
    best = None

    for use_dash in (True, False):
        path = predict(game, tm, frames=70, override_jump=True,
                       inp_a=True, inp_right=True, inp_b=use_dash)
        if len(path) < 10:
            continue
        peaked = False
        for i in range(1, len(path)):
            if path[i][1] < start_y - 16:
                peaked = True
            if peaked and i > 5:
                if abs(path[i][1] - path[i - 1][1]) < 2 and path[i][1] < start_y + 16:
                    land = (path[i][0], path[i][1])
                    # Prefer the landing closest to start (shorter jump)
                    if land[1] < start_y - 4:
                        if best is None or abs(land[0] - game.x / ONE) < abs(best[0] - game.x / ONE):
                            best = land
                    break
    return best


def jump_would_hit_block(game, tm, target_col, target_row):
    """Return True if jumping NOW would hit the block.

    Uses straight-up walk jump for nearby blocks (row diff ≤ 4).
    Uses dash jump for high blocks (row diff > 4) to get HIGH_JUMP_BONUS.
    """
    from trajectory import predict
    mario_row = game.y // (256 * 16)
    rows_above = mario_row - target_row
    if rows_above > 4:
        # High block: need dash speed for HIGH_JUMP_BONUS
        path = predict(game, tm, frames=50, override_jump=True,
                       inp_a=True, inp_left=False, inp_right=True, inp_b=True)
    else:
        # Normal block: straight-up walk jump
        path = predict(game, tm, frames=50, override_jump=True,
                       inp_a=True, inp_left=False, inp_right=False, inp_b=False)
    for px_x, px_y in path:
        head_x = int(px_x) + 9
        head_col = head_x // 16
        head_row = int(px_y) // 16
        if head_col == target_col and head_row == target_row:
            return True
    return False


def jump_would_land_on(game, tm, plat_left_col, plat_right_col, plat_row):
    """Return True if jumping NOW (A held, dashing right) would land on the platform.

    Checks the predicted trajectory for a frame where Mario is on the
    platform surface with downward velocity (landing).
    """
    from trajectory import predict
    path = predict(game, tm, frames=70, override_jump=True,
                   inp_a=True, inp_right=True, inp_b=True)
    plat_top_y = plat_row * 16  # Top pixel of the platform blocks
    mario_h = 31 if game.is_super else 15
    standing_y = ((plat_top_y - mario_h) & 0xFFFFFFF0) + 1
    was_above = False
    prev_y = None
    for px_x, px_y in path:
        mario_col = int(px_x) // 16
        if px_y < plat_top_y - 20:
            was_above = True
        # Detect landing: was above, now close to standing height, column within platform
        if was_above and prev_y is not None and px_y > prev_y:  # Descending
            if abs(px_y - standing_y) < 8:
                if plat_left_col <= mario_col <= plat_right_col:
                    return True
                # Also check mario_col+1 (Mario is 16px wide)
                if plat_left_col <= mario_col + 1 <= plat_right_col:
                    return True
        prev_y = px_y
    return False



# =====================================================================
# Data types
# =====================================================================

class Marker:
    """Rectangle drawn on screen for debug visualization."""
    __slots__ = ('x', 'y', 'w', 'h', 'color', 'label')

    def __init__(self, x, y, w=16, h=16, color=(255, 255, 0), label=''):
        self.x = x; self.y = y; self.w = w; self.h = h
        self.color = color; self.label = label

    def to_dict(self):
        return {'x': self.x, 'y': self.y, 'w': self.w, 'h': self.h,
                'color': list(self.color), 'label': self.label}

    @staticmethod
    def from_dict(d):
        return Marker(d['x'], d['y'], d.get('w', 16), d.get('h', 16),
                      tuple(d.get('color', (255, 255, 0))), d.get('label', ''))


class TargetPos:
    """Where the AI wants Mario to be."""
    __slots__ = ('x', 'y', 'mode', 'reason')

    def __init__(self, x, y, mode='dash', reason=''):
        self.x = x          # World pixel x
        self.y = y          # World pixel y
        self.mode = mode     # dash | walk | jump_land | jump_to
        self.reason = reason


# =====================================================================
# Observation helpers
# =====================================================================

def scan_visible_blocks(tm, scroll_x):
    """Return hittable blocks on screen as [(col, row, char)]."""
    lc = max(0, int(scroll_x) // 16)
    rc = min(tm.cols - 1, int(scroll_x + SCREEN_W) // 16)
    out = []
    for c in range(lc, rc + 1):
        for r in range(tm.rows):
            ch = tm.tiles[r][c]
            if ch in HITTABLE:
                out.append((c, r, ch))
    return out


def scan_enemies(state):
    """Return list of {x, y, dx, kind, vx} for active enemies near Mario."""
    mx = state['x']
    out = []
    for g in state.get('goombas', []):
        if g['alive'] and not g.get('squished'):
            dx = g['x'] - mx
            if -40 < dx < 200:
                out.append({'x': g['x'], 'y': g['y'], 'dx': dx,
                            'kind': 'goomba', 'vx': -GOOMBA_SPEED / ONE})
    for k in state.get('koopas', []):
        if k['alive']:
            dx = k['x'] - mx
            if -40 < dx < 200:
                kind = 'shell' if k['state'] != 0 else 'koopa'
                vx = KOOPA_WALK_SPEED / ONE if kind == 'shell' else -KOOPA_WALK_SPEED / ONE
                out.append({'x': k['x'], 'y': k['y'], 'dx': dx,
                            'kind': kind, 'vx': vx})
    out.sort(key=lambda e: abs(e['dx']))
    return out


def scan_terrain_ahead(tm, mx, my, tiles_ahead=14):
    """Lightweight forward scan for pits and walls."""
    col = int(mx) // 16
    mario_row = int(my) // 16
    offset = int(mx) % 16
    pits = []
    walls = []
    in_pit = False
    pit_start = None
    # If elevated on a tall structure (pipe/wall), detect edge of surface
    foot_row = mario_row + 1
    # Only activate elevated mode if standing on a tall solid column (3+ rows)
    elevated = False
    if mario_row < tm.rows - 4 and 0 <= col < tm.cols and 0 <= foot_row < tm.rows:
        if tm.tiles[foot_row][col] in SOLID_TILES:
            # Check if this is a tall structure (solid for 3+ rows below feet)
            solid_depth = sum(1 for r in range(foot_row, min(foot_row + 4, tm.rows))
                             if tm.tiles[r][col] in SOLID_TILES)
            elevated = solid_depth >= 3

    for dc in range(tiles_ahead):
        c = col + dc
        if c < 0 or c >= tm.cols:
            continue
        dist = dc * 16 - offset

        # Pit detection (bottom 2 rows)
        bottom_solid = any(
            tm.tiles[r][c] in SOLID_TILES
            for r in range(tm.rows - 2, tm.rows) if r < tm.rows)
        # Elevated: also treat edge of current surface as pit
        if elevated and bottom_solid and 0 <= foot_row < tm.rows:
            if tm.tiles[foot_row][c] not in SOLID_TILES:
                bottom_solid = False  # Surface ended — treat as pit
        if not bottom_solid:
            if not in_pit:
                in_pit = True; pit_start = dc
        elif in_pit:
            in_pit = False
            pits.append((pit_start * 16 - offset, (dc - pit_start) * 16))

        # Wall detection
        if dc > 0:
            h = 0
            for row in range(tm.rows - 3, -1, -1):
                if 0 <= row < tm.rows and tm.tiles[row][c] in SOLID_TILES:
                    h = (tm.rows - 2) - row
                else:
                    break
            if h > 0 and (tm.rows - 2 - h) <= mario_row + 1:
                walls.append((dist, h))

    if in_pit:
        pits.append((pit_start * 16 - offset, (tiles_ahead - pit_start) * 16))
    return pits, walls


def find_platform_for(tm, target_col, ground_row):
    """Find solid blocks at mid-height that can serve as a platform.

    Scans rows 3-5 above ground (typically rows 8-10) for runs of
    consecutive solid tiles (at least 2 wide).
    """
    for offset in (4, 3, 5):  # Prefer row ground-4 (=row 9), then nearby
        pr = ground_row - offset
        if pr < 0 or pr >= tm.rows:
            continue
        # Find longest consecutive run of solid tiles near target_col
        search_l = max(0, target_col - 8)
        search_r = min(tm.cols, target_col + 9)
        best_run = None
        run_start = None
        for pc in range(search_l, search_r):
            if tm.tiles[pr][pc] in SOLID_TILES:
                if run_start is None:
                    run_start = pc
            else:
                if run_start is not None:
                    run_len = pc - run_start
                    if run_len >= 2:
                        if best_run is None or run_len > best_run[1] - best_run[0]:
                            best_run = (run_start, pc - 1)
                    run_start = None
        # Check final run
        if run_start is not None:
            run_len = search_r - run_start
            if run_len >= 2:
                if best_run is None or run_len > best_run[1] - best_run[0]:
                    best_run = (run_start, search_r - 1)
        if best_run:
            return (best_run[0], best_run[1], pr)
    return None


# =====================================================================
# TargetAI — the main controller
# =====================================================================

class TargetAI:
    """TargetPosition-driven AI controller."""

    def __init__(self):
        self.target = None          # TargetPos or None (current immediate goal)
        self.subgoals = []          # [TargetPos] queued steps (pop from front)
        self.markers = []           # [Marker] for debug display
        self.block_target = None    # (col, row, char) current block aim
        self.block_platform = None  # platform info if high block
        self.hit_blocks = set()     # (row, col) already collected
        self._target_since = 0      # Frame when current block_target was set
        self.phase = 'idle'         # idle | moving | jumping | arc_jump
        self.jump_timer = 0
        self.jump_hold = 20
        self.jump_right = False     # horizontal movement during jump
        self.reflex_timer = 0
        self.reflex_inp = None
        self._pit_override = False
        self._wall_climb = False    # arc_jump is wall-climb (don't pop subgoals on landing)
        # Stuck detection
        self._stuck_x = 0
        self._stuck_f = 0

    # ── Public interface ─────────────────────────────────────────────

    def update(self, state, game, tm):
        """Compute one frame. Returns dict with 'input', 'markers', 'trajectories'."""
        mx = state['x']; my = state['y']
        vx = state['vx']; vy = state['vy']
        on_ground = state['on_ground']
        scroll_x = state['scroll_x']

        pits, walls = scan_terrain_ahead(tm, mx, my)
        enemies = scan_enemies(state)

        self.markers = []  # Rebuild each frame
        self._trajectories = {}  # Nav trajectory lines for debug display
        self._game = game  # Store for trajectory access
        self._tm = tm

        # ── Stuck detection ──
        # Quick forward-blocked detection: if wall is nearby and we're
        # nearly stopped for 15+ frames, jump immediately.
        # Tall walls (height>=2) → wall-climb arc_jump to land on top.
        # Short walls → reflex jump over.
        if not hasattr(self, '_blocked_frames'):
            self._blocked_frames = 0
            self._climb_cooldown = 0
        if self._climb_cooldown > 0:
            self._climb_cooldown -= 1
        if on_ground and self.phase not in ('arc_jump',) \
                and self._climb_cooldown == 0 \
                and not (self.target and self.target.reason == 'use spring'):
            blocking_wall = None
            for wd, wh in walls:
                if wd < 20:
                    blocking_wall = (wd, wh)
                    break
            if blocking_wall and abs(vx) < 32:
                self._blocked_frames += 1
                if self._blocked_frames >= 6:
                    bwd, bwh = blocking_wall
                    if bwh >= 2:
                        # Check for pit near/after the wall
                        wall_col_s = (int(mx) + bwd + 8) // 16
                        pit_near_s = False
                        for pc in range(int(mx)//16 + 1, min(wall_col_s + 4, tm.cols)):
                            if not any(tm.tiles[r][pc] in SOLID_TILES
                                       for r in range(tm.rows - 2, tm.rows)):
                                pit_near_s = True
                                break
                        if not pit_near_s:
                            # Safe: hold right+A to climb
                            self.reflex_timer = 45
                            self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': False}
                        else:
                            # Pit nearby: just advance, don't climb
                            pass
                        self._clear_block()
                        self._blocked_frames = 0
                        self._climb_cooldown = 60
                    else:
                        # Short wall (1 block): jump over with dash
                        self.reflex_timer = 20
                        self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
                        self._clear_block()
                        self._blocked_frames = 0
            else:
                self._blocked_frames = 0
        # Fallback: long stuck detection — only jump if landing is safe
        if state['frame'] - self._stuck_f >= 120:
            moved = abs(mx - self._stuck_x)
            if moved < 16 and not self.subgoals:
                # Check if jump would land safely
                from trajectory import predict
                jump_safe = False
                path = predict(game, tm, frames=70, override_jump=True,
                               inp_right=True, inp_a=True, inp_b=True)
                peaked_s = False
                for li in range(1, len(path)):
                    if path[li][1] > path[li-1][1]:
                        peaked_s = True
                    if peaked_s and li > 5:
                        lc = int(path[li][0] + 8) // 16
                        lr = int(path[li][1] + 15) // 16
                        if 0 <= lc < tm.cols and 0 <= lr < tm.rows:
                            if tm.tiles[lr][lc] in SOLID_TILES:
                                jump_safe = True
                                break
                if jump_safe:
                    self.reflex_timer = 50
                    self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
                self._clear_block()
            self._stuck_x = mx; self._stuck_f = state['frame']

        # ── Reflex layer (highest priority) ──
        inp = self._reflex(state, pits, walls, enemies, tm)
        if inp:
            return {'input': inp, 'markers': self.markers,
                    'trajectories': self._trajectories}

        # ── Strategy layer: pick target position ──
        self._strategy(state, game, tm, scroll_x, pits, walls, enemies)

        # ── Action layer: move toward target ──
        inp = self._action(state, pits, walls, enemies)
        return {'input': inp, 'markers': self.markers,
                'trajectories': self._trajectories}

    # ── Reflex ───────────────────────────────────────────────────────

    def _reflex(self, state, pits, walls, enemies, tm=None):
        mx = state['x']; vx = state['vx']; vy = state['vy']
        on_ground = state['on_ground']

        # Active reflex timer
        if self.reflex_timer > 0:
            # Note: no airborne pit check during reflex — reflex jumps
            # are intentional (pit crossing, wall climbing). The normal
            # airborne pit check (line ~449) handles non-reflex airborne.
            # Wall-climb reflex: if we landed on higher ground, stop jumping
            if on_ground and self.reflex_timer < 40 and self.reflex_inp and self.reflex_inp.get('a'):
                self.reflex_timer = 0
                return {'left': False, 'right': True, 'a': False, 'b': True}
            # Pit override during active reflex
            if on_ground and not self._pit_override:
                for pd, pw in pits:
                    if 0 < pd < 16 and vx >= 0:
                        self._pit_override = True
                        self.reflex_timer = 25
                        self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
                        return {'left': False, 'right': True, 'a': False, 'b': True}
            if not on_ground:
                self._pit_override = False
            self.reflex_timer -= 1
            return self.reflex_inp

        # Airborne: nudge away from enemies below
        if not on_ground and vy > 0:
            for e in enemies:
                if abs(e['dx']) < 14 and e['kind'] in ('goomba', 'koopa'):
                    self.markers.append(Marker(e['x'], e['y'], 16, 16, (255, 0, 0), 'DODGE'))
                    d = 'left' if e['dx'] >= 0 else 'right'
                    return {'left': d == 'left', 'right': d == 'right', 'a': False, 'b': False}

        # Airborne pit-death avoidance: if continuing forward leads to
        # falling into a pit, reverse direction to land on safe ground
        if not on_ground and tm is not None:
            inp = self._airborne_pit_check(state, tm)
            if inp:
                return inp
            return None

        # Pit imminent
        for pd, pw in pits:
            if 0 < pd < 20 and vx >= 0:
                self.reflex_timer = 24
                self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
                self._clear_block()
                return self.reflex_inp

        # Enemy nearby — stomp with ceiling awareness
        # React distance scales with speed, checks BOTH directions
        react_dist = max(35, abs(vx) * 16 + 10)
        for e in enemies:
            # Ahead (positive dx when moving right, negative when moving left)
            dx_abs = abs(e['dx'])
            moving_toward = (vx >= 0 and e['dx'] > 0) or (vx < 0 and e['dx'] < 0) or dx_abs < 16
            if moving_toward and dx_abs < react_dist and e['kind'] in ('goomba', 'koopa', 'shell'):
                close_count = sum(1 for e2 in enemies
                                  if -8 < e2['dx'] < 80 and e2['kind'] in ('goomba', 'koopa'))
                # Check ceiling: is there a solid block above Mario?
                mx = state['x']
                mario_col = int(mx) // 16
                mario_row = int(state['y']) // 16
                has_ceiling = False
                for check_r in range(max(0, mario_row - 4), mario_row):
                    for check_c in range(mario_col, mario_col + 2):
                        if tm and 0 <= check_c < tm.cols and tm.tiles[check_r][check_c] in SOLID_TILES:
                            has_ceiling = True
                            break
                # Short jump if ceiling, tall jump if open
                if has_ceiling:
                    hold = 6   # Low stomp to avoid ceiling
                elif close_count >= 3:
                    hold = 22
                elif close_count >= 2:
                    hold = 16
                else:
                    hold = 10
                self.reflex_timer = hold
                self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': not has_ceiling}
                self.markers.append(Marker(e['x'], e['y'], 16, 16, (255, 0, 0), 'STOMP'))
                return self.reflex_inp

        return None

    def _airborne_pit_check(self, state, tm):
        """While airborne, predict if current trajectory leads to pit death.

        If forward trajectory crosses a pit at ground level, check if
        reversing direction would land safely. If so, reverse.
        """
        from trajectory import predict
        mx = state['x']; vx = state['vx']
        going_right = vx >= 0
        h = 31 if self._game.is_super else 15
        ground_y = (tm.rows - 2) * 16
        ground_rows = range(tm.rows - 2, tm.rows)

        def trajectory_hits_pit(path):
            for px, py in path:
                if py + h >= ground_y:
                    col = (int(px) + 8) // 16
                    if 0 <= col < tm.cols:
                        if not any(tm.tiles[r][col] in SOLID_TILES
                                   for r in ground_rows):
                            return True
            return False

        # Predict forward trajectory (no jump, drift with current momentum)
        path_fwd = predict(self._game, self._tm, frames=60,
                           inp_right=going_right, inp_left=not going_right,
                           inp_a=False, inp_b=False)
        if not path_fwd or not trajectory_hits_pit(path_fwd):
            return None  # Forward is safe

        # Forward leads to pit — try reverse
        path_rev = predict(self._game, self._tm, frames=60,
                           inp_right=not going_right, inp_left=going_right,
                           inp_a=False, inp_b=False)
        if path_rev and not trajectory_hits_pit(path_rev):
            # Reverse lands safely — override all current actions
            self.phase = 'idle'
            self.jump_timer = 0
            self._wall_climb = False
            self.markers.append(Marker(mx, state['y'], 16, 16,
                                       (255, 0, 255), 'PIT AVOID'))
            return {'left': going_right, 'right': not going_right,
                    'a': False, 'b': False}

        return None  # Both directions lead to pit — can't help

    # ── Strategy ─────────────────────────────────────────────────────

    def _strategy(self, state, game, tm, scroll_x, pits, walls, enemies):
        """Route-first strategy: plan the route based on terrain, then
        pick up blocks along the way. Navigation always comes first."""
        mx = state['x']; my = state['y']
        on_ground = state['on_ground']
        mario_row = int(my) // 16
        ground_row = tm.rows - 2
        ground_y = ground_row * 16

        # Mark enemies/pits for debug display
        for e in enemies:
            if 0 < e['dx'] < 100:
                self.markers.append(Marker(e['x'], e['y'], 16, 16, (255, 80, 80), e['kind']))
        for pd, pw in pits:
            if 0 < pd < 150:
                self.markers.append(Marker(mx + pd, ground_y, pw, 32, (255, 0, 255), 'PIT'))

        # ── Validate current target ──
        if self.block_target:
            bc, br, bch = self.block_target
            if tm.tiles[br][bc] not in HITTABLE:
                self.hit_blocks.add((br, bc))
                self._clear_block()
            elif bc * 16 < mx - 80:
                self._clear_block()
            elif state['frame'] - self._target_since > 120:
                self.hit_blocks.add((br, bc))
                self._clear_block()

        # ── Don't re-plan if busy (jumping/arc_jump/active subgoals) ──
        if self.phase in ('jumping', 'arc_jump'):
            return
        if self.subgoals:
            if self.target is None:
                self.target = self.subgoals.pop(0)
            return
        if not on_ground:
            if self.target is None:
                self.target = TargetPos(mx + 120, my, 'dash', 'advance')
            return
        if self.target and self.target.reason == 'use spring':
            return

        # ══════════════════════════════════════════════════════════════
        # ROUTE PLANNING: scan ahead, build waypoints, integrate blocks
        # ══════════════════════════════════════════════════════════════

        # 1. Check for springboard first (special case)
        mario_col = int(mx) // 16
        for dc in range(-3, 10):
            c = mario_col + dc
            if 0 <= c < tm.cols:
                for sr in (ground_row, ground_row - 1):
                    if 0 <= sr < tm.rows and tm.tiles[sr][c] == 'S':
                        spring_x = c * 16 + 4
                        if abs(spring_x - mx) < 150:
                            self.target = TargetPos(spring_x, my, 'walk', 'use spring')
                            self._clear_block()
                            self.markers.append(Marker(c * 16, sr * 16,
                                                       16, 16, (0, 255, 128), 'SPRING'))
                            return
                        break
                else:
                    continue
                break

        # 2. Check for nearby mushroom (urgent override)
        for m in game.mushrooms:
            if not m.alive or m.emerging:
                continue
            mdx = m.x / ONE - mx
            if abs(mdx) < 40 and not state.get('is_super', False):
                mush_vx = m.vx / ONE
                predict_frames = abs(mdx) / max(abs(state['vx']), 1.5)
                predict_x = m.x / ONE + mush_vx * predict_frames
                self.target = TargetPos(predict_x, m.y / ONE, 'dash', 'catch mushroom')
                self.markers.append(Marker(m.x / ONE, m.y / ONE, 16, 16, (0, 255, 0), 'MUSH'))
                return

        # 3. Route planning: terrain first, then blocks
        far_pits, far_walls = scan_terrain_ahead(tm, mx, my, tiles_ahead=20)

        # Find nearest obstacle
        nearest_obstacle = None
        for pd, pw in far_pits:
            if pd > 0:
                nearest_obstacle = ('pit', pd, pw)
                break
        for wd, wh in far_walls:
            if wd > 0 and wh >= 1:
                if nearest_obstacle is None or wd < nearest_obstacle[1]:
                    nearest_obstacle = ('wall', wd, wh)
                break

        # 4. Check for blocks BEFORE the obstacle (safe to collect)
        obstacle_dist = nearest_obstacle[1] if nearest_obstacle else 200
        blocks = scan_visible_blocks(tm, scroll_x)
        blocks = [(c, r, ch) for c, r, ch in blocks if (r, c) not in self.hit_blocks]

        best_block = None; best_score = -999; best_plat = None
        for c, r, ch in blocks:
            bx = c * 16
            bdx = bx - mx
            if bdx < -80 or bdx > 200:
                continue
            rows_above = mario_row - r
            if rows_above < 1:
                continue
            if rows_above == 1 and ch not in ITEM_BLOCKS and ch not in COIN_BLOCKS:
                continue
            # Skip blocks beyond the nearest obstacle (either direction)
            if bdx > 0 and bdx > obstacle_dist - 16:
                continue
            # Skip blocks on the far side of a nearby tall wall
            if nearest_obstacle and nearest_obstacle[0] == 'wall' and nearest_obstacle[2] >= 4:
                wall_px = mx + nearest_obstacle[1]
                block_px = c * 16
                if (bdx > 0 and block_px > wall_px) or (bdx < 0 and block_px < wall_px - 32):
                    continue

            plat = None
            if rows_above <= 4:
                score = 200 - abs(bdx)
            elif rows_above <= 10:
                plat = find_platform_for(tm, c, ground_row)
                if plat is None:
                    continue
                score = (100 if ch in ITEM_BLOCKS else 80) - abs(bdx)
            else:
                continue
            if ch in ITEM_BLOCKS:
                score += 80
            elif ch in COIN_BLOCKS:
                score += 50
            if score > best_score:
                best_score = score; best_block = (c, r, ch); best_plat = plat

        # 5. If there's a reachable block before the obstacle, go for it
        if best_block:
            bc, br, bch = best_block
            if best_block != self.block_target:
                self._target_since = state['frame']
            self.block_target = best_block
            self.block_platform = best_plat
            self.markers.append(Marker(bc * 16, br * 16, 16, 16, (255, 255, 0), bch))

            if best_plat:
                # High block with platform
                pl, pr_col, p_row = best_plat
                plat_left_x = pl * 16
                plat_top_y = p_row * 16 - 15
                plat_right_x = (pr_col + 1) * 16
                under_x = bc * 16 - 5
                self.markers.append(Marker(plat_left_x, p_row * 16,
                                          (pr_col - pl + 1) * 16, 16,
                                          (0, 200, 255), 'PLAT'))
                dist_to_left = abs(mx - plat_left_x)
                dist_to_right = abs(mx - plat_right_x)
                if dist_to_right < dist_to_left:
                    stand_x = plat_right_x + 70
                    land_x = plat_right_x - 16
                else:
                    stand_x = plat_left_x - 70
                    land_x = plat_left_x + 16
                self.subgoals = [
                    TargetPos(stand_x, my, 'dash', 'beside platform'),
                    TargetPos(land_x, plat_top_y, 'jump_up', 'jump onto plat'),
                    TargetPos(under_x, plat_top_y, 'walk', f'on plat to c{bc}'),
                ]
                self.target = self.subgoals.pop(0)
                self.phase = 'moving'
            else:
                # Ground-reachable block
                under_x = bc * 16 - 5
                if jump_would_hit_block(game, tm, bc, br):
                    self.target = TargetPos(mx, br * 16, 'jump_land', f'hit c{bc}')
                elif abs(mx - under_x) > 30:
                    self.target = TargetPos(under_x, my, 'dash', f'dash to c{bc}')
                else:
                    self.target = TargetPos(under_x, my, 'walk', f'walk to c{bc}')
            return

        # 6. No block to collect — navigate past the obstacle
        self.block_target = None
        self.block_platform = None
        self._plan_navigation(state, game, tm, pits, walls)

        # Show movement target
        if self.target:
            col_t = (255, 200, 0) if self.target.mode in ('dash',) else \
                    (0, 180, 255) if self.target.mode in ('jump_up', 'nav_jump') else (0, 255, 100)
            self.markers.append(Marker(self.target.x - 3, self.target.y - 3,
                                      8, 8, col_t, self.target.reason))

    def _plan_navigation(self, state, game, tm, pits, walls):
        """Destination-driven navigation: scan ahead, find obstacles,
        set the landing spot as the target, and build a route to get there.
        """
        mx = state['x']; my = state['y']
        on_ground = state['on_ground']

        # Not on ground or busy — simple advance
        if not on_ground or self.phase not in ('idle', 'moving') or self.subgoals:
            self.target = TargetPos(mx + 120, my, 'dash', 'advance')
            return

        mario_col = int(mx) // 16
        ground_y = (tm.rows - 2) * 16
        ground_row = tm.rows - 2

        # Extended scan
        far_pits, far_walls = scan_terrain_ahead(tm, mx, my, tiles_ahead=20)

        # ── Collect obstacles in order of distance ──
        obstacles = []
        for pd, pw in far_pits:
            if pd > 0:
                obstacles.append(('pit', pd, pw))
        for wd, wh in far_walls:
            if wd > 0 and wh >= 1:
                obstacles.append(('wall', wd, wh))
        obstacles.sort(key=lambda o: o[1])  # Sort by distance

        if not obstacles:
            # Clear path — advance
            self.target = TargetPos(mx + 120, my, 'dash', 'advance')
            return

        kind, dist, size = obstacles[0]

        if kind == 'pit':
            # ── Pit: destination = far side of pit ──
            pd, pw = dist, size
            far_side_col = (int(mx) + pd + pw + 8) // 16
            pit_start_x = mx + pd
            # Show pit zone
            self.markers.append(Marker(pit_start_x, ground_y, pw, 32,
                                       (255, 0, 255), f'PIT w={pw}'))
            if far_side_col < tm.cols:
                # Dash toward pit — reflex pit jump handles the crossing.
                # Using nav_jump for pits causes oscillation with airborne
                # pit check (predict pit → reverse → predict safe → forward).
                self.target = TargetPos(mx + 120, my, 'dash', 'advance')
                self.markers.append(Marker(far_side_col * 16 - 4, ground_y - 4, 8, 8,
                                           (0, 255, 200), 'far side'))
            else:
                self.target = TargetPos(mx + 120, my, 'dash', 'advance')

        elif kind == 'wall':
            self._plan_wall_navigation(state, tm, dist, size, mx, my, ground_row, ground_y)

    def _plan_wall_navigation(self, state, tm, wd, wh, mx, my, ground_row, ground_y):
        """Plan how to get past a wall. Handles:
        - 1-block obstacles (jump over or staircase)
        - Tall walls reachable by direct jump (land on top or beyond)
        - Tall walls NOT reachable directly (multi-step: find intermediate platform)
        """
        mario_row = int(my) // 16
        wall_col = (int(mx) + wd + 8) // 16

        # Find wall top
        wall_top_row = None
        for r in range(tm.rows):
            if 0 <= wall_col < tm.cols and tm.tiles[r][wall_col] in SOLID_TILES:
                wall_top_row = r
                break
        if wall_top_row is None:
            self.target = TargetPos(mx + 120, my, 'dash', 'advance')
            return

        wall_top_y = wall_top_row * 16
        wall_x = wall_col * 16

        # Show wall
        self.markers.append(Marker(wall_x, wall_top_y, 16, wh * 16,
                                   (255, 165, 0), f'WALL h={wh}'))

        # ── Check for pit near the wall (between mario and wall+2) ──
        mario_col = int(mx) // 16
        pit_before = False
        for c in range(mario_col + 1, min(wall_col + 4, tm.cols)):
            if 0 <= c < tm.cols:
                has_ground = any(tm.tiles[r][c] in SOLID_TILES
                                 for r in range(tm.rows - 2, tm.rows))
                if not has_ground:
                    pit_before = True
                    break
        if pit_before:
            # Pit between us and wall — don't try to jump the wall,
            # just advance and let reflex handle the pit
            self.target = TargetPos(mx + 120, my, 'dash', 'advance')
            return

        # ── Check what's beyond the wall ──
        pit_after = False
        ground_after_col = None
        for c in range(wall_col + 1, min(wall_col + 10, tm.cols)):
            has_ground = any(tm.tiles[r][c] in SOLID_TILES
                             for r in range(tm.rows - 2, tm.rows))
            if not has_ground:
                pit_after = True
            elif pit_after:
                ground_after_col = c
                break
            elif not pit_after and c > wall_col + 1:
                ground_after_col = c
                break

        # ── 1-block wall: staircase check or jump over ──
        if wh == 1:
            staircase = False
            stair_top_row = wall_top_row
            stair_top_col = wall_col
            for c in range(wall_col + 1, min(wall_col + 8, tm.cols)):
                has_block = False
                for r in range(ground_row - 5, ground_row):
                    if 0 <= r < tm.rows and tm.tiles[r][c] in SOLID_TILES:
                        has_block = True
                        if r < stair_top_row:
                            stair_top_row = r
                            stair_top_col = c
                        break
                if not has_block:
                    break
                staircase = True
            if staircase:
                land_x = stair_top_col * 16 + 8
                land_y = stair_top_row * 16 - 1
                reason = 'onto stair'
            else:
                land_x = (wall_col + 2) * 16
                land_y = ground_y
                reason = 'over block'
            self._set_nav_target(land_x, land_y, reason)
            return

        # ── Tall wall: can Mario jump to the top from current height? ──
        # Max jump height from ground is ~4 tiles (~64px). From elevated, less.
        height_diff = mario_row - wall_top_row  # rows Mario needs to climb
        can_reach_directly = height_diff <= 3  # ~48px, conservative for wall-adjacent jumps

        if can_reach_directly:
            # Direct jump: decide landing spot
            # Use wall_top_y or ground_y depending on which is reachable
            if pit_after and not ground_after_col:
                land_x = wall_col * 16 + 8
                land_y = wall_top_y - 1
                reason = 'onto wall'
            elif ground_after_col:
                # Find actual ground height at landing column
                land_row = ground_row
                for r in range(tm.rows - 1, -1, -1):
                    if tm.tiles[r][ground_after_col] in SOLID_TILES:
                        land_row = r - 1
                        break
                land_x = ground_after_col * 16 + 8
                land_y = land_row * 16
                reason = 'over wall'
            else:
                land_x = (wall_col + 2) * 16
                land_y = ground_y
                reason = 'over wall'
            self._set_nav_target(land_x, land_y, reason)
            return

        # ── Too tall to reach directly: find intermediate platform ──
        # Scan columns between Mario and the wall for elevated solid surfaces
        # (pipes, blocks, platforms) that Mario can reach and use as a stepping stone
        best_step = None  # (col, top_row, score)
        mario_col_int = int(mx) // 16
        for c in range(mario_col_int - 6, wall_col):
            if c < 0 or c >= tm.cols:
                continue
            # Find all elevated solid surfaces in this column
            # (there may be blocks at row 5 AND a pipe at row 10)
            for r in range(ground_row - 1, -1, -1):
                if tm.tiles[r][c] not in SOLID_TILES:
                    continue
                # Found a solid tile at row r — is this a surface top?
                # (tile above is empty or out of bounds)
                if r > 0 and tm.tiles[r - 1][c] in SOLID_TILES:
                    continue  # Not the top of a structure
                step_top = r
                step_height = ground_row - step_top
                if step_height < 2 or step_height > 5:
                    continue  # Too low or too high to reach
                remaining = step_top - wall_top_row
                if remaining > 4:
                    continue  # Can't reach wall top from here
                if remaining < -2:
                    continue  # Step is above the wall (wrong direction)
                # Score: prefer closer to mario and higher steps
                score = step_height * 10 - abs(c - mario_col_int) * 3
                if best_step is None or score > best_step[2]:
                    best_step = (c, step_top, score)

        if best_step:
            step_col, step_top, _ = best_step
            step_x = step_col * 16 + 8
            step_y = step_top * 16 - 1
            # Multi-step plan: first land on intermediate, then jump to wall top
            final_x = wall_col * 16 + 8
            final_y = wall_top_y - 1
            self.subgoals = [
                TargetPos(final_x, final_y, 'nav_jump', 'to wall top'),
            ]
            self.target = TargetPos(step_x, step_y, 'nav_jump', 'step up')
            self.phase = 'moving'
            # Show both waypoints
            self.markers.append(Marker(step_x - 8, step_y - 8, 16, 16,
                                       (0, 255, 100), 'STEP'))
            self.markers.append(Marker(final_x - 8, final_y - 8, 16, 16,
                                       (100, 255, 255), 'FINAL'))
        else:
            # No intermediate found — try direct anyway (reflex may help)
            land_x = wall_col * 16 + 8
            land_y = wall_top_y - 1
            self._set_nav_target(land_x, land_y, 'onto wall')

    def _set_nav_target(self, land_x, land_y, reason):
        """Helper: set a nav_jump target with marker."""
        self.target = TargetPos(land_x, land_y, 'nav_jump', reason)
        self.phase = 'moving'
        self.markers.append(Marker(land_x - 8, land_y - 8, 16, 16,
                                   (0, 255, 100), f'LAND:{reason}'))

    def _clear_block(self):
        self.block_target = None
        self.block_platform = None
        self.subgoals = []
        self.phase = 'idle'

    def _advance_subgoal(self):
        """Current subgoal done — pop next, or go idle."""
        if self.subgoals:
            self.target = self.subgoals.pop(0)
        else:
            self.target = None
        self.phase = 'idle'

    # ── Action ───────────────────────────────────────────────────────

    def _action(self, state, pits, walls, enemies):
        mx = state['x']; vx = state['vx']
        on_ground = state['on_ground']

        if self.target is None:
            return {'left': False, 'right': True, 'a': False, 'b': True}

        tx = self.target.x
        dx = tx - mx
        mode = self.target.mode

        # ── Jumping phase ──
        if self.phase == 'jumping':
            return self._do_block_jump(state)

        if self.phase == 'arc_jump':
            return self._do_arc_jump(state)

        # ── Mode: jump_up (jump from beside platform onto it) ──
        if mode == 'jump_up':
            return self._do_jump_up(state, dx)

        # ── Mode: jump_to (legacy — reach an elevated target) ──
        if mode == 'jump_to':
            return self._do_jump_to(state, dx)

        # ── nav_jump: destination-driven jump over obstacles ──
        if mode == 'nav_jump' and on_ground:
            ty = self.target.y
            # If target is elevated and we're too close to the wall,
            # back up a bit for a running start (but not too far)
            if ty < state['y'] - 16 and dx > 0:
                for wd, wh in walls:
                    if 0 < wd < 30 and wh >= 2:
                        # Too close — walk left to get a ~40px run-up
                        if wd < 40:
                            return {'left': True, 'right': False, 'a': False, 'b': False}
                        break
            if dx > 0:
                from trajectory import predict
                # Show target marker
                self.markers.append(Marker(self.target.x - 6, ty - 6, 12, 12,
                                           (0, 255, 100), self.target.reason))
                best_path = None
                best_dash = True
                for use_dash in (True, False):
                    path = predict(self._game, self._tm, frames=70,
                                   override_jump=True, inp_right=True,
                                   inp_a=True, inp_b=use_dash)
                    label = 'nav_dash' if use_dash else 'nav_walk'
                    self._trajectories[label] = path

                    # Find actual landing point from trajectory
                    peaked_p = False
                    pred_land = None
                    pred_frame = None
                    for li in range(1, len(path)):
                        if path[li][1] > path[li-1][1]:
                            peaked_p = True
                        if peaked_p and li > 5:
                            lc = int(path[li][0] + 8) // 16
                            lr = int(path[li][1] + 15) // 16
                            if 0 <= lc < self._tm.cols and 0 <= lr < self._tm.rows:
                                if self._tm.tiles[lr][lc] in SOLID_TILES:
                                    pred_land = (path[li][0], (lr - 1) * 16)
                                    pred_frame = li
                                    self.markers.append(Marker(
                                        path[li][0] - 4, (lr - 1) * 16 - 4,
                                        8, 8, (255, 255, 0), 'PRED'))
                                    break

                    # Only jump if predicted landing is safe (on solid ground)
                    if not pred_land:
                        continue  # No landing found — don't jump
                    # Check landing is not in/near a pit
                    pred_col = int(pred_land[0] + 8) // 16
                    landing_safe = True
                    for pc in range(max(0, pred_col - 1), min(pred_col + 2, self._tm.cols)):
                        if not any(self._tm.tiles[r][pc] in SOLID_TILES
                                   for r in range(self._tm.rows - 2, self._tm.rows)):
                            landing_safe = False
                            break
                    if not landing_safe:
                        continue  # Landing near pit — don't jump

                    # Check if trajectory reaches target
                    for i, (ppx, ppy) in enumerate(path):
                        near_x = abs(ppx - self.target.x) < 24
                        near_y = abs(ppy - ty) < 20
                        landed = (i > 5 and ppy >= ty - 8)
                        if near_x and (near_y or landed):
                            hold = min(i + 5, 40)
                            self.phase = 'arc_jump'
                            self.jump_timer = 0
                            self.jump_hold = hold
                            self.jump_right = True
                            self._wall_climb = False
                            return {'left': False, 'right': True, 'a': False, 'b': use_dash}
                # Can't reach by jumping — check if wall requires multi-step
                if not self.subgoals:
                    for wd, wh in walls:
                        if 0 < wd < 30 and wh >= 3:
                            mario_row = int(state['y']) // 16
                            wall_col = (int(mx) + wd + 8) // 16
                            wall_top_row = None
                            for r in range(self._tm.rows):
                                if 0 <= wall_col < self._tm.cols and self._tm.tiles[r][wall_col] in SOLID_TILES:
                                    wall_top_row = r
                                    break
                            if wall_top_row is not None and mario_row - wall_top_row > 3:
                                ground_row = self._tm.rows - 2
                                ground_y = ground_row * 16
                                orig = TargetPos(self.target.x, ty, 'nav_jump', self.target.reason)
                                self._plan_wall_navigation(
                                    state, self._tm, wd, wh, mx, state['y'],
                                    ground_row, ground_y)
                                if self.target and self.target.mode == 'nav_jump':
                                    self.subgoals.append(orig)
                                    # If step is to the left, move toward it
                                    step_right = self.target.x >= mx
                                    return {'left': not step_right, 'right': step_right,
                                            'a': False, 'b': True}
                            break
                return {'left': False, 'right': True, 'a': False, 'b': True}
            elif dx < -8 and self.subgoals:
                # Target is to our left (e.g. pipe to step onto).
                # Jump up while steering left, hold A until above target.
                self.phase = 'arc_jump'
                self.jump_timer = 0
                self.jump_hold = 40
                self.jump_right = False  # Initial direction: left
                self._wall_climb = False
                self._nav_steer_target = self.target
                return {'left': True, 'right': False, 'a': True, 'b': True}

            elif dx < -8:
                # No wall nearby — try jumping left toward target
                from trajectory import predict
                self.markers.append(Marker(self.target.x - 6, ty - 6, 12, 12,
                                           (0, 255, 100), self.target.reason))
                path = predict(self._game, self._tm, frames=70,
                               override_jump=True, inp_left=True, inp_right=False,
                               inp_a=True, inp_b=False)
                self._trajectories['nav_walk'] = path
                for i, (ppx, ppy) in enumerate(path):
                    if abs(ppx - self.target.x) < 24 and abs(ppy - ty) < 20:
                        self.phase = 'arc_jump'
                        self.jump_timer = 0
                        self.jump_hold = min(i + 5, 40)
                        self.jump_right = False
                        self._wall_climb = False
                        return {'left': True, 'right': False, 'a': False, 'b': False}
                # Move left toward step
                return {'left': True, 'right': False, 'a': False, 'b': False}
            else:
                # At target or close — advance subgoal
                self._advance_subgoal()
                return {'left': False, 'right': True, 'a': False, 'b': False}

        # ── Wall/pipe/stair ahead: jump if prediction lands on higher ground ──
        # Only for block_target navigation (not nav_jump which handles its own jumps)
        target_ahead = (self.target is None) or (self.target.x > mx + 5)
        has_platform_plan = self.block_platform and self.subgoals
        using_spring = self.target and self.target.reason == 'use spring'
        if on_ground and mode not in ('jump_up', 'nav_jump') and target_ahead and not has_platform_plan and not using_spring:
            mario_row_a = int(state['y']) // 16
            for wd, wh in walls:
                if 0 < wd < 20 and wh >= 2:
                    wall_top_row = self._tm.rows - 2 - wh
                    # Skip if wall top is at or below mario (stepping down)
                    if wall_top_row >= mario_row_a:
                        break
                    # Skip if pit is near the wall (would fall in after climbing)
                    wall_col_a = (int(mx) + wd + 8) // 16
                    pit_nearby = False
                    for pc in range(wall_col_a, min(wall_col_a + 4, self._tm.cols)):
                        if not any(self._tm.tiles[r][pc] in SOLID_TILES
                                   for r in range(self._tm.rows - 2, self._tm.rows)):
                            pit_nearby = True
                            break
                    if pit_nearby:
                        break
                    # Tall wall: hold right+A (no dash) to land on top
                    self.reflex_timer = 45
                    self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': False}
                    self._clear_block()
                    return self.reflex_inp

        # ── Mode: jump_land (block hit) ──
        if mode == 'jump_land' and on_ground:
            if self.target.reason.startswith('hit c'):
                # Strategy already confirmed prediction — jump immediately
                self.phase = 'jumping'
                self.jump_timer = 0
                self.jump_hold = 20
                self.jump_right = False
                # Keep current horizontal motion (drift is predicted)
                return {'left': False, 'right': False, 'a': False, 'b': False}

        # ── During movement toward a subgoal: check if platform jump is ready NOW ──
        if on_ground and self.subgoals and self.block_platform and mode in ('walk', 'dash'):
            pl, pr_col, p_row = self.block_platform
            plat_center = (pl + pr_col + 1) * 16 // 2
            # Try preferred direction first, then opposite
            preferred = (plat_center > mx)
            for try_right in ([preferred, not preferred]):
                hit = (trajectory_passes_over(self._game, self._tm, pl, pr_col, p_row,
                                              jump_right=try_right, use_dash=True) or
                       trajectory_passes_over(self._game, self._tm, pl, pr_col, p_row,
                                              jump_right=try_right, use_dash=False))
                if hit:
                    self.subgoals = [sg for sg in self.subgoals
                                     if sg.mode != 'walk' or 'on plat' in sg.reason]
                    self.phase = 'arc_jump'
                    self.jump_timer = 0
                    self.jump_hold = 40
                    self.jump_right = try_right
                    d = try_right
                    return {'left': not d, 'right': d, 'a': False, 'b': True}

        # ── Springboard: steer right during bounce ──
        if self.target and self.target.reason == 'use spring':
            if not on_ground:
                # Airborne from spring bounce — steer right toward flag
                self.phase = 'idle'
                return {'left': False, 'right': True, 'a': True, 'b': True}
            elif mx > self.target.x + 60:
                # Landed past the wall — spring done, resume normal
                self.target = None
                self.phase = 'idle'

        # ── Mode: dash / walk — arrived? ──
        if abs(dx) < 3 and mode in ('walk', 'dash'):
            self._advance_subgoal()
            return {'left': False, 'right': False, 'a': False, 'b': False}

        if dx > 0:
            b = mode == 'dash'
            self.phase = 'moving'
            return {'left': False, 'right': True, 'a': False, 'b': b}
        else:
            self.phase = 'moving'
            return {'left': True, 'right': False, 'a': False, 'b': False}

    def _do_jump_up(self, state, dx):
        """Mode jump_up: jump to reach an elevated target position.

        Works for platform climbing AND staircase climbing.
        Uses trajectory prediction to determine exact jump timing.
        """
        on_ground = state['on_ground']

        if self.phase == 'arc_jump':
            return self._do_arc_jump(state)

        if on_ground and self.phase != 'arc_jump':
            if state['y'] < self.target.y + 20:
                # Already at or above target height — done
                self._advance_subgoal()
                return {'left': False, 'right': False, 'a': False, 'b': False}

            # Check: does the jump arc pass over the platform surface?
            jump_right = (dx >= 0)
            if self.block_platform:
                pl, pr_col, p_row = self.block_platform
            else:
                pl = int(self.target.x) // 16
                pr_col = pl + 1
                p_row = (int(self.target.y) + 15) // 16
            # Try both directions × dash/walk — pick first that works
            for try_right in ([jump_right, not jump_right]):
                hit = (trajectory_passes_over(self._game, self._tm, pl, pr_col, p_row,
                                              jump_right=try_right, use_dash=True) or
                       trajectory_passes_over(self._game, self._tm, pl, pr_col, p_row,
                                              jump_right=try_right, use_dash=False))
                if hit:
                    _, land_x, land_y = hit
                    self.phase = 'arc_jump'
                    self.jump_timer = 0
                    self.jump_hold = 40
                    self.jump_right = try_right
                    d = try_right
                    return {'left': not d, 'right': d, 'a': False, 'b': True}

            # If directly below the platform (|dx| < 16), jump straight up
            if abs(dx) < 16:
                mario_col_j = int(state['x']) // 16
                if pl <= mario_col_j <= pr_col:
                    self.phase = 'arc_jump'
                    self.jump_timer = 0
                    self.jump_hold = 40
                    self.jump_right = True
                    return {'left': False, 'right': False, 'a': True, 'b': False}

            # Not ready — walk toward jump position
            if dx > 3:
                return {'left': False, 'right': True, 'a': False, 'b': True}
            elif dx < -3:
                return {'left': True, 'right': False, 'a': False, 'b': True}
            return {'left': False, 'right': True, 'a': False, 'b': True}

        # Airborne — drift toward target
        d = dx >= 0
        return {'left': not d, 'right': d, 'a': True, 'b': True}

    def _do_jump_to(self, state, dx):
        """Mode jump_to: reach an elevated target by dashing then jumping.

        Phases:
          1. On ground, target ahead & above: dash right to build speed
          2. When close enough that a full jump arc will pass over the target: jump
          3. Airborne: hold A, drift toward target
          4. Descending over target: land
        """
        mx = state['x']; vx = state['vx']
        on_ground = state['on_ground']
        ty = self.target.y

        # ── Already in arc_jump phase: ride it out ──
        if self.phase == 'arc_jump':
            return self._do_arc_jump(state)

        # ── Airborne but not in arc_jump (landed on platform?) ──
        if not on_ground and self.phase != 'arc_jump':
            # Drift toward target x
            if dx > 5:
                return {'left': False, 'right': True, 'a': True, 'b': True}
            elif dx < -5:
                return {'left': True, 'right': False, 'a': True, 'b': False}
            return {'left': False, 'right': False, 'a': True, 'b': False}

        # ── On ground: check if we've landed on the platform ──
        if on_ground and state['y'] < ty + 20:
            # We're already at platform height — success!
            self.block_platform = None  # Platform reached
            self.phase = 'idle'
            return {'left': False, 'right': False, 'a': False, 'b': False}

        # ── On ground, below platform: need to jump up to it ──
        if dx < 0:
            # Target is behind us — walk back first
            return {'left': True, 'right': False, 'a': False, 'b': False}

        # Calculate: at current speed, how far from target should we jump?
        # Full dash-jump arc: peak at ~35 frames, lands at ~70 frames.
        # At dash speed 2.5px/f: covers ~175px total.
        # Platform needs to be under us during descent (frames 35-50).
        # Jump when target is ~90-100px ahead.
        # Also need enough speed: vx >= 2.0 for a good arc.

        if dx > 100 or vx < 2.0:
            # Too far or too slow — keep dashing right
            return {'left': False, 'right': True, 'a': False, 'b': True}

        if 40 < dx <= 100:
            # In the jump window and at speed — jump!
            self.phase = 'arc_jump'
            self.jump_timer = 0
            self.jump_hold = 40  # Full height jump
            self.jump_right = True
            return {'left': False, 'right': True, 'a': False, 'b': True}

        # Very close (dx <= 40): too close for arc, walk to get closer and jump
        # (This shouldn't normally happen if we approach from far enough)
        return {'left': False, 'right': True, 'a': False, 'b': True}

    def _do_block_jump(self, state):
        """Jump to hit block. Drift is pre-calculated by strategy layer."""
        self.jump_timer += 1
        if self.jump_timer == 1:
            # Release A for clean trigger (prev_a must be False)
            return {'left': False, 'right': False, 'a': False, 'b': False}
        if self.jump_timer <= self.jump_hold + 1:
            return {'left': False, 'right': False, 'a': True, 'b': False}
        if state['on_ground'] and self.jump_timer > 5:
            self.phase = 'idle'
            self.jump_timer = 0
        return {'left': False, 'right': False, 'a': False, 'b': False}

    def _do_arc_jump(self, state):
        """Horizontal jump (obstacle / platform arc)."""
        self.jump_timer += 1
        r = self.jump_right
        vy = state['vy']

        # Nav steer: jump up, then steer toward target at peak
        steer = getattr(self, '_nav_steer_target', None)
        if steer:
            # Landed while steering — done with this step
            if state['on_ground'] and self.jump_timer > 6:
                self._nav_steer_target = None
                self._advance_subgoal()
                self.jump_timer = 0
                return {'left': False, 'right': True, 'a': False, 'b': False}
            steer_dx = steer.x - state['x']
            above_target = state['y'] < steer.y
            go_left = steer_dx < 0
            go_right = steer_dx > 0
            # Always steer toward target. Hold A until above target height.
            return {'left': go_left, 'right': go_right,
                    'a': not above_target, 'b': True}

        if self.jump_timer == 1:
            return {'left': not r, 'right': r, 'a': False, 'b': True}
        if self.jump_timer <= self.jump_hold:
            return {'left': not r, 'right': r, 'a': True, 'b': True}
        if state['on_ground'] and self.jump_timer > 6:
            self._nav_steer_target = None  # Clear steer on landing
            if self._wall_climb:
                self._wall_climb = False
                self.phase = 'moving' if self.target else 'idle'
            else:
                self._advance_subgoal()
            self.jump_timer = 0
        return {'left': not r, 'right': r, 'a': False, 'b': True}
