"""Mario Clone - Human Play Entry Point

Controls:
  Arrow keys     Move left/right
  Z / Space      Jump (A button)
  X / Shift      Dash/Run (B button)
  Escape         Quit

Run:
  cd game/mario_clone
  python play.py                 # Default test level
  python play.py assets/level_1_1.txt   # Mario 1-1
"""

import os
import pygame
import sys
from tilemap import Tilemap, DEFAULT_LEVEL
from core import MarioGame, Input
from renderer import MarioRenderer

FPS = 60


def main():
    pygame.init()

    # Load level from command-line arg or use default
    if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]):
        with open(sys.argv[1], encoding='utf-8') as f:
            level_text = f.read()
    else:
        level_text = DEFAULT_LEVEL

    tilemap = Tilemap(level_text)
    game = MarioGame(tilemap=tilemap)
    renderer = MarioRenderer()
    clock = pygame.time.Clock()

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                running = False

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

    pygame.quit()
    sys.exit()


if __name__ == '__main__':
    main()
