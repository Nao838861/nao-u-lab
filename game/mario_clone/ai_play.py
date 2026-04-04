"""Mario Clone — Generic AI Player with Iterative Learning

Reads only the current game state (tile lookahead, enemy positions).
No hardcoded level knowledge. After each death, analyzes the log to
identify failure cause and adjusts parameters.

Every 10 cycles: saves checkpoint (params + best replay + stats).
"""

import json
import os
import time
from api import MarioAPI
from tilemap import Tilemap, SOLID_TILES
from core import ONE


# ===================================================================
# Generic state-based decision functions (no level-specific knowledge)
# ===================================================================

def scan_ground_ahead(tm, x, y):
    """Scan tiles ahead from Mario's current position.

    Returns list of (distance_px, type, height) for obstacles found.
    type: 'pit' | 'wall'
    height: number of solid tiles above ground (for walls)
    """
    col = int(x) // 16
    mario_row = int(y) // 16
    offset = int(x) % 16
    results = []

    for dc in range(1, 12):
        c = col + dc
        if c < 0 or c >= tm.cols:
            continue
        dist = dc * 16 - offset

        # Pit: no ground at bottom rows
        is_ground = False
        for r in range(tm.rows - 2, tm.rows):
            if r < tm.rows and tm.tiles[r][c] in SOLID_TILES:
                is_ground = True
                break
        if not is_ground:
            results.append((dist, 'pit', 0))
            continue

        # Wall: solid tile at or above Mario's row
        h = 0
        for row in range(tm.rows - 3, -1, -1):
            if tm.tiles[row][c] in SOLID_TILES:
                h = (tm.rows - 2) - row  # Height above ground
            else:
                break
        if h > 0 and (tm.rows - 2 - h) <= mario_row + 1:
            results.append((dist, 'wall', h))

    return results


def get_enemies_ahead(state):
    """Get sorted list of (distance, width_hint) for enemy groups ahead."""
    mx = state['x']
    positions = []

    for g in state.get('goombas', []):
        if g['alive'] and not g.get('squished'):
            d = g['x'] - mx
            if 0 < d < 200:
                positions.append(g['x'])

    for k in state.get('koopas', []):
        if k['alive']:
            d = k['x'] - mx
            if 0 < d < 200:
                positions.append(k['x'])

    if not positions:
        return []

    positions.sort()

    # Group nearby enemies
    groups = []
    group_start = positions[0]
    group_end = positions[0]
    for p in positions[1:]:
        if p - group_end < 24:
            group_end = p
        else:
            groups.append((group_start - mx, group_end - group_start + 16))
            group_start = p
            group_end = p
    groups.append((group_start - mx, group_end - group_start + 16))

    return groups  # [(distance, group_width), ...]


# ===================================================================
# Strategy parameters (tunable, adjusted by learning loop)
# ===================================================================

DEFAULT_PARAMS = {
    # Enemy reaction: jump when enemy is within this distance
    'enemy_react_base': 15,     # Start weak — too close to enemy
    'enemy_react_vx_mult': 3,   # Barely accounts for speed
    'enemy_jump_hold': 6,       # Short jump — may not clear
    'enemy_group_jump_hold': 10,  # Insufficient for wide groups
    'enemy_group_width_thr': 32,  # Width threshold for "group"

    # Pit reaction
    'pit_react_base': 10,       # Almost no advance warning
    'pit_react_vx_mult': 4,
    'pit_jump_hold': 10,        # Low jump — may not clear gap

    # Tall wall (3+ tiles, pipes)
    'tall_wall_react_base': 15,
    'tall_wall_react_vx_mult': 4,
    'tall_wall_jump_hold': 12,
    'tall_wall_height_thr': 3,

    # Short wall (1-2 tiles)
    'short_wall_react_base': 8,
    'short_wall_react_vx_mult': 3,
    'short_wall_jump_hold': 6,

    # Stuck recovery
    'stuck_threshold': 60,       # Slow to notice stuck
    'retreat_frames': 25,
    'dash_buildup_frames': 30,
}


def decide_jump(state, tm, params):
    """Decide whether to jump and for how long. Returns jump_hold or 0."""
    if not state['on_ground']:
        return 0

    x = state['x']
    vx = abs(state['vx'])
    p = params

    # 1) Enemies
    groups = get_enemies_ahead(state)
    if groups:
        dist, width = groups[0]
        if width > p['enemy_group_width_thr']:
            thr = p['enemy_react_base'] + 15 + vx * p['enemy_react_vx_mult']
            if dist < thr:
                return p['enemy_group_jump_hold']
        else:
            thr = p['enemy_react_base'] + vx * p['enemy_react_vx_mult']
            if dist < thr:
                return p['enemy_jump_hold']

    # 2) Terrain
    obstacles = scan_ground_ahead(tm, x, state['y'])
    for dist, otype, height in obstacles:
        if otype == 'pit':
            thr = p['pit_react_base'] + vx * p['pit_react_vx_mult']
            if dist < thr:
                return p['pit_jump_hold']
            break  # Only react to nearest pit

        if otype == 'wall':
            if height >= p['tall_wall_height_thr']:
                thr = p['tall_wall_react_base'] + vx * p['tall_wall_react_vx_mult']
                if dist < thr:
                    return p['tall_wall_jump_hold']
            else:
                thr = p['short_wall_react_base'] + vx * p['short_wall_react_vx_mult']
                if dist < thr:
                    return p['short_wall_jump_hold']
            break  # Only react to nearest wall

    return 0


