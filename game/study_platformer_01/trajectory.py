"""Trajectory prediction — lightweight physics simulation for lookahead.

Predicts Mario's path for N frames given current state + input,
without modifying the actual game state.

Usage:
    from trajectory import predict
    # Current input trajectory (60 frames)
    path = predict(game, tilemap, frames=60)
    # "What if I jump now?" trajectory
    jump_path = predict(game, tilemap, frames=60, override_jump=True)
"""

from core import (ONE, ACCEL_WALK, ACCEL_DASH, MAX_SPEED_WALK, MAX_SPEED_DASH,
                  GRAVITY, JUMP_VELOCITY, HIGH_JUMP_BONUS, HIGH_JUMP_THRESHOLD,
                  JUMP_HOLD_BOOST, FALL_SPEED_CAP, BRAKE_THRESHOLD,
                  FRICTION_NUMERATOR, SPEED_DEADZONE, _trunc_div)
from tilemap import SOLID_TILES


def predict(game, tilemap, frames=60, override_jump=False,
            inp_left=None, inp_right=None, inp_a=None, inp_b=None):
    """Simulate Mario's trajectory for `frames` steps.

    Args:
        game: MarioGame instance (read-only — state is copied).
        tilemap: Tilemap for collision checks.
        frames: How many frames to simulate.
        override_jump: If True, press A on the first frame (predict a jump).
        inp_left/right/a/b: Override inputs. None = keep last real input.

    Returns:
        List of (pixel_x, pixel_y) positions, one per frame.
    """
    # Copy essential state
    x = game.x
    y = game.y
    vx = game.vx
    vy = game.vy
    on_ground = game.on_ground
    dash = game.dash
    is_super = game.is_super
    prev_a = game._prev_a

    # Determine base input from last frame
    log = game.log
    if log:
        last_inp = log[-1]['input']
        base_left = last_inp['left'] if inp_left is None else inp_left
        base_right = last_inp['right'] if inp_right is None else inp_right
        base_a = last_inp['a'] if inp_a is None else inp_a
        base_b = last_inp['b'] if inp_b is None else inp_b
    else:
        base_left = False if inp_left is None else inp_left
        base_right = True if inp_right is None else inp_right
        base_a = False if inp_a is None else inp_a
        base_b = True if inp_b is None else inp_b

    h = 31 if is_super else 15
    path = []

    for i in range(frames):
        # Input for this frame
        a_in = True if (override_jump and i == 0) else base_a
        left = base_left
        right = base_right
        b_in = base_b

        a_trigger = a_in and not prev_a
        prev_a = a_in

        # ── Physics (mirrors core.py step) ──
        if not on_ground:
            accel = ACCEL_DASH if dash else ACCEL_WALK
            if vy < -BRAKE_THRESHOLD and a_in:
                vy += JUMP_HOLD_BOOST
            vy += GRAVITY
            if vy > FALL_SPEED_CAP:
                vy = FALL_SPEED_CAP
            if left:
                vx -= accel
            elif right:
                vx += accel
        else:
            if b_in:
                dash = True; accel = ACCEL_DASH
            else:
                dash = False; accel = ACCEL_WALK
            if left:
                if vx > BRAKE_THRESHOLD:
                    vx -= accel
                    if vx < BRAKE_THRESHOLD:
                        vx = 0
                vx -= accel
            elif right:
                if vx < -BRAKE_THRESHOLD:
                    vx += accel
                    if vx > -BRAKE_THRESHOLD:
                        vx = 0
                vx += accel
            else:
                vx = _trunc_div(vx * FRICTION_NUMERATOR, ONE)
                if abs(vx) < SPEED_DEADZONE:
                    vx = 0
            if a_trigger:
                vy = JUMP_VELOCITY
                if abs(vx) >= HIGH_JUMP_THRESHOLD:
                    vy += HIGH_JUMP_BONUS

        # Speed clamp
        max_spd = MAX_SPEED_DASH if dash else MAX_SPEED_WALK
        if vx > max_spd: vx = max_spd
        if vx < -max_spd: vx = -max_spd

        # Position update
        x += vx
        y += vy
        if x < 0:
            x = 0; vx = 0

        # ── Tile collision (simplified) ──
        px = x // ONE
        py = y // ONE

        # Head collision (rising)
        if not on_ground and vy < 0:
            for off_x in (9, 5):
                check_col = (px + off_x) // 16
                check_row = py // 16
                if (0 <= check_row < tilemap.rows and 0 <= check_col < tilemap.cols
                        and tilemap.tiles[check_row][check_col] in SOLID_TILES):
                    vy = 0
                    break
            # Side wall push
            if vy < 0:
                wall_py = py + 8
                rx = (px + 12) // 16
                lx = (px + 3) // 16
                rr = wall_py // 16
                r_blocked = (0 <= rr < tilemap.rows and 0 <= rx < tilemap.cols
                             and tilemap.tiles[rr][rx] in SOLID_TILES)
                l_blocked = (0 <= rr < tilemap.rows and 0 <= lx < tilemap.cols
                             and tilemap.tiles[rr][lx] in SOLID_TILES)
                if r_blocked and not l_blocked:
                    tc = rx
                    x = (tc * 16 - 13) * ONE
                elif l_blocked and not r_blocked:
                    tc = lx
                    x = ((tc + 1) * 16 - 3) * ONE

        # Ground detection
        on_ground = False
        foot_py = (y // ONE) + h
        for off_x in (3, 12):
            fc = (px + off_x) // 16
            fr = foot_py // 16
            if (0 <= fr < tilemap.rows and 0 <= fc < tilemap.cols
                    and tilemap.tiles[fr][fc] in SOLID_TILES):
                on_ground = True
                break
        if on_ground:
            pixel_y = y // ONE
            y = ((pixel_y & 0xFFFFFFF0) + 1) * ONE
            vy = 0

        # Wall collision
        px = x // ONE
        py = y // ONE
        wall_y_pos = py + (24 if is_super else 12)
        check_x = px if vx < 1 else px + 15
        wc = check_x // 16
        wr = wall_y_pos // 16
        if (0 <= wr < tilemap.rows and 0 <= wc < tilemap.cols
                and tilemap.tiles[wr][wc] in SOLID_TILES):
            if vx <= 0:
                x = ((wc + 1) * 16) * ONE
            else:
                x = (wc * 16 - 16) * ONE
            vx = _trunc_div(vx, 2)

        # Death check (fell off screen)
        if y // ONE > tilemap.rows * 16 + 32:
            path.append((x / ONE, y / ONE))
            break

        path.append((x / ONE, y / ONE))

    return path
