"""Mario Clone - Game Logic (pure Python, no external dependencies)

Faithful port of Nao_u's GBA Mario physics (mario.c) and Goomba (kuribo.c).
Fixed-point arithmetic (ONE=256) preserved for exact behavior match.
"""

ONE = 256  # Fixed-point scale (8-bit fractional part)

# Physics constants -- exact GBA values from mario.c
ACCEL_WALK = 12        # SPD_PL
ACCEL_DASH = 17        # SPD_PL2
MAX_SPEED_WALK = 384   # SPD_MAX  = 256+128
MAX_SPEED_DASH = 640   # SPD_MAX2 = 256+256+128
HIGH_JUMP_THRESHOLD = 490  # HIJMP_SPD

GRAVITY = 78
JUMP_VELOCITY = -4 * ONE    # -1024
HIGH_JUMP_BONUS = -112
JUMP_HOLD_BOOST = -48        # Counteracts gravity while A held during rise
FALL_SPEED_CAP = 5 * ONE     # 1280

FRICTION_NUMERATOR = 250     # spd_x = spd_x * 250 / 256
SPEED_DEADZONE = 180         # Below this -> snap to 0
BRAKE_THRESHOLD = 128        # Opposite-direction threshold for braking

# Goomba constants -- from kuribo.c
GOOMBA_SPEED = 96            # Walk speed (~0.375 px/frame)
GOOMBA_SQUISH_FRAMES = 30   # Show squished sprite then remove
STOMP_BOUNCE = -512          # Mario's vy after stomping (half jump)

# Koopa constants
KOOPA_WALK_SPEED = 80        # Slightly slower than Goomba
KOOPA_SHELL_SPEED = 768      # Fast sliding shell (~3 px/frame)
KOOPA_REVIVE_FRAMES = 300    # Shell wakes up after 5 seconds
KOOPA_SHAKE_START = 240      # Start shaking animation before revive

# Items
MUSHROOM_SPEED = 256         # ~1 px/frame (NES accurate; faster than Goomba)
COIN_POPUP_FRAMES = 30       # Coin animation duration
INVINCIBLE_FRAMES = 120      # Frames of invincibility after taking damage

# World (fallback when no tilemap)
GROUND_Y = 224    # Ground surface pixel Y (NES: row 13 of 15)
SCREEN_W = 256    # Viewport width in pixels
SCREEN_H = 240    # Viewport height in pixels (NES: 15 rows x 16px)

# Camera dead zone (Mario 3 style: Mario at ~1/3 from left)
# Dead zone: 56-104px. Mario normally sits at ~80px (1/3 of 256).
# Ahead visibility: 256-104 = 152px. Behind: 56px.
CAM_LEFT_MARGIN = 56 * ONE
CAM_RIGHT_MARGIN = 104 * ONE


def _trunc_div(a, b):
    """C-style integer division (truncates toward zero)."""
    if (a < 0) != (b < 0) and a % b != 0:
        return a // b + 1
    return a // b


class Input:
    """One frame of player input."""
    __slots__ = ('left', 'right', 'a', 'b')

    def __init__(self, left=False, right=False, a=False, b=False):
        self.left = left
        self.right = right
        self.a = a   # Jump
        self.b = b   # Dash/Run


class Goomba:
    """Enemy: walks, reverses at walls. Faithful to kuribo.c."""
    __slots__ = ('x', 'y', 'vx', 'vy', 'alive', 'active',
                 'on_ground', 'squish_timer', 'anim_counter')

    def __init__(self, pixel_x, pixel_y):
        self.x = pixel_x * ONE
        self.y = pixel_y * ONE
        self.vx = -GOOMBA_SPEED  # Walk left (towards Mario)
        self.vy = 0
        self.alive = True
        self.active = False      # Activates when near screen
        self.on_ground = False
        self.squish_timer = 0
        self.anim_counter = 0


class Koopa:
    """Koopa Troopa: walks, becomes shell when stomped, can be kicked."""
    WALKING = 0
    SHELL_IDLE = 1
    SHELL_SLIDING = 2

    __slots__ = ('x', 'y', 'vx', 'vy', 'alive', 'active',
                 'on_ground', 'state', 'shell_timer', 'kick_grace',
                 'anim_counter')

    def __init__(self, pixel_x, pixel_y):
        self.x = pixel_x * ONE
        self.y = pixel_y * ONE
        self.vx = -KOOPA_WALK_SPEED
        self.vy = 0
        self.alive = True
        self.active = False
        self.on_ground = False
        self.state = Koopa.WALKING
        self.shell_timer = 0
        self.kick_grace = 0     # Frames after kick where shell ignores Mario
        self.anim_counter = 0