# ===================================================================
# Death analysis — examine log to determine failure cause
# ===================================================================

def analyze_death(log_frames, tm):
    """Analyze the frame log to determine why Mario died.

    Returns: dict with 'cause', 'x', 'details'
    """
    if not log_frames:
        return {'cause': 'unknown', 'x': 0, 'details': ''}

    last = log_frames[-1]
    x = last['x']
    y = last['y']
    col = int(x) // 16

    # Pit death: y > map bottom
    map_h = tm.rows * 16
    if y > map_h - 16:
        return {'cause': 'pit', 'x': x, 'details': f'Fell at col {col}'}

    # Check if stuck (last 60 frames barely moved)
    if len(log_frames) > 60:
        recent_xs = [f['x'] for f in log_frames[-60:]]
        travel = max(recent_xs) - min(recent_xs)
        if travel < 5:
            return {'cause': 'stuck', 'x': x, 'details': f'Stuck at col {col}'}

    # Otherwise enemy contact
    return {'cause': 'enemy', 'x': x, 'details': f'Hit enemy at col {col}'}


def adjust_params(params, death_info, history):
    """Adjust parameters based on death analysis.

    If dying at the same x for 4+ cycles in a row, apply a random
    perturbation to escape the local minimum. Otherwise, increase.
    """
    import random
    p = dict(params)
    cause = death_info['cause']
    dx = death_info['x']

    # Detect plateau: same cause + same x for 4+ recent cycles
    recent_same = sum(1 for h in history[-6:]
                      if abs(h['x'] - dx) < 30 and h['cause'] == cause)
    plateau = recent_same >= 4

    if plateau:
        # Random perturbation to escape plateau
        for key in p:
            if isinstance(p[key], (int, float)) and key not in (
                    'enemy_group_width_thr', 'tall_wall_height_thr',
                    'retreat_frames', 'dash_buildup_frames'):
                delta = random.uniform(-0.15, 0.15) * max(abs(p[key]), 5)
                p[key] = max(5, p[key] + delta)
                if isinstance(params[key], int):
                    p[key] = int(round(p[key]))
        return p

    # Normal incremental adjustment
    if cause == 'pit':
        p['pit_react_base'] = min(p['pit_react_base'] + 3, 50)
        p['pit_react_vx_mult'] = min(p['pit_react_vx_mult'] + 1, 16)
        p['pit_jump_hold'] = min(p['pit_jump_hold'] + 2, 22)

    elif cause == 'enemy':
        p['enemy_react_base'] = min(p['enemy_react_base'] + 2, 55)
        p['enemy_react_vx_mult'] = min(p['enemy_react_vx_mult'] + 0.5, 12)
        p['enemy_jump_hold'] = min(p['enemy_jump_hold'] + 1, 18)
        p['enemy_group_jump_hold'] = min(p['enemy_group_jump_hold'] + 1, 22)

    elif cause == 'stuck':
        p['tall_wall_react_base'] = min(p['tall_wall_react_base'] + 3, 55)
        p['tall_wall_react_vx_mult'] = min(p['tall_wall_react_vx_mult'] + 1, 14)
        p['tall_wall_jump_hold'] = min(p['tall_wall_jump_hold'] + 1, 22)
        p['short_wall_react_base'] = min(p['short_wall_react_base'] + 2, 30)
        p['short_wall_jump_hold'] = min(p['short_wall_jump_hold'] + 1, 14)
        p['stuck_threshold'] = max(p['stuck_threshold'] - 3, 20)

    return p


# ===================================================================
# Main loop
# ===================================================================

