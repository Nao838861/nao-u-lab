from api import MarioAPI
from hierarchical_ai import (observe_terrain, observe_enemies, observe_mushrooms,
                             generate_plans, select_plan, Goal)
api = MarioAPI('assets/level_1_1.txt')
state = api.reset()
tm = api._tm
goal = Goal('max_coins')
active = None
for f in range(5000):
    game = api._game
    terrain = observe_terrain(tm, state['x'], state['y'])
    enemies = observe_enemies(state)
    mushrooms = observe_mushrooms(game)
    ctx = {'state': state, 'game': game, 'terrain': terrain,
           'enemies': enemies, 'mushrooms': mushrooms}
    if active is None or active.done or not active.committed:
        plans = generate_plans(ctx)
        active, sc = select_plan(plans, ctx, goal)
    x = state['x']
    if x > 2300 and f % 5 == 0:
        es = [(e['kind'], int(e['dx'])) for e in enemies[:3]]
        print('f%d x=%d gnd=%d vy=%d active=%s commit=%s enemies=%s' % (
            f, x, state['on_ground'], state['vy'], active.name,
            active.committed, es))
    inp = active.step(ctx)
    state = api.step(**inp)
    if state['dead']:
        print('DEAD x=%d y=%d' % (state['x'], state['y']))
        break
