"""Mario Clone - Pygame Renderer

Sprite sheet: 128x64 BMP, 16x16 frames in an 8x4 grid.
  Row 0: 0:stand  1-3:walk  4:brake  5:jump  6:used-block  7:brick
  Row 1: ...  6:goomba-walk  7:goomba-squish
"""

import os
import pygame
from core import SCREEN_W, SCREEN_H, GROUND_Y, ONE

SCALE = 3
WINDOW_W = SCREEN_W * SCALE
WINDOW_H = SCREEN_H * SCALE

# Colors
SKY_COLOR = (92, 148, 252)
GROUND_COLOR_FALLBACK = (192, 96, 0)
GROUND_TOP_FALLBACK = (0, 176, 0)

# NES pipe colors
PIPE_LIGHT = (128, 208, 16)
PIPE_DARK = (0, 168, 0)
PIPE_OUTLINE = (0, 0, 0)

# Sprite sheet layout
FRAME_SIZE = 16
COLS = 8
NUM_MARIO_PATTERNS = 6


class MarioRenderer:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_W, WINDOW_H))
        pygame.display.set_caption("Mario Clone")
        self.internal = pygame.Surface((SCREEN_W, SCREEN_H))

        sheet, transparent_color = self._load_sheet()
        self.mario_frames = self._extract_mario_frames(sheet, transparent_color)
        self.tile_sprites = self._build_tile_sprites(sheet, transparent_color)
        self.goomba_walk, self.goomba_walk_flip, self.goomba_squish = \
            self._load_goomba_sprites(sheet, transparent_color)
        self.koopa_walk, self.koopa_walk_flip, self.koopa_shell = \
            self._make_koopa_sprites()
        self.overlay_font = pygame.font.Font(None, 24)

    def _load_sheet(self):
        path = os.path.join(os.path.dirname(__file__), 'assets', 'mario.bmp')
        try:
            sheet = pygame.image.load(path).convert()
            tc = sheet.get_at((0, 0))
            return sheet, tc
        except Exception:
            return None, (0, 0, 0)

    def _extract_mario_frames(self, sheet, tc):
        frames = []
        if sheet:
            for i in range(NUM_MARIO_PATTERNS):
                sx = (i % COLS) * FRAME_SIZE
                sy = (i // COLS) * FRAME_SIZE
                frame = sheet.subsurface((sx, sy, FRAME_SIZE, FRAME_SIZE)).copy()
                frame.set_colorkey(tc)
                frames.append(frame)
        else:
            colors = [(228, 0, 0), (228, 60, 0), (228, 120, 0),
                      (228, 60, 0), (228, 228, 0), (0, 228, 0)]
            for color in colors:
                f = pygame.Surface((FRAME_SIZE, FRAME_SIZE), pygame.SRCALPHA)
                pygame.draw.rect(f, color, (2, 0, 12, 16))
                pygame.draw.rect(f, (0, 0, 0), (2, 0, 12, 16), 1)
                frames.append(f)
        return frames

    def _build_tile_sprites(self, sheet, tc):
        tiles = {}
        FS = FRAME_SIZE

        # From sprite sheet
        if sheet:
            f6 = sheet.subsurface((6 * FS, 0, FS, FS)).copy()
            f6.set_colorkey(tc)
            tiles['!'] = f6
            f7 = sheet.subsurface((7 * FS, 0, FS, FS)).copy()
            f7.set_colorkey(tc)
            tiles['#'] = f7

        # Ground '='
        ground = pygame.Surface((FS, FS))
        ground.fill((192, 96, 0))
        pygame.draw.rect(ground, (160, 72, 0), (0, 0, 16, 16), 1)
        pygame.draw.line(ground, (160, 72, 0), (0, 8), (15, 8))
        pygame.draw.line(ground, (160, 72, 0), (4, 0), (4, 7))
        pygame.draw.line(ground, (160, 72, 0), (12, 0), (12, 7))
        pygame.draw.line(ground, (160, 72, 0), (0, 8), (0, 15))
        pygame.draw.line(ground, (160, 72, 0), (8, 8), (8, 15))
        tiles['='] = ground

        # Question block '?'
        q = pygame.Surface((FS, FS))
        q.fill((255, 200, 0))
        pygame.draw.rect(q, (200, 150, 0), (0, 0, 16, 16), 1)
        pygame.draw.rect(q, (220, 170, 0), (1, 1, 14, 14), 1)
        font = pygame.font.Font(None, 16)
        txt = font.render('?', True, (0, 0, 0))
        q.blit(txt, ((16 - txt.get_width()) // 2, (16 - txt.get_height()) // 2))
        tiles['?'] = q

        # Staircase 'X' — same as ground but slightly different shade
        stair = pygame.Surface((FS, FS))
        stair.fill((180, 80, 8))
        pygame.draw.rect(stair, (140, 60, 4), (0, 0, 16, 16), 1)
        pygame.draw.line(stair, (140, 60, 4), (0, 8), (15, 8))
        pygame.draw.line(stair, (140, 60, 4), (8, 0), (8, 7))
        pygame.draw.line(stair, (140, 60, 4), (4, 8), (4, 15))
        pygame.draw.line(stair, (140, 60, 4), (12, 8), (12, 15))
        tiles['X'] = stair

        # Pipe top-left '['
        ptl = pygame.Surface((FS, FS))
        ptl.fill(PIPE_LIGHT)
        pygame.draw.rect(ptl, PIPE_OUTLINE, (0, 0, 16, 2))      # Top edge
        pygame.draw.rect(ptl, PIPE_OUTLINE, (0, 0, 2, 16))      # Left edge
        pygame.draw.rect(ptl, PIPE_DARK, (2, 8, 6, 8))          # Shade
        tiles['['] = ptl

        # Pipe top-right ']'
        ptr = pygame.Surface((FS, FS))
        ptr.fill(PIPE_LIGHT)
        pygame.draw.rect(ptr, PIPE_OUTLINE, (0, 0, 16, 2))      # Top edge
        pygame.draw.rect(ptr, PIPE_OUTLINE, (14, 0, 2, 16))     # Right edge
        pygame.draw.rect(ptr, PIPE_DARK, (8, 8, 6, 8))          # Shade
        tiles[']'] = ptr

        # Pipe body-left '{'
        pbl = pygame.Surface((FS, FS))
        pbl.fill(PIPE_LIGHT)
        pygame.draw.rect(pbl, PIPE_OUTLINE, (0, 0, 2, 16))      # Left edge
        pygame.draw.rect(pbl, SKY_COLOR, (0, 0, 2, 16))         # Sky at very edge
        pygame.draw.rect(pbl, PIPE_OUTLINE, (2, 0, 1, 16))      # Inner left edge
        pygame.draw.rect(pbl, PIPE_DARK, (3, 8, 5, 8))          # Shade
        tiles['{'] = pbl

        # Pipe body-right '}'
        pbr = pygame.Surface((FS, FS))
        pbr.fill(PIPE_LIGHT)
        pygame.draw.rect(pbr, PIPE_OUTLINE, (14, 0, 2, 16))
        pygame.draw.rect(pbr, SKY_COLOR, (14, 0, 2, 16))
        pygame.draw.rect(pbr, PIPE_OUTLINE, (13, 0, 1, 16))
        pygame.draw.rect(pbr, PIPE_DARK, (8, 8, 5, 8))
        tiles['}'] = pbr

        # Flagpole 'P'
        pole = pygame.Surface((FS, FS), pygame.SRCALPHA)
        pygame.draw.rect(pole, PIPE_LIGHT, (7, 0, 2, 16))
        pygame.draw.rect(pole, PIPE_OUTLINE, (6, 0, 1, 16))
        pygame.draw.rect(pole, PIPE_OUTLINE, (9, 0, 1, 16))
        tiles['P'] = pole

        # Aliases: special bricks render same as '#'
        for alias in ('c', 'm', 's', 'T'):
            if '#' in tiles:
                tiles[alias] = tiles['#']

        # Mushroom question block 'Q' renders same as '?'
        tiles['Q'] = tiles['?']

        # Fallbacks
        if '#' not in tiles:
            brick = pygame.Surface((FS, FS))
            brick.fill((200, 76, 12))
            pygame.draw.rect(brick, (160, 56, 8), (0, 0, 16, 16), 1)
            tiles['#'] = brick
        if '!' not in tiles:
            used = pygame.Surface((FS, FS))
            used.fill((128, 96, 64))
            pygame.draw.rect(used, (96, 64, 32), (0, 0, 16, 16), 1)
            tiles['!'] = used

        return tiles

    def _load_goomba_sprites(self, sheet, tc):
        if sheet:
            walk = sheet.subsurface((6 * FRAME_SIZE, 1 * FRAME_SIZE,
                                     FRAME_SIZE, FRAME_SIZE)).copy()
            walk.set_colorkey(tc)
            walk_flip = pygame.transform.flip(walk, True, False)
            squish = sheet.subsurface((7 * FRAME_SIZE, 1 * FRAME_SIZE,
                                       FRAME_SIZE, FRAME_SIZE)).copy()
            squish.set_colorkey(tc)
        else:
            walk = pygame.Surface((FRAME_SIZE, FRAME_SIZE), pygame.SRCALPHA)
            pygame.draw.ellipse(walk, (160, 100, 20), (1, 4, 14, 12))
            pygame.draw.rect(walk, (0, 0, 0), (1, 4, 14, 12), 1)
            walk_flip = pygame.transform.flip(walk, True, False)
            squish = pygame.Surface((FRAME_SIZE, FRAME_SIZE), pygame.SRCALPHA)
            pygame.draw.rect(squish, (160, 100, 20), (1, 10, 14, 6))
            pygame.draw.rect(squish, (0, 0, 0), (1, 10, 14, 6), 1)
        return walk, walk_flip, squish

    def _make_koopa_sprites(self):
        """Generate Koopa Troopa sprites programmatically (NES-style green turtle)."""
        FS = FRAME_SIZE

        # Walking Koopa
        walk = pygame.Surface((FS, FS), pygame.SRCALPHA)
        # Shell body
        pygame.draw.ellipse(walk, PIPE_DARK, (1, 4, 14, 10))
        pygame.draw.ellipse(walk, PIPE_LIGHT, (3, 5, 10, 6))
        pygame.draw.ellipse(walk, (0, 0, 0), (1, 4, 14, 10), 1)
        # Head
        pygame.draw.circle(walk, (252, 188, 176), (12, 3), 3)
        pygame.draw.circle(walk, (252, 252, 252), (13, 2), 2)
        pygame.draw.circle(walk, (0, 0, 0), (14, 2), 1)
        pygame.draw.circle(walk, (0, 0, 0), (12, 3), 3, 1)
        # Feet
        pygame.draw.rect(walk, (252, 188, 176), (3, 13, 4, 3))
        pygame.draw.rect(walk, (252, 188, 176), (9, 13, 4, 3))
        pygame.draw.rect(walk, (0, 0, 0), (3, 13, 4, 3), 1)
        pygame.draw.rect(walk, (0, 0, 0), (9, 13, 4, 3), 1)

        walk_flip = pygame.transform.flip(walk, True, False)

        # Shell (compact, no head/feet)
        shell = pygame.Surface((FS, FS), pygame.SRCALPHA)
        pygame.draw.ellipse(shell, PIPE_DARK, (1, 3, 14, 11))
        pygame.draw.ellipse(shell, PIPE_LIGHT, (3, 4, 10, 7))
        pygame.draw.ellipse(shell, (0, 0, 0), (1, 3, 14, 11), 1)
        # Shell markings
        pygame.draw.line(shell, (0, 0, 0), (5, 8), (11, 8), 1)

        return walk, walk_flip, shell

    def render(self, game):
        surf = self.internal
        scroll_px = game.scroll_x // ONE

        # Sky
        surf.fill(SKY_COLOR)

        # Tiles (static)
        if game.tilemap:
            self._draw_tilemap(surf, game.tilemap, scroll_px)
        else:
            pygame.draw.rect(surf, GROUND_TOP_FALLBACK,
                             (0, GROUND_Y, SCREEN_W, 2))
            pygame.draw.rect(surf, GROUND_COLOR_FALLBACK,
                             (0, GROUND_Y + 2, SCREEN_W, SCREEN_H - GROUND_Y - 2))

        # Bouncing blocks (sprites replacing temporarily deleted tiles)
        for bb in game.bouncing_blocks:
            bsx = bb.col * 16 - scroll_px
            bsy = bb.row * 16 + bb.y_offset
            if -16 <= bsx <= SCREEN_W:
                # Use the original block's tile sprite
                ch = bb.original_char
                tile_surf = self.tile_sprites.get(ch)
                if tile_surf:
                    surf.blit(tile_surf, (bsx, bsy))

        # Goombas
        for g in game.goombas:
            if not g.alive:
                continue
            gsx = g.x // ONE - scroll_px
            gsy = g.y // ONE
            if gsx < -16 or gsx > SCREEN_W:
                continue
            if g.squish_timer > 0:
                surf.blit(self.goomba_squish, (gsx, gsy))
            else:
                if g.anim_counter & 0x08:
                    surf.blit(self.goomba_walk, (gsx, gsy))
                else:
                    surf.blit(self.goomba_walk_flip, (gsx, gsy))

        # Koopas
        from core import Koopa, KOOPA_SHAKE_START
        for k in game.koopas:
            if not k.alive:
                continue
            ksx = k.x // ONE - scroll_px
            ksy = k.y // ONE
            if ksx < -16 or ksx > SCREEN_W:
                continue
            if k.state == Koopa.WALKING:
                if k.vx >= 0:
                    surf.blit(self.koopa_walk, (ksx, ksy))
                else:
                    surf.blit(self.koopa_walk_flip, (ksx, ksy))
            else:
                # Shell: shake before revive
                shake = 0
                if k.state == Koopa.SHELL_IDLE and k.shell_timer >= KOOPA_SHAKE_START:
                    shake = 1 if (k.shell_timer // 4) % 2 == 0 else -1
                surf.blit(self.koopa_shell, (ksx + shake, ksy))

        # Mario (skip if off-screen from pit death)
        mario_sx = game.x // ONE - scroll_px
        mario_sy = game.y // ONE
        if mario_sy < SCREEN_H:
            ptn = min(game.pattern, len(self.mario_frames) - 1)
            sprite = self.mario_frames[ptn]
            if game.flip:
                sprite = pygame.transform.flip(sprite, True, False)
            surf.blit(sprite, (mario_sx, mario_sy))

        # Status overlay
        if game.dead:
            self._draw_overlay(surf, "GAME OVER", (200, 0, 0))
        elif game.cleared:
            self._draw_overlay(surf, "COURSE CLEAR!", (255, 255, 255))

        # Scale to window
        pygame.transform.scale(surf, (WINDOW_W, WINDOW_H), self.screen)
        pygame.display.flip()

    def _draw_overlay(self, surf, text, color):
        txt = self.overlay_font.render(text, True, color)
        bg = pygame.Surface((txt.get_width() + 8, txt.get_height() + 4))
        bg.fill((0, 0, 0))
        bg.set_alpha(180)
        bx = (SCREEN_W - bg.get_width()) // 2
        by = SCREEN_H // 2 - bg.get_height() // 2
        surf.blit(bg, (bx, by))
        surf.blit(txt, (bx + 4, by + 2))

    def _draw_tilemap(self, surf, tilemap, scroll_px):
        start_col = max(0, scroll_px // 16)
        end_col = min(tilemap.cols, (scroll_px + SCREEN_W) // 16 + 1)

        for row in range(tilemap.rows):
            for col in range(start_col, end_col):
                ch = tilemap.tiles[row][col]
                if ch == '.':
                    continue
                tile_surf = self.tile_sprites.get(ch)
                if tile_surf is None:
                    continue
                surf.blit(tile_surf, (col * 16 - scroll_px, row * 16))