def run(level_path='assets/level_1_1.txt', max_cycles=50, checkpoint_interval=10):
    game = MarioAPI(level_path)
    with open(level_path, encoding='utf-8') as f:
        tm = Tilemap(f.read())

    log_dir = os.path.join(os.path.dirname(__file__), 'logs', 'ai_training')
    os.makedirs(log_dir, exist_ok=True)

    params = dict(DEFAULT_PARAMS)
    best_x = 0
    best_log = None
    history = []  # [{cycle, result, x, frame, cause, params}, ...]

    for cycle in range(1, max_cycles + 1):
        state = game.reset()
        hold_a = 0
        max_x = 0
        stuck = 0
        mode = 'run'
        mode_timer = 0

        max_frames = 5000  # Timeout per attempt
        while not game.done and state['frame'] < max_frames:
            x = state['x']
            vx = abs(state['vx'])

            if x > max_x + 1:
                max_x = x
                stuck = 0
            else:
                stuck += 1

            # Retreat/dash recovery
            if mode == 'retreat':
                state = game.step(left=True, b=False, a=False)
                mode_timer -= 1
                if mode_timer <= 0:
                    mode = 'dash'
                    mode_timer = params['dash_buildup_frames']
                continue

            if mode == 'dash':
                state = game.step(right=True, b=True, a=False)
                mode_timer -= 1
                if mode_timer <= 0:
                    mode = 'run'
                    hold_a = params['tall_wall_jump_hold']
                    stuck = 0
                continue

            # Decision
            if hold_a == 0:
                jump_hold = decide_jump(state, tm, params)
                if jump_hold > 0:
                    hold_a = jump_hold
                elif state['on_ground'] and stuck > params['stuck_threshold']:
                    mode = 'retreat'
                    mode_timer = params['retreat_frames']
                    stuck = 0
                    continue

            pressing_a = hold_a > 0
            if hold_a > 0:
                hold_a -= 1

            state = game.step(right=True, b=True, a=pressing_a)

        # --- Cycle complete ---
        result = 'cleared' if state['cleared'] else 'dead' if state['dead'] else 'timeout'
        death_info = {'cause': 'clear', 'x': state['x'], 'details': ''}

        if result == 'timeout':
            death_info = {'cause': 'stuck', 'x': state['x'], 'details': 'timeout'}
        elif result == 'dead':
            death_info = analyze_death(game.log, tm)

        entry = {
            'cycle': cycle,
            'result': result,
            'x': round(state['x'], 1),
            'frame': state['frame'],
            'cause': death_info['cause'],
            'params': dict(params),
        }
        history.append(entry)

        is_best = state['x'] > best_x
        if is_best:
            best_x = state['x']
            best_log = cycle

        tag = 'CLEAR!' if result == 'cleared' else 'DEAD x=%.0f (%s)' % (state['x'], death_info['cause'])
        best_mark = ' *BEST*' if is_best else ''
        print('Cycle %3d: %s  frame=%d%s' % (cycle, tag, state['frame'], best_mark))

        # Save checkpoint every N cycles
        if cycle % checkpoint_interval == 0 or result == 'cleared':
            cp_path = os.path.join(log_dir, f'checkpoint_{cycle:04d}.json')
            game.save_log(os.path.join(log_dir, f'replay_{cycle:04d}.json'))

            checkpoint = {
                'cycle': cycle,
                'best_x': round(best_x, 1),
                'best_cycle': best_log,
                'current_params': params,
                'history': history[-checkpoint_interval:],
                'summary': summarize_recent(history, checkpoint_interval),
            }
            with open(cp_path, 'w', encoding='utf-8') as f:
                json.dump(checkpoint, f, indent=2, default=str)

            print(f'  >> Checkpoint saved: {cp_path}')

        if result == 'cleared':
            game.save_log(os.path.join(log_dir, 'clear.json'))
            print(f'\n=== STAGE CLEAR at cycle {cycle}! Frames: {state["frame"]} ===')
            print(f'Replay: python play.py --replay {log_dir}/clear.json')
            break

        # Learn from failure
        params = adjust_params(params, death_info, history)

    # Final summary
    print('\n' + '=' * 50)
    print('Training summary (%d cycles):' % len(history))
    print(f'  Best distance: {best_x:.0f}px (cycle {best_log})')
    if history:
        clears = sum(1 for h in history if h['result'] == 'cleared')
        print(f'  Clears: {clears}/{len(history)}')
        # Progress by checkpoint intervals
        for i in range(0, len(history), checkpoint_interval):
            chunk = history[i:i + checkpoint_interval]
            avg_x = sum(h['x'] for h in chunk) / len(chunk)
            best_chunk = max(h['x'] for h in chunk)
            causes = {}
            for h in chunk:
                causes[h['cause']] = causes.get(h['cause'], 0) + 1
            print(f'  Cycles {i+1:3d}-{i+len(chunk):3d}: avg_x={avg_x:6.0f}  best_x={best_chunk:6.0f}  causes={causes}')


def summarize_recent(history, n):
    """Summarize the last N entries."""
    recent = history[-n:]
    if not recent:
        return {}
    return {
        'avg_x': round(sum(h['x'] for h in recent) / len(recent), 1),
        'best_x': round(max(h['x'] for h in recent), 1),
        'causes': {c: sum(1 for h in recent if h['cause'] == c)
                   for c in set(h['cause'] for h in recent)},
    }


if __name__ == '__main__':
    run()
