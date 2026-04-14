"""Mario Clone - Human Play / Replay Entry Point

Play:
  python play.py                         # Default test level
  python play.py assets/level_1_1.txt    # Mario 1-1

Replay:
  python play.py --replay run.json       # Visual replay at 60fps
  python play.py --replay run.json --speed 2  # 2x speed

Controls:
  Arrow keys     Move left/right
  Z / Space      Jump (A button)
  X / Shift      Dash/Run (B button)
  Escape         Quit

Log is auto-saved on game end to logs/ directory.
"""

import json
import os
import sys
import time
import pygame
from core import MarioGame, Input
from tilemap import Tilemap, DEFAULT_LEVEL
from renderer import MarioRenderer

FPS = 60


def ensure_log_dir():
    d = os.path.join(os.path.dirname(__file__), 'logs')
    os.makedirs(d, exist_ok=True)
    return d


def auto_log_path():
    d = ensure_log_dir()
    ts = time.strftime('%Y%m%d_%H%M%S')
    return os.path.join(d, f'run_{ts}.json')


def save_log(game, level_text, path):
    data = {
        'level': level_text,
        'result': 'cleared' if game.cleared else
                  'dead' if game.dead else 'incomplete',
        'total_frames': game.frame,
        'final_x': game.x / 256,
        'frames': game.log,
    }
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))
    return path


def play_mode(level_text):
    pygame.init()
    tilemap = Tilemap(level_text)
    game = MarioGame(tilemap=tilemap)
    renderer = MarioRenderer()
    clock = pygame.time.Clock()

    running = True
    result_timer = 0
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                running = False

        if game.dead or game.cleared:
            result_timer += 1
            # Show result for 2 seconds then quit
            if result_timer > FPS * 2:
                running = False
            # Still render but don't step
            renderer.render(game)
            clock.tick(FPS)
            continue

        keys = pygame.key.get_pressed()
        inp = Input(
            left=keys[pygame.K_LEFT],
            right=keys[pygame.K_RIGHT],
            a=keys[pygame.K_z] or keys[pygame.K_SPACE],
            b=keys[pygame.K_x] or keys[pygame.K_LSHIFT] or keys[pygame.K_RSHIFT],
        )

        game.step(inp)
        renderer.render(game)
        clock.tick(FPS)

    # Auto-save log
    log_path = auto_log_path()
    save_log(game, level_text, log_path)
    print(f"Log saved: {log_path}")
    print(f"Result: {'CLEARED' if game.cleared else 'DEAD' if game.dead else 'QUIT'}"
          f" | Frames: {game.frame} | X: {game.x / 256:.0f}")

    pygame.quit()


def replay_mode(log_path, speed=1):
    with open(log_path, encoding='utf-8') as f:
        data = json.load(f)

    pygame.init()

    level_text = data.get('level', DEFAULT_LEVEL)
    tilemap = Tilemap(level_text)
    game = MarioGame(tilemap=tilemap)
    renderer = MarioRenderer()
    pygame.display.set_caption(f"Mario Clone - Replay: {os.path.basename(log_path)}")
    clock = pygame.time.Clock()

    # Check if log has AI markers
    from target_ai import Marker as AiMarker
    has_markers = any('markers' in fr for fr in data.get('frames', [])[:10])
    if has_markers:
        pygame.display.set_caption(
            f"Mario Clone - AI Replay: {os.path.basename(log_path)}")

    frames = data['frames']
    idx = 0
    running = True
    result_timer = 0
    last_markers = []

    while running and idx < len(frames):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                running = False

        # Step through replay
        for _ in range(speed):
            if idx >= len(frames):
                break
            entry = frames[idx]
            inp = entry['input']
            game.step(Input(
                left=inp['left'], right=inp['right'],
                a=inp['a'], b=inp['b'],
            ))
            # Read markers from log if present
            if 'markers' in entry:
                last_markers = [AiMarker.from_dict(m) for m in entry['markers']]
            idx += 1

        renderer.render(game)
        if last_markers:
            renderer.draw_debug_overlays(game, last_markers)
        clock.tick(FPS)

    # Hold on result screen
    while running and result_timer < FPS * 2:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                running = False
        renderer.render(game)
        clock.tick(FPS)
        result_timer += 1

    print(f"Replay complete: {data.get('result', '?')}"
          f" | Frames: {data.get('total_frames', '?')}")
    pygame.quit()