# Block bounce trajectory (from MoveBlock.c renga_mov_tbl)
BLOCK_BOUNCE_TBL = [-1, -1, -2, -3, -4, -5, -6, -7, -7, -7, -6, -4, -2, 0, 2, 1]
BLOCK_BOUNCE_FRAMES = len(BLOCK_BOUNCE_TBL)
HITTABLE_BLOCKS = frozenset('#?csmTQ')
COIN_BLOCKS = frozenset('?cT')     # Blocks that give coins
MUSHROOM_BLOCKS = frozenset('Qm')  # Blocks that give mushroom


class Mushroom:
    """Super Mushroom: emerges from block, walks right, gives power-up."""
    __slots__ = ('x', 'y', 'vx', 'vy', 'alive', 'on_ground', 'emerging', 'emerge_cnt')

    def __init__(self, pixel_x, pixel_y):
        self.x = pixel_x * ONE
        self.y = pixel_y * ONE
        self.vx = MUSHROOM_SPEED
        self.vy = 0
        self.alive = True
        self.on_ground = False
        self.emerging = True     # Rising out of block
        self.emerge_cnt = 0

    @property
    def done_emerging(self):
        return self.emerge_cnt >= 16  # Rise 16px out of block


class CoinPopup:
    """Visual-only coin animation when hitting a coin block."""
    __slots__ = ('x', 'y', 'cnt')

    def __init__(self, pixel_x, pixel_y):
        self.x = pixel_x
        self.y = pixel_y
        self.cnt = 0

    @property
    def done(self):
        return self.cnt >= COIN_POPUP_FRAMES

    @property
    def y_offset(self):
        # Arc up then down
        if self.cnt < 15:
            return -self.cnt * 2
        return -(30 - self.cnt * 2)


class BouncingBlock:
    """A block that has been hit from below: animates bouncing then restores."""
    __slots__ = ('col', 'row', 'original_char', 'cnt', '_restore_override')

    def __init__(self, col, row, original_char):
        self.col = col
        self.row = row
        self.original_char = original_char
        self.cnt = 0
        self._restore_override = None

    @property
    def done(self):
        return self.cnt >= BLOCK_BOUNCE_FRAMES

    @property
    def y_offset(self):
        if self.cnt < BLOCK_BOUNCE_FRAMES:
            return BLOCK_BOUNCE_TBL[self.cnt]
        return 0

    @property
    def restore_char(self):
        """What tile to place when bounce is done."""
        if self._restore_override is not None:
            return self._restore_override
        if self.original_char in ('?', 'Q', 'c', 's', 'm', 'T'):
            return '!'  # One-hit / depleted → used block
        return self.original_char  # Regular brick '#' → brick


