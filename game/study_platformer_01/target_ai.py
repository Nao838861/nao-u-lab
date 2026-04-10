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
    # Mario standing on platform: his y ≈ plat_top_y - 15 (snapped)
    standing_y = ((plat_top_y - 15) & 0xFFFFFFF0) + 1
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

    for dc in range(tiles_ahead):
        c = col + dc
        if c < 0 or c >= tm.cols:
            continue
        dist = dc * 16 - offset

        # Pit detection (bottom 2 rows)
        bottom_solid = any(
            tm.tiles[r][c] in SOLID_TILES
            for r in range(tm.rows - 2, tm.rows) if r < tm.rows)
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

    Scans rows 3-5 above ground (typically rows 8-10) for solid tiles.
    """
    best = None
    for offset in (4, 3, 5):  # Prefer row ground-4 (=row 9), then nearby
        pr = ground_row - offset
        if pr < 0 or pr >= tm.rows:
            continue
        cols = [pc for pc in range(max(0, target_col - 5), min(tm.cols, target_col + 6))
                if tm.tiles[pr][pc] in SOLID_TILES]
        if cols:
            return (min(cols), max(cols), pr)
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
        self.phase = 'idle'         # idle | moving | jumping | arc_jump
        self.jump_timer = 0
        self.jump_hold = 20
        self.jump_right = False     # horizontal movement during jump
        self.reflex_timer = 0
        self.reflex_inp = None
        self._pit_override = False
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
        self._game = game  # Store for trajectory access
        self._tm = tm

        # ── Stuck detection ──
        if state['frame'] - self._stuck_f >= 120:
            if mx - self._stuck_x < 16:
                self.reflex_timer = 50
                self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
                self._clear_block()
            self._stuck_x = mx; self._stuck_f = state['frame']

        # ── Reflex layer (highest priority) ──
        inp = self._reflex(state, pits, walls, enemies, tm)
        if inp:
            return {'input': inp, 'markers': self.markers}

        # ── Strategy layer: pick target position ──
        self._strategy(state, game, tm, scroll_x, pits, walls, enemies)

        # ── Action layer: move toward target ──
        inp = self._action(state, pits, walls, enemies)
        return {'input': inp, 'markers': self.markers}

    # ── Reflex ───────────────────────────────────────────────────────

    def _reflex(self, state, pits, walls, enemies, tm=None):
        mx = state['x']; vx = state['vx']; vy = state['vy']
        on_ground = state['on_ground']

        # Active reflex timer
        if self.reflex_timer > 0:
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

        if not on_ground:
            return None

        # Pit imminent
        for pd, pw in pits:
            if 0 < pd < 20 and vx >= 0:
                self.reflex_timer = 24
                self.reflex_inp = {'left': False, 'right': True, 'a': True, 'b': True}
                self._clear_block()
                return self.reflex_inp

        # Enemy very close — stomp with ceiling awareness
        for e in enemies:
            if -8 < e['dx'] < 30 and e['kind'] in ('goomba', 'koopa', 'shell'):
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

    # ── Strategy ─────────────────────────────────────────────────────

    def _strategy(self, state, game, tm, scroll_x, pits, walls, enemies):
        mx = state['x']; my = state['y']
        on_ground = state['on_ground']
        mario_row = int(my) // 16
        ground_row = tm.rows - 2  # Level ground (row 13), not Mario's current row

        # Mark enemies as threats
        for e in enemies:
            if 0 < e['dx'] < 100:
                self.markers.append(Marker(e['x'], e['y'], 16, 16, (255, 80, 80), e['kind']))

        # Mark pits
        for pd, pw in pits:
            if 0 < pd < 150:
                self.markers.append(Marker(mx + pd, (tm.rows - 2) * 16, pw, 32, (255, 0, 255), 'PIT'))

        # ── Update / validate current block target ──
        if self.block_target:
            bc, br, bch = self.block_target
            if tm.tiles[br][bc] not in HITTABLE:
                self.hit_blocks.add((br, bc))
                self._clear_block()
            elif bc * 16 < mx - 80:
                self._clear_block()

        # ── Pick new block target if needed ──
        if self.block_target is None and on_ground and self.phase in ('idle', 'moving'):
            blocks = scan_visible_blocks(tm, scroll_x)
            blocks = [(c, r, ch) for c, r, ch in blocks if (r, c) not in self.hit_blocks]

            best = None; best_score = -999; best_plat = None
            for c, r, ch in blocks:
                bx = c * 16
                dx = bx - mx
                if dx < -30 or dx > 200:
                    continue
                rows_above = mario_row - r
                if rows_above < 1:
                    continue

                plat = None
                if rows_above <= 4:
                    # Reachable with a walk jump (< ~64px height)
                    score = 200 - abs(dx)
                elif rows_above <= 10:
                    plat = find_platform_for(tm, c, ground_row)
                    if plat is None:
                        continue
                    # Platform blocks: lower than ground blocks (do ground first)
                    score = (100 if ch in ITEM_BLOCKS else 80) - abs(dx)
                else:
                    continue

                if ch in ITEM_BLOCKS:
                    score += 80
                elif ch in COIN_BLOCKS:
                    score += 50

                if score > best_score:
                    best_score = score; best = (c, r, ch); best_plat = plat

            if best:
                self.block_target = best
                self.block_platform = best_plat

        # ── Build target / subgoals from current block target ──
        if self.block_target:
            bc, br, bch = self.block_target
            self.markers.append(Marker(bc * 16, br * 16, 16, 16, (255, 255, 0), bch))

            if self.block_platform and self.phase not in ('jumping', 'arc_jump'):
                # ── High block: plan multi-step route to reach platform ──
                pl, pr_col, p_row = self.block_platform
                plat_left_x = pl * 16
                plat_top_y = p_row * 16 - 15  # Standing on block top
                self.markers.append(Marker(plat_left_x, p_row * 16,
                                          (pr_col - pl + 1) * 16, 16,
                                          (0, 200, 255), 'PLAT'))

                # Plan subgoals once (when queue is empty)
                plat_width = (pr_col - pl + 1) * 16
                if plat_width <= 48:
                    # Narrow platform (≤3 tiles): walk toward block,
                    # wall climbing will naturally jump onto the platform.
                    under_x = bc * 16 - 5
                    if abs(mx - under_x) > 30:
                        self.target = TargetPos(under_x, my, 'dash', f'dash to c{bc}')
                    else:
                        self.target = TargetPos(under_x, my, 'walk', f'walk to c{bc}')
                elif not self.subgoals and self.phase in ('idle', 'moving'):
                    # Wide platform: start far enough for descent arc to hit
                    # Dash-jump peaks ~87px from start, so start ~80px before platform
                    stand_x = plat_left_x - 80
                    land_x = plat_left_x + 16
                    under_x = bc * 16 - 5
                    self.subgoals = [
                        TargetPos(stand_x, my, 'walk', 'beside platform'),
                        TargetPos(land_x, plat_top_y, 'jump_up', 'jump onto plat'),
                        TargetPos(under_x, plat_top_y, 'walk', f'on plat to c{bc}'),
                    ]
                    self.target = self.subgoals.pop(0)
                    self.phase = 'moving'

                elif self.target is None and self.subgoals:
                    self.target = self.subgoals.pop(0)

            elif self.phase not in ('jumping',):
                # ── Ground-reachable block: go under it then jump ──
                under_x = bc * 16 - 5
                if on_ground:
                    # Use trajectory prediction: would jumping NOW hit the block?
                    if jump_would_hit_block(game, tm, bc, br):
                        self.target = TargetPos(mx, br * 16, 'jump_land', f'hit c{bc}')
                    elif abs(mx - under_x) > 30:
                        self.target = TargetPos(under_x, my, 'dash', f'dash to c{bc}')
                    else:
                        self.target = TargetPos(under_x, my, 'walk', f'walk to c{bc}')

            # Show movement target
            if self.target:
                col_t = (255, 200, 0) if self.target.mode in ('dash',) else \
                        (0, 180, 255) if self.target.mode == 'jump_up' else (0, 255, 100)
                self.markers.append(Marker(self.target.x - 3, self.target.y - 3,
                                          8, 8, col_t, self.target.reason))
        else:
            # No block target: advance toward flag
            self.target = TargetPos(mx + 120, my, 'dash', 'advance')

        # ── Mushroom collection (override if nearby) ──
        game_obj = game
        for m in game_obj.mushrooms:
            if not m.alive or m.emerging:
                continue
            mdx = m.x / ONE - mx
            mdy = m.y / ONE - my
            if abs(mdx) < 60:
                self.markers.append(Marker(m.x / ONE, m.y / ONE, 16, 16, (0, 255, 0), 'MUSH'))
                if abs(mdx) < 40 and not state.get('is_super', False):
                    # Chase mushroom — predict where it'll be
                    mush_vx = m.vx / ONE
                    predict_frames = abs(mdx) / max(abs(state['vx']), 1.5)
                    predict_x = m.x / ONE + mush_vx * predict_frames
                    self.target = TargetPos(predict_x, m.y / ONE, 'dash', 'catch mushroom')

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

        # ── Wall/pipe/stair ahead: jump if prediction lands on higher ground ──
        if on_ground and mode not in ('jump_up',):
            for wd, wh in walls:
                if 0 < wd < 60 and wh >= 2:
                    # Predict: would jumping NOW land me on higher ground AHEAD?
                    landing = predict_jump_landing(self._game, self._tm)
                    if landing:
                        land_x, land_y = landing
                        if land_y < state['y'] - 4 and land_x > mx:
                            # Jump lands on higher ground — go!
                            self.phase = 'arc_jump'
                            self.jump_timer = 0
                            self.jump_hold = 22
                            self.jump_right = True
                            wall_col = (int(mx) + wd + 8) // 16
                            self.target = TargetPos(land_x, land_y,
                                                   'jump_up', 'climb wall')
                            return {'left': False, 'right': True, 'a': False, 'b': True}
                    if wd < 8:
                        return {'left': False, 'right': True, 'a': False, 'b': False}
                    break

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

            # Use landing prediction: jump if it lands on higher ground TOWARD target
            landing = predict_jump_landing(self._game, self._tm)
            if landing:
                land_x, land_y = landing
                toward = (dx >= 0 and land_x > state['x']) or (dx < 0 and land_x < state['x'])
                if land_y < state['y'] - 4 and toward:
                    self.phase = 'arc_jump'
                    self.jump_timer = 0
                    self.jump_hold = 22
                    self.jump_right = (dx >= 0)
                    d = dx >= 0
                    return {'left': not d, 'right': d, 'a': False, 'b': True}

            # Not ready — walk toward jump position
            if dx > 3:
                return {'left': False, 'right': True, 'a': False, 'b': True}
            elif dx < -3:
                return {'left': True, 'right': False, 'a': False, 'b': False}
            return {'left': False, 'right': True, 'a': False, 'b': False}

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
            self.jump_hold = 22  # Full height jump
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
        if self.jump_timer == 1:
            return {'left': not r, 'right': r, 'a': False, 'b': True}
        if self.jump_timer <= self.jump_hold:
            return {'left': not r, 'right': r, 'a': True, 'b': True}
        if state['on_ground'] and self.jump_timer > 6:
            # Landed — advance subgoal if this was a platform jump
            self._advance_subgoal()
            self.jump_timer = 0
        return {'left': not r, 'right': r, 'a': False, 'b': True}
