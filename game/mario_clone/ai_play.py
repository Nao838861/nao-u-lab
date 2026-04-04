"""Mario 1-1 AI Player Script

Reactive agent with tile lookahead.
Tall obstacles (>2 tiles) need early jumps at full dash speed.
Short walls need late jumps. Pits need medium-early jumps.
"""

from api import MarioAPI
from tilemap import Tilemap, SOLID_TILES

GOAL_X = 3168


def obstacle_height(tm, col):
    """How many tiles tall is the obstacle at this column above ground (row 13)?"""
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
    """Look ahead. Returns (type, distance, height) or None."""
    col = int(x) // 16
    offset = int(x) % 16

    for dc in range(1, 10):
        c = col + dc
        if c >= tm.cols:
            break
        dist = dc * 16 - offset

        # Pit
        if not (tm.tiles[13][c] in SOLID_TILES if 13 < tm.rows else True):
            return ('pit', dist, 0)

        # Wall/pipe
        h = obstacle_height(tm, c)
        if h > 0:
            return ('wall', dist, h)

    return None


def nearest_enemy(state):
    mx = state['x']
    best = None
    for g in state.get('goombas', []):
        if g['alive'] and not g.get('squished'):
            d = g['x'] - mx
            if 0 < d < 160 and (best is None or d < best):
                best = d
    for k in state.get('koopas', []):
        if k['alive']:
            d = k['x'] - mx
            if 0 < d < 160 and (best is None or d < best):
                best = d
    return best


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

        while not game.done:
            x = state['x']
            vx = abs(state['vx'])

            if x > max_x + 1:
                max_x = x
                stuck = 0
            else:
                stuck += 1

            want_jump = False
            jump_hold = 16

            if state['on_ground'] and hold_a == 0:
                ed = nearest_enemy(state)
                obs = scan(tm, x)

                # 1) Enemy ahead: stomp jump
                if ed is not None and ed < 40 + vx * 6:
                    want_jump = True
                    jump_hold = 10  # Short stomp

                # 2) Pit: medium-early jump
                elif obs and obs[0] == 'pit':
                    d = obs[1]
                    threshold = 24 + vx * 12
                    if d < threshold:
                        want_jump = True
                        jump_hold = 18

                # 3) Tall wall (3+ tiles, pipes): jump EARLY at full height
                elif obs and obs[0] == 'wall' and obs[2] >= 3:
                    d = obs[1]
                    threshold = 40 + vx * 12
                    if d < threshold:
                        want_jump = True
                        jump_hold = 20  # Maximum hold

                # 4) Short wall (1-2 tiles): jump late, short arc
                elif obs and obs[0] == 'wall' and obs[2] >= 1:
                    d = obs[1]
                    threshold = 16 + vx * 5
                    if d < threshold:
                        want_jump = True
                        jump_hold = 10

                # 5) End stairs
                elif 2900 < x < 3180:
                    want_jump = True
                    jump_hold = 16

                # 6) Stuck recovery
                elif stuck > 30:
                    want_jump = True
                    jump_hold = 20
                    stuck = 0

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

    print('\nFailed. Best x=%.0f / %.0f' % (best_x, GOAL_X))
    return False


if __name__ == '__main__':
    run()
