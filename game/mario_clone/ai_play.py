"""Mario 1-1 AI Player — clears the stage by reading tiles ahead."""

from api import MarioAPI
from tilemap import Tilemap, SOLID_TILES


def obstacle_height(tm, col):
    if col < 0 or col >= tm.cols:
        return 0
    h = 0
    for row in range(12, -1, -1):
        if tm.tiles[row][col] in SOLID_TILES:
            h = 13 - row
        else:
            break
    return h


def scan(tm, x):
    col = int(x) // 16
    offset = int(x) % 16
    for dc in range(1, 10):
        c = col + dc
        if c >= tm.cols:
            break
        dist = dc * 16 - offset
        if not (tm.tiles[13][c] in SOLID_TILES if 13 < tm.rows else True):
            return ('pit', dist, 0)
        h = obstacle_height(tm, c)
        if h > 0:
            return ('wall', dist, h)
    return None


def enemy_info(state):
    """Returns (nearest_dist, group_width) or (None, 0)."""
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
        return None, 0
    positions.sort()
    first = positions[0] - mx
    end = positions[0]
    for p in positions[1:]:
        if p - end < 24:
            end = p
        else:
            break
    return first, end - positions[0] + 16


def run():
    game = MarioAPI('assets/level_1_1.txt')
    with open('assets/level_1_1.txt', encoding='utf-8') as f:
        tm = Tilemap(f.read())

    best_x = 0

    for attempt in range(30):
        state = game.reset()
        hold_a = 0
        max_x = 0
        stuck = 0
        mode = 'run'      # 'run' | 'retreat' | 'dash'
        mode_timer = 0

        while not game.done:
            x = state['x']
            vx = abs(state['vx'])

            if x > max_x + 1:
                max_x = x
                stuck = 0
            else:
                stuck += 1

            # State machine for stuck recovery
            if mode == 'retreat':
                state = game.step(left=True, b=False, a=False)
                mode_timer -= 1
                if mode_timer <= 0:
                    mode = 'dash'
                    mode_timer = 30
                continue

            if mode == 'dash':
                state = game.step(right=True, b=True, a=False)
                mode_timer -= 1
                if mode_timer <= 0:
                    mode = 'run'
                    hold_a = 20  # Jump at full dash
                    stuck = 0
                continue

            # Normal run mode
            want_jump = False
            jump_hold = 16

            if state['on_ground'] and hold_a == 0:
                ed, ew = enemy_info(state)
                obs = scan(tm, x)

                # Enemy
                if ed is not None:
                    if ew > 32:
                        thr = 50 + vx * 12
                        if ed < thr:
                            want_jump = True
                            jump_hold = 20
                    else:
                        thr = 40 + vx * 6
                        if ed < thr:
                            want_jump = True
                            jump_hold = 12

                # Pit
                if not want_jump and obs and obs[0] == 'pit':
                    if obs[1] < 24 + vx * 12:
                        want_jump = True
                        jump_hold = 18

                # Tall wall (pipe)
                if not want_jump and obs and obs[0] == 'wall' and obs[2] >= 3:
                    if obs[1] < 40 + vx * 12:
                        want_jump = True
                        jump_hold = 20

                # Short wall
                if not want_jump and obs and obs[0] == 'wall' and obs[2] >= 1:
                    if obs[1] < 16 + vx * 5:
                        want_jump = True
                        jump_hold = 10

                # End stairs
                if not want_jump and 2900 < x < 3180:
                    want_jump = True
                    jump_hold = 16

                # Stuck: retreat and retry
                if not want_jump and stuck > 50:
                    mode = 'retreat'
                    mode_timer = 25
                    stuck = 0
                    continue

            if want_jump:
                hold_a = jump_hold

            pressing_a = hold_a > 0
            if hold_a > 0:
                hold_a -= 1

            state = game.step(right=True, b=True, a=pressing_a)

        if state['x'] > best_x:
            best_x = state['x']

        tag = 'CLEAR' if state['cleared'] else 'DEAD x=%.0f' % state['x']
        print('Attempt %2d: %s  frame=%d' % (attempt + 1, tag, state['frame']))

        if state['cleared']:
            log_path = 'logs/ai_clear.json'
            game.save_log(log_path)
            print('\n=== STAGE CLEAR! Frames: %d ===' % state['frame'])
            print('Log: %s' % log_path)
            print('Replay: python play.py --replay %s' % log_path)
            return True

    print('\nFailed. Best x=%.0f / 3168' % best_x)
    return False


if __name__ == '__main__':
    run()