def ai_mode(level_text, speed=1):
    """Run AI live with debug visualization."""
    from api import MarioAPI
    from target_ai import TargetAI

    pygame.init()
    api = MarioAPI()
    # Reload with specified level
    if level_text != DEFAULT_LEVEL:
        api._level_text = level_text
        api._tm = Tilemap(level_text)
        api._game = MarioGame(tilemap=api._tm)
    state = api.reset()
    tm = api._tm
    game = api._game
    ai = TargetAI()

    renderer = MarioRenderer()
    pygame.display.set_caption("Mario Clone - AI Debug")
    clock = pygame.time.Clock()

    running = True
    result_timer = 0
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                running = False

        if game.dead or game.cleared:
            result_timer += 1
            if result_timer > FPS * 3:
                running = False
            renderer.render(game)
            clock.tick(FPS)
            continue

        for _ in range(speed):
            if game.dead or game.cleared:
                break
            result = ai.update(state, game, tm)
            inp = result['input']
            state = api.step(**inp)
            # Inject markers into the frame log for replay
            if game.log:
                game.log[-1]['markers'] = [m.to_dict() for m in result.get('markers', [])]

        # Trajectory prediction: use AI's nav trajectories + standard ones
        trajectories = {}
        if not game.dead and not game.cleared:
            from trajectory import predict
            trajectories['current'] = predict(game, tm, frames=60)
            trajectories['jump'] = predict(game, tm, frames=60,
                                           override_jump=True, inp_a=True)
            trajectories['walk_jump'] = predict(game, tm, frames=60,
                                                override_jump=True, inp_a=True,
                                                inp_b=False)
            # Merge AI's nav trajectories (nav_dash, nav_walk)
            ai_traj = result.get('trajectories', {})
            trajectories.update(ai_traj)

        renderer.render(game)
        markers = result.get('markers', []) if not game.dead else []
        renderer.draw_debug_overlays(game, markers, trajectories)
        clock.tick(FPS)

    # Save log
    log_dir = os.path.join(os.path.dirname(__file__), 'logs', 'hierarchical_ai')
    os.makedirs(log_dir, exist_ok=True)
    api.save_log(os.path.join(log_dir, 'last_target_ai.json'))

    res = 'CLEARED' if game.cleared else 'DEAD' if game.dead else 'QUIT'
    print(f"{res} | Frames: {game.frame} | X: {game.x / 256:.0f} | Coins: {game.coins}")
    print(f"Replay: python play.py --replay logs/hierarchical_ai/last_target_ai.json")
    pygame.quit()


def main():
    args = sys.argv[1:]

    # Parse --replay, --speed, --ai
    replay_path = None
    speed = 1
    level_arg = None
    run_ai = False
    i = 0
    while i < len(args):
        if args[i] == '--replay' and i + 1 < len(args):
            replay_path = args[i + 1]
            i += 2
        elif args[i] == '--speed' and i + 1 < len(args):
            speed = int(args[i + 1])
            i += 2
        elif args[i] == '--ai':
            run_ai = True
            i += 1
        else:
            level_arg = args[i]
            i += 1

    level_text = DEFAULT_LEVEL
    if level_arg and os.path.isfile(level_arg):
        with open(level_arg, encoding='utf-8') as f:
            level_text = f.read()

    if replay_path:
        replay_mode(replay_path, speed)
    elif run_ai:
        ai_mode(level_text, speed)
    else:
        play_mode(level_text)


if __name__ == '__main__':
    main()