class MarioGame:
    """Core game engine. Pure Python -- no rendering, no I/O.

    All positions and velocities are in fixed-point (ONE=256).
    Use get_state() for pixel-scale values suitable for AI scripts.
    """

    def __init__(self, tilemap=None):
        self.tilemap = tilemap
        self.x = 0
        self.y = 0
        self.vx = 0
        self.vy = 0
        self.on_ground = True
        self.dash = False
        self.stop = 0
        self.flip = False
        self.fall = False
        self.pattern = 0
        self.anim_counter = 0
        self.scroll_x = 0
        self.frame = 0
        self._prev_a = False
        self.goombas = []
        self.koopas = []
        self.bouncing_blocks = []
        self.mushrooms = []
        self.coin_popups = []
        self.coins = 0
        self._ten_coin_remaining = {}  # {(row,col): hits_left} for T blocks
        self.is_super = False
        self.invincible_timer = 0
        self.dead = False
        self.cleared = False
        self.log = []
        self.reset()

    def _is_solid(self, pixel_x, pixel_y):
        """Check if a pixel position is inside a solid tile."""
        if self.tilemap:
            return self.tilemap.is_solid(pixel_x, pixel_y)
        return pixel_y >= GROUND_Y

    def _find_spawn_y(self):
        """Find ground below spawn X=80 and return snapped Y."""
        if self.tilemap:
            ground_py = self.tilemap.find_ground(80)
            if ground_py is not None:
                top = ground_py - 15
                return ((top & 0xFFFFFFF0) + 1) * ONE
        return (GROUND_Y - 15) * ONE

    def reset(self):
        """Reset to initial state. Returns state dict."""
        self.x = 80 * ONE
        self.y = self._find_spawn_y()
        self.vx = 0
        self.vy = 0
        self.on_ground = True
        self.dash = False
        self.stop = 0
        self.flip = False
        self.fall = False
        self.pattern = 0
        self.anim_counter = 0
        self.scroll_x = 0
        self.frame = 0
        self._prev_a = False

        self.dead = False
        self.cleared = False
        self.is_super = False
        self.invincible_timer = 0
        self.coins = 0
        self._ten_coin_remaining = {}
        self.log = []
        self.bouncing_blocks = []
        self.mushrooms = []
        self.coin_popups = []

        # Spawn enemies from tilemap
        self.goombas = []
        self.koopas = []
        if self.tilemap:
            for px, py in self.tilemap.goomba_spawns:
                self.goombas.append(Goomba(px, py))
            for px, py in self.tilemap.koopa_spawns:
                self.koopas.append(Koopa(px, py))

        return self.get_state()

    # ------------------------------------------
    # Goomba update (faithful to kuribo.c order:
    #   move -> gravity -> ground -> wall)
    # ------------------------------------------

    def _update_goomba(self, goomba):
        goomba.anim_counter += 1

        # 1. Position update (current velocity)
        goomba.x += goomba.vx
        goomba.y += goomba.vy

        # 2. Gravity (only when airborne, updates vy for next frame)
        if not goomba.on_ground:
            goomba.vy += GRAVITY
            if goomba.vy > FALL_SPEED_CAP:
                goomba.vy = FALL_SPEED_CAP

        # 3. Ground check (two feet points, same as Mario)
        gpx = goomba.x // ONE
        gpy = goomba.y // ONE
        goomba.on_ground = False
        if self._is_solid(gpx + 3, gpy + 15) or self._is_solid(gpx + 12, gpy + 15):
            goomba.on_ground = True

        # 4. Ground snap
        if goomba.on_ground:
            gpy = goomba.y // ONE
            goomba.y = ((gpy & 0xFFFFFFF0) + 1) * ONE
            goomba.vy = 0

        # 5. Wall check -> reverse direction (kuribo.c: spd_x *= -1)
        gpx = goomba.x // ONE
        gpy = goomba.y // ONE
        if goomba.vx < 1:
            check_x = gpx
        else:
            check_x = gpx + 15

        if self._is_solid(check_x, gpy + 12):
            tile_col = check_x // 16
            if goomba.vx <= 0:
                goomba.x = ((tile_col + 1) * 16) * ONE
            else:
                goomba.x = (tile_col * 16 - 16) * ONE
            goomba.vx *= -1

        # Off-map death
        map_h = self.tilemap.pixel_height if self.tilemap else 300
        if goomba.y // ONE > map_h + 32:
            goomba.alive = False

    def _update_goombas(self):
        screen_left = self.scroll_x // ONE
        screen_right = screen_left + SCREEN_W

        for g in self.goombas:
            if not g.alive:
                continue

            # Activation: start moving when near the visible screen
            if not g.active:
                gpx = g.x // ONE
                if gpx <= screen_right + 32 and gpx + 16 >= screen_left - 32:
                    g.active = True
                else:
                    continue

            # Squish countdown
            if g.squish_timer > 0:
                g.squish_timer -= 1
                if g.squish_timer <= 0:
                    g.alive = False
                continue

            self._update_goomba(g)

    def _check_goomba_collisions(self):
        mpx = self.x // ONE
        mpy = self.y // ONE
        mh = 31 if self.is_super else 15  # Mario sprite height - 1

        for g in self.goombas:
            if not g.alive or g.squish_timer > 0 or not g.active:
                continue

            gpx = g.x // ONE
            gpy = g.y // ONE

            if not (mpx + 13 > gpx + 2 and mpx + 2 < gpx + 13 and
                    mpy + mh > gpy and mpy < gpy + 15):
                continue

            # Stomp: Mario's feet near Goomba's top (position-based)
            # Real SMB allows stomping when Mario is above enemy,
            # regardless of vertical velocity direction
            if mpy + mh - 7 <= gpy:
                g.squish_timer = GOOMBA_SQUISH_FRAMES
                g.vx = 0
                self.vy = STOMP_BOUNCE
                self.on_ground = False
            else:
                self._take_damage()
                return

    # ------------------------------------------
    # Koopa update
    # ------------------------------------------

    def _update_koopa(self, k):
        if k.kick_grace > 0:
            k.kick_grace -= 1

        if k.state == Koopa.SHELL_IDLE:
            k.shell_timer += 1
            if k.shell_timer >= KOOPA_REVIVE_FRAMES:
                k.state = Koopa.WALKING
                k.vx = -KOOPA_WALK_SPEED
                k.shell_timer = 0
            # Still apply gravity/ground while idle
            k.y += k.vy
            if not k.on_ground:
                k.vy += GRAVITY
                if k.vy > FALL_SPEED_CAP:
                    k.vy = FALL_SPEED_CAP
            kpx = k.x // ONE
            kpy = k.y // ONE
            k.on_ground = False
            if self._is_solid(kpx + 3, kpy + 15) or self._is_solid(kpx + 12, kpy + 15):
                k.on_ground = True
            if k.on_ground:
                k.y = ((kpy & 0xFFFFFFF0) + 1) * ONE
                k.vy = 0
            return

        k.anim_counter += 1

        # Movement (same order as kuribo.c: move -> gravity -> ground -> wall)
        k.x += k.vx
        k.y += k.vy

        if not k.on_ground:
            k.vy += GRAVITY
            if k.vy > FALL_SPEED_CAP:
                k.vy = FALL_SPEED_CAP

        kpx = k.x // ONE
        kpy = k.y // ONE
        k.on_ground = False
        if self._is_solid(kpx + 3, kpy + 15) or self._is_solid(kpx + 12, kpy + 15):
            k.on_ground = True

        if k.on_ground:
            kpy = k.y // ONE
            k.y = ((kpy & 0xFFFFFFF0) + 1) * ONE
            k.vy = 0

        # Wall check
        kpx = k.x // ONE
        kpy = k.y // ONE
        if k.vx < 1:
            check_x = kpx
        else:
            check_x = kpx + 15
        if self._is_solid(check_x, kpy + 12):
            tile_col = check_x // 16
            if k.vx <= 0:
                k.x = ((tile_col + 1) * 16) * ONE
            else:
                k.x = (tile_col * 16 - 16) * ONE
            k.vx *= -1  # Reverse (walking or shell)

        # Off-map death
        map_h = self.tilemap.pixel_height if self.tilemap else 300
        if k.y // ONE > map_h + 32:
            k.alive = False

    def _update_koopas(self):
        screen_left = self.scroll_x // ONE
        screen_right = screen_left + SCREEN_W

        for k in self.koopas:
            if not k.alive:
                continue
            if not k.active:
                kpx = k.x // ONE
                if kpx <= screen_right + 32 and kpx + 16 >= screen_left - 32:
                    k.active = True
                else:
                    continue
            self._update_koopa(k)

    def _check_koopa_collisions(self):
        mpx = self.x // ONE
        mpy = self.y // ONE
        mh = 31 if self.is_super else 15

        for k in self.koopas:
            if not k.alive or not k.active:
                continue
            kpx = k.x // ONE
            kpy = k.y // ONE

            if not (mpx + 13 > kpx + 2 and mpx + 2 < kpx + 13 and
                    mpy + mh > kpy and mpy < kpy + 15):
                continue

            if k.state == Koopa.WALKING:
                if mpy + mh - 7 <= kpy:
                    # Stomp walking → shell (idle). NOT kicked yet.
                    k.state = Koopa.SHELL_IDLE
                    k.vx = 0
                    k.shell_timer = 0
                    k.kick_grace = 15  # Prevent instant re-contact kick
                    self.vy = STOMP_BOUNCE
                    self.on_ground = False
                else:
                    self._take_damage()
                    return

            elif k.state == Koopa.SHELL_IDLE:
                if mpy + mh - 7 <= kpy:
                    # Stomp idle shell → kick it in Mario's direction
                    if mpx + 8 < kpx + 8:
                        k.vx = KOOPA_SHELL_SPEED
                    else:
                        k.vx = -KOOPA_SHELL_SPEED
                    k.state = Koopa.SHELL_SLIDING
                    k.kick_grace = 10
                    self.vy = STOMP_BOUNCE
                    self.on_ground = False
                elif k.kick_grace > 0:
                    continue  # Grace period: ignore contact
                elif self.on_ground and abs(self.vx) > 30:
                    # Walking into shell on ground → kick it
                    if mpx + 8 < kpx + 8:
                        k.vx = KOOPA_SHELL_SPEED
                    else:
                        k.vx = -KOOPA_SHELL_SPEED
                    k.state = Koopa.SHELL_SLIDING
                    k.kick_grace = 10
                else:
                    # Standing still on/near shell, or rising → safe bounce
                    k.kick_grace = 15
                    self.vy = STOMP_BOUNCE
                    self.on_ground = False

            elif k.state == Koopa.SHELL_SLIDING:
                if k.kick_grace > 0:
                    continue
                if mpy + mh - 7 <= kpy:
                    # Stomp sliding shell → stop it
                    k.state = Koopa.SHELL_IDLE
                    k.vx = 0
                    k.shell_timer = 0
                    k.kick_grace = 15
                    self.vy = STOMP_BOUNCE
                    self.on_ground = False
                else:
                    self._take_damage()
                    return

    def _check_shell_enemy_collisions(self):
        """Sliding shells kill other enemies on contact."""
        for k in self.koopas:
            if not k.alive or k.state != Koopa.SHELL_SLIDING:
                continue
            kpx = k.x // ONE
            kpy = k.y // ONE

            # Shell vs Goombas
            for g in self.goombas:
                if not g.alive or g.squish_timer > 0:
                    continue
                gpx = g.x // ONE
                gpy = g.y // ONE
                if (kpx + 14 > gpx + 2 and kpx + 2 < gpx + 14 and
                        kpy + 14 > gpy + 2 and kpy + 2 < gpy + 14):
                    g.squish_timer = GOOMBA_SQUISH_FRAMES
                    g.vx = 0

            # Shell vs other Koopas
            for other in self.koopas:
                if other is k or not other.alive:
                    continue
                opx = other.x // ONE
                opy = other.y // ONE
                if (kpx + 14 > opx + 2 and kpx + 2 < opx + 14 and
                        kpy + 14 > opy + 2 and kpy + 2 < opy + 14):
                    if other.state == Koopa.SHELL_SLIDING:
                        # Two shells collide: both stop
                        other.state = Koopa.SHELL_IDLE
                        other.vx = 0
                        other.shell_timer = 0
                        k.state = Koopa.SHELL_IDLE
                        k.vx = 0
                        k.shell_timer = 0
                    else:
                        other.alive = False

    # ------------------------------------------
    # Block bounce (ported from MoveBlock.c)
    # ------------------------------------------

    def _hit_block(self, pixel_x, pixel_y):
        """Called when Mario's head hits a solid tile from below."""
        if not self.tilemap:
            return
        col = pixel_x // 16
        row = pixel_y // 16
        if row < 0 or row >= self.tilemap.rows or col < 0 or col >= self.tilemap.cols:
            return
        ch = self.tilemap.tiles[row][col]
        if ch not in HITTABLE_BLOCKS:
            return
        # Don't bounce the same block twice
        for bb in self.bouncing_blocks:
            if bb.col == col and bb.row == row:
                return

        # Super Mario breaks bricks (but not ? blocks)
        if self.is_super and ch == '#':
            self.tilemap.tiles[row][col] = '.'
            self._bump_enemies_on_block(col, row)
            self._bump_mushrooms_on_block(col, row)
            return  # Brick destroyed, no bounce

        # 10-coin brick: track remaining hits
        if ch == 'T':
            key = (row, col)
            remaining = self._ten_coin_remaining.get(key, 10)
            if remaining <= 0:
                return  # Depleted
            self._ten_coin_remaining[key] = remaining - 1
            self.coins += 1
            self.coin_popups.append(CoinPopup(col * 16, row * 16))
            # Restore to 'T' if hits remain, '!' if depleted
            restore = 'T' if remaining - 1 > 0 else '!'
            bb = BouncingBlock(col, row, ch)
            bb._restore_override = restore
            self.bouncing_blocks.append(bb)
            self.tilemap.tiles[row][col] = '.'
            self._bump_enemies_on_block(col, row)
            self._bump_mushrooms_on_block(col, row)
            return

        # Spawn items from block
        if ch in COIN_BLOCKS:
            self.coins += 1
            self.coin_popups.append(CoinPopup(col * 16, row * 16))
        elif ch in MUSHROOM_BLOCKS:
            self.mushrooms.append(Mushroom(col * 16, (row - 1) * 16))

        # Start bounce animation
        bb = BouncingBlock(col, row, ch)
        self.bouncing_blocks.append(bb)
        self.tilemap.tiles[row][col] = '.'

        # Bump enemies and mushrooms standing on this block
        self._bump_enemies_on_block(col, row)
        self._bump_mushrooms_on_block(col, row)

    def _bump_enemies_on_block(self, col, row):
        """Kill Goombas/Koopas standing on a bumped block."""
        block_left = col * 16
        block_right = (col + 1) * 16
        block_top = row * 16

        for g in self.goombas:
            if not g.alive or g.squish_timer > 0:
                continue
            gpx = g.x // ONE
            gpy = g.y // ONE
            # Enemy feet on top of this block: foot_y ~ block_top, x overlaps
            if (gpx + 12 > block_left and gpx + 3 < block_right
                    and abs(gpy + 15 - block_top) <= 4):
                g.alive = False

        for k in self.koopas:
            if not k.alive:
                continue
            kpx = k.x // ONE
            kpy = k.y // ONE
            if (kpx + 12 > block_left and kpx + 3 < block_right
                    and abs(kpy + 15 - block_top) <= 4):
                k.alive = False

    def _bump_mushrooms_on_block(self, col, row):
        """Bounce mushrooms standing on a bumped block."""
        block_left = col * 16
        block_right = (col + 1) * 16
        block_top = row * 16

        for m in self.mushrooms:
            if not m.alive or m.emerging:
                continue
            mpx = m.x // ONE
            mpy = m.y // ONE
            if (mpx + 12 > block_left and mpx + 3 < block_right
                    and abs(mpy + 15 - block_top) <= 4):
                m.vy = JUMP_VELOCITY // 2  # Bounce up
                m.on_ground = False

    def _update_bouncing_blocks(self):
        """Advance all bouncing block animations."""
        alive = []
        for bb in self.bouncing_blocks:
            bb.cnt += 1
            if bb.done:
                # Restore tile
                self.tilemap.tiles[bb.row][bb.col] = bb.restore_char
            else:
                alive.append(bb)
        self.bouncing_blocks = alive

    def _update_mushrooms(self):
        alive = []
        for m in self.mushrooms:
            if not m.alive:
                continue
            if m.emerging:
                m.emerge_cnt += 1
                m.y -= ONE  # Rise 1px per frame
                if m.done_emerging:
                    m.emerging = False
                alive.append(m)
                continue
            # Normal physics (same as Goomba)
            m.x += m.vx
            m.y += m.vy
            if not m.on_ground:
                m.vy += GRAVITY
                if m.vy > FALL_SPEED_CAP:
                    m.vy = FALL_SPEED_CAP
            mpx = m.x // ONE
            mpy = m.y // ONE
            m.on_ground = False
            if self._is_solid(mpx + 3, mpy + 15) or self._is_solid(mpx + 12, mpy + 15):
                m.on_ground = True
            if m.on_ground:
                m.y = ((mpy & 0xFFFFFFF0) + 1) * ONE
                m.vy = 0
            # Wall → reverse
            if m.vx > 0:
                if self._is_solid(mpx + 15, mpy + 8):
                    m.vx = -MUSHROOM_SPEED
            elif m.vx < 0:
                if self._is_solid(mpx, mpy + 8):
                    m.vx = MUSHROOM_SPEED
            # Off-map
            map_h = self.tilemap.pixel_height if self.tilemap else 300
            if m.y // ONE > map_h + 32:
                m.alive = False
                continue
            alive.append(m)
        self.mushrooms = alive

    def _check_mushroom_collection(self):
        mpx = self.x // ONE
        mpy = self.y // ONE
        h = 31 if self.is_super else 15
        for m in self.mushrooms:
            if not m.alive or m.emerging:
                continue
            mx = m.x // ONE
            my = m.y // ONE
            if (mpx + 14 > mx and mpx < mx + 14 and
                    mpy + h > my and mpy < my + 15):
                m.alive = False
                if not self.is_super:
                    self.is_super = True
                    # Grow: shift y up by 16px to keep feet in place
                    self.y -= 16 * ONE

    def _update_coin_popups(self):
        alive = []
        for c in self.coin_popups:
            c.cnt += 1
            if not c.done:
                alive.append(c)
        self.coin_popups = alive

    def _take_damage(self):
        """Called when Mario touches an enemy. Super → shrink, Small → die."""
        if self.invincible_timer > 0:
            return
        if self.is_super:
            self.is_super = False
            self.y += 16 * ONE  # Shrink: feet stay, top moves down
            self.invincible_timer = INVINCIBLE_FRAMES
        else:
            self.dead = True

    # ------------------------------------------
    # Main step
    # ------------------------------------------

    def _is_goal(self, pixel_x, pixel_y):
        """Check if a pixel position is on a flagpole tile."""
        if self.tilemap:
            return self.tilemap.get(pixel_x, pixel_y) == 'P'
        return False

    def step(self, inp):
        """Advance one frame with given Input. Returns state dict."""
        if self.dead or self.cleared:
            return self.get_state()

        a_trigger = inp.a and not self._prev_a
        self._prev_a = inp.a

        self.stop = 0

        # ==========================================
        # Input -> Velocity (faithful to mario.c)
        # ==========================================

        if not self.on_ground:
            accel = ACCEL_DASH if self.dash else ACCEL_WALK

            if self.vy < -BRAKE_THRESHOLD:
                if inp.a:
                    self.vy += JUMP_HOLD_BOOST

            self.vy += GRAVITY

            if self.vy > FALL_SPEED_CAP:
                self.vy = FALL_SPEED_CAP

            if inp.left:
                if self.vx > BRAKE_THRESHOLD:
                    self.stop = 1
                self.vx -= accel
            elif inp.right:
                if self.vx < -BRAKE_THRESHOLD:
                    self.stop = 1
                self.vx += accel

        else:
            if inp.b:
                self.dash = True
                accel = ACCEL_DASH
            else:
                self.dash = False
                accel = ACCEL_WALK

            if inp.left:
                if self.vx > BRAKE_THRESHOLD:
                    self.stop = 1
                    self.vx -= accel
                    if self.vx < BRAKE_THRESHOLD:
                        self.vx = 0
                self.vx -= accel
            elif inp.right:
                if self.vx < -BRAKE_THRESHOLD:
                    self.stop = 1
                    self.vx += accel
                    if self.vx > -BRAKE_THRESHOLD:
                        self.vx = 0
                self.vx += accel
            else:
                self.vx = _trunc_div(self.vx * FRICTION_NUMERATOR, ONE)
                if abs(self.vx) < SPEED_DEADZONE:
                    self.vx = 0

            if a_trigger:
                self.vy = JUMP_VELOCITY
                if abs(self.vx) >= HIGH_JUMP_THRESHOLD:
                    self.vy += HIGH_JUMP_BONUS
                if self.stop:
                    self.flip = self.vx > 0

        # Speed clamping
        max_spd = MAX_SPEED_DASH if self.dash else MAX_SPEED_WALK
        if self.vx > max_spd:
            self.vx = max_spd
        if self.vx < -max_spd:
            self.vx = -max_spd

        # Position update
        self.x += self.vx
        self.y += self.vy

        # Map boundaries
        if self.x < 0:
            self.x = 0
            if self.vx < 0:
                self.vx = 0
        if self.tilemap:
            max_x = (self.tilemap.pixel_width - 16) * ONE
            if self.x > max_x:
                self.x = max_x
                if self.vx > 0:
                    self.vx = 0

        # ==========================================
        # Tile Collision (height-dependent for Super Mario)
        # ==========================================
        px = self.x // ONE
        py = self.y // ONE
        h = 31 if self.is_super else 15       # Sprite height - 1
        wall_y = py + (24 if self.is_super else 12)  # Wall check point

        if not self.on_ground and self.vy < 0:
            self.fall = False
            for i in range(2):
                if i == 0:
                    off_x = 5 if self.flip else 9
                else:
                    off_x = 7 if self.flip else 9
                if self._is_solid(px + off_x, py):
                    self._hit_block(px + off_x, py)
                    self.vy = 0
                    break
            if self.vy < 0:
                right_blocked = self._is_solid(px + 12, py + 8)
                left_blocked = self._is_solid(px + 3, py + 8)
                if right_blocked and not left_blocked:
                    tile_col = (px + 12) // 16
                    self.x = (tile_col * 16 - 13) * ONE
                elif left_blocked and not right_blocked:
                    tile_col = (px + 3) // 16
                    self.x = ((tile_col + 1) * 16 - 3) * ONE
        else:
            prev_on_ground = self.on_ground
            self.fall = prev_on_ground
            self.on_ground = False
            if self._is_solid(px + 3, py + h) or self._is_solid(px + 12, py + h):
                self.on_ground = True
            if self.fall and not self.on_ground:
                self.fall = True
            else:
                self.fall = False

        if self.on_ground:
            pixel_y = self.y // ONE
            self.y = ((pixel_y & 0xFFFFFFF0) + 1) * ONE
            self.vy = 0

        px = self.x // ONE
        py = self.y // ONE
        wall_y = py + (24 if self.is_super else 12)
        if self.vx < 1:
            check_x = px
        else:
            check_x = px + 15
        if self._is_solid(check_x, wall_y):
            tile_col = check_x // 16
            if self.vx <= 0:
                self.x = ((tile_col + 1) * 16) * ONE
            else:
                self.x = (tile_col * 16 - 16) * ONE
            self.vx = _trunc_div(self.vx, 2)

        # ==========================================
        # Bouncing blocks
        # ==========================================
        self._update_bouncing_blocks()

        # ==========================================
        # Items
        # ==========================================
        self._update_mushrooms()
        self._check_mushroom_collection()
        self._update_coin_popups()
        if self.invincible_timer > 0:
            self.invincible_timer -= 1

        # ==========================================
        # Enemies
        # ==========================================
        self._update_goombas()
        self._update_koopas()
        self._check_goomba_collisions()
        self._check_koopa_collisions()
        self._check_shell_enemy_collisions()

        # ==========================================
        # Pit death / Goal clear
        # ==========================================
        map_h = self.tilemap.pixel_height if self.tilemap else SCREEN_H
        if self.y // ONE > map_h + 16:
            self.dead = True

        px = self.x // ONE
        py = self.y // ONE
        if (self._is_goal(px + 3, py + 8) or self._is_goal(px + 12, py + 8)):
            self.cleared = True

        # ==========================================
        # Animation (pattern selection)
        # ==========================================
        abs_vx = abs(self.vx)

        if not self.fall and not self.on_ground:
            self.pattern = 5
        elif abs_vx < 10:
            self.pattern = 0
        elif self.stop:
            self.pattern = 4
            self.flip = self.vx < 0
        else:
            self.flip = self.vx < 0
            if self.pattern == 0:
                self.pattern = 1
            anm_spd = max(abs_vx, 160)
            self.anim_counter += anm_spd
            if self.anim_counter >= MAX_SPEED_DASH * 2:
                self.anim_counter = 0
                self.pattern += 1
                if self.pattern > 3:
                    self.pattern = 1

        # ==========================================
        # Camera
        # ==========================================
        rel_x = self.x - self.scroll_x
        if rel_x > CAM_RIGHT_MARGIN:
            self.scroll_x += rel_x - CAM_RIGHT_MARGIN
        elif rel_x < CAM_LEFT_MARGIN:
            self.scroll_x += rel_x - CAM_LEFT_MARGIN
        if self.tilemap:
            max_scroll = max(0, (self.tilemap.pixel_width - SCREEN_W) * ONE)
            self.scroll_x = max(0, min(self.scroll_x, max_scroll))
        else:
            if self.scroll_x < 0:
                self.scroll_x = 0
        self.scroll_x &= 0xFFFFFF00

        self.frame += 1
        state = self.get_state()
        self.log.append({
            'frame': self.frame,
            'input': {'left': inp.left, 'right': inp.right,
                      'a': inp.a, 'b': inp.b},
            'x': state['x'], 'y': state['y'],
            'vx': state['vx'], 'vy': state['vy'],
            'on_ground': state['on_ground'],
            'dead': state['dead'], 'cleared': state['cleared'],
        })
        return state

    def get_state(self):
        """Return current state as a dict (pixel-scale, for AI scripts)."""
        return {
            'x': self.x / ONE,
            'y': self.y / ONE,
            'vx': self.vx / ONE,
            'vy': self.vy / ONE,
            'on_ground': self.on_ground,
            'dash': self.dash,
            'stop': bool(self.stop),
            'flip': self.flip,
            'fall': self.fall,
            'pattern': self.pattern,
            'scroll_x': self.scroll_x / ONE,
            'frame': self.frame,
            'dead': self.dead,
            'cleared': self.cleared,
            'goombas': [
                {'x': g.x / ONE, 'y': g.y / ONE,
                 'alive': g.alive, 'squished': g.squish_timer > 0}
                for g in self.goombas if g.alive
            ],
            'koopas': [
                {'x': k.x / ONE, 'y': k.y / ONE,
                 'alive': k.alive, 'state': k.state}
                for k in self.koopas if k.alive
            ],
            'is_super': self.is_super,
            'coins': self.coins,
            'invincible': self.invincible_timer > 0,
        }
