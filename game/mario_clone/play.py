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

    frames = data['frames']
    idx = 0
    running = True
    result_timer = 0

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
            idx += 1

        renderer.render(game)
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


def main():
    args = sys.argv[1:]

    # Parse --replay and --speed
    replay_path = None
    speed = 1
    level_arg = None
    i = 0
    while i < len(args):
        if args[i] == '--replay' and i + 1 < len(args):
            replay_path = args[i + 1]
            i += 2
        elif args[i] == '--speed' and i + 1 < len(args):
            speed = int(args[i + 1])
            i += 2
        else:
            level_arg = args[i]
            i += 1

    if replay_path:
        replay_mode(replay_path, speed)
    else:
        if level_arg and os.path.isfile(level_arg):
            with open(level_arg, encoding='utf-8') as f:
                level_text = f.read()
        else:
            level_text = DEFAULT_LEVEL
        play_mode(level_text)


if __name__ == '__main__':
    main()
