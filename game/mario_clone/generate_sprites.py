"""Generate original sprite sheet for Mario Clone.

Creates assets/mario.bmp with the same layout (128x64, 8x4 grid of 16x16):
  Row 0: player stand, walk1, walk2, walk3, brake, jump, used-block, brick
  Row 1: (empty x6), goomba-walk, goomba-squish

Original character: "Logi" — a blue-hatted adventurer.
All pixel art drawn programmatically, no copyrighted assets.
"""

from PIL import Image

W, H = 128, 64
TILE = 16
BG = (255, 0, 255)  # Magenta = transparent color

# Color palette — original, not Nintendo
HAT = (40, 100, 200)       # Blue hat
HAT_DARK = (20, 60, 140)   # Hat shadow
SKIN = (240, 190, 160)     # Face/hands
SKIN_DARK = (200, 150, 120)
SHIRT = (60, 180, 80)      # Green shirt
SHIRT_DARK = (30, 130, 50)
PANTS = (80, 60, 40)       # Brown pants
PANTS_DARK = (50, 35, 20)
SHOE = (60, 40, 30)        # Dark shoes
EYE = (255, 255, 255)
PUPIL = (0, 0, 0)

# Block colors
BRICK_A = (180, 100, 40)
BRICK_B = (140, 70, 25)
BRICK_MORTAR = (100, 50, 15)
USED_A = (120, 100, 80)
USED_B = (90, 70, 55)

# Goomba colors — original mushroom-like enemy
GOOMBA_BODY = (160, 80, 40)
GOOMBA_BODY_DARK = (120, 55, 25)
GOOMBA_FEET = (240, 200, 160)
GOOMBA_EYE_W = (255, 255, 255)
GOOMBA_EYE_P = (0, 0, 0)


def set_px(img, x, y, color):
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((x, y), color)


def fill_rect(img, x0, y0, w, h, color):
    for dy in range(h):
        for dx in range(w):
            set_px(img, x0 + dx, y0 + dy, color)


def draw_player(img, ox, oy, frame='stand'):
    """Draw the player character 'Logi' at offset (ox, oy).

    frame: 'stand', 'walk1', 'walk2', 'walk3', 'brake', 'jump'
    """
    # --- Hat (rows 0-4) ---
    fill_rect(img, ox + 4, oy + 0, 8, 2, HAT)
    fill_rect(img, ox + 3, oy + 2, 10, 2, HAT)
    # Hat brim
    fill_rect(img, ox + 2, oy + 4, 11, 1, HAT_DARK)

    # --- Face (rows 5-7) ---
    fill_rect(img, ox + 4, oy + 5, 8, 3, SKIN)
    # Eyes
    set_px(img, ox + 6, oy + 5, EYE)
    set_px(img, ox + 7, oy + 5, EYE)
    set_px(img, ox + 9, oy + 5, EYE)
    set_px(img, ox + 10, oy + 5, EYE)
    set_px(img, ox + 7, oy + 6, PUPIL)
    set_px(img, ox + 10, oy + 6, PUPIL)
    # Mouth
    set_px(img, ox + 7, oy + 7, SKIN_DARK)
    set_px(img, ox + 8, oy + 7, SKIN_DARK)

    # --- Body/shirt (rows 8-10) ---
    fill_rect(img, ox + 4, oy + 8, 8, 3, SHIRT)
    fill_rect(img, ox + 5, oy + 8, 6, 2, SHIRT_DARK)
    # Arms
    if frame == 'walk1' or frame == 'walk3':
        fill_rect(img, ox + 2, oy + 8, 2, 2, SKIN)
        fill_rect(img, ox + 12, oy + 9, 2, 2, SKIN)
    elif frame == 'walk2':
        fill_rect(img, ox + 3, oy + 9, 1, 2, SKIN)
        fill_rect(img, ox + 12, oy + 9, 1, 2, SKIN)
    elif frame == 'brake':
        fill_rect(img, ox + 2, oy + 7, 2, 2, SKIN)
        fill_rect(img, ox + 12, oy + 7, 2, 2, SKIN)
    elif frame == 'jump':
        fill_rect(img, ox + 2, oy + 6, 2, 2, SKIN)
        fill_rect(img, ox + 12, oy + 6, 2, 2, SKIN)
    else:  # stand
        fill_rect(img, ox + 3, oy + 9, 1, 2, SKIN)
        fill_rect(img, ox + 12, oy + 9, 1, 2, SKIN)

    # --- Pants (rows 11-12) ---
    fill_rect(img, ox + 4, oy + 11, 8, 2, PANTS)

    # --- Legs/shoes (rows 13-15) ---
    if frame == 'walk1':
        fill_rect(img, ox + 3, oy + 13, 4, 2, PANTS)
        fill_rect(img, ox + 9, oy + 13, 4, 2, PANTS)
        fill_rect(img, ox + 2, oy + 14, 4, 2, SHOE)
        fill_rect(img, ox + 10, oy + 14, 4, 2, SHOE)
    elif frame == 'walk2':
        fill_rect(img, ox + 5, oy + 13, 3, 1, PANTS)
        fill_rect(img, ox + 8, oy + 13, 3, 1, PANTS)
        fill_rect(img, ox + 4, oy + 14, 4, 2, SHOE)
        fill_rect(img, ox + 8, oy + 14, 4, 2, SHOE)
    elif frame == 'walk3':
        fill_rect(img, ox + 4, oy + 13, 3, 2, PANTS)
        fill_rect(img, ox + 9, oy + 13, 3, 2, PANTS)
        fill_rect(img, ox + 3, oy + 14, 4, 2, SHOE)
        fill_rect(img, ox + 9, oy + 14, 4, 2, SHOE)
    elif frame == 'brake':
        fill_rect(img, ox + 3, oy + 13, 4, 1, PANTS)
        fill_rect(img, ox + 9, oy + 13, 4, 1, PANTS)
        fill_rect(img, ox + 2, oy + 14, 5, 2, SHOE)
        fill_rect(img, ox + 9, oy + 14, 5, 2, SHOE)
    elif frame == 'jump':
        # Tucked legs
        fill_rect(img, ox + 4, oy + 11, 3, 2, PANTS)
        fill_rect(img, ox + 9, oy + 11, 3, 2, PANTS)
        fill_rect(img, ox + 3, oy + 13, 4, 2, SHOE)
        fill_rect(img, ox + 9, oy + 13, 4, 2, SHOE)
    else:  # stand
        fill_rect(img, ox + 4, oy + 13, 3, 1, PANTS)
        fill_rect(img, ox + 9, oy + 13, 3, 1, PANTS)
        fill_rect(img, ox + 4, oy + 14, 3, 2, SHOE)
        fill_rect(img, ox + 9, oy + 14, 3, 2, SHOE)


def draw_used_block(img, ox, oy):
    fill_rect(img, ox, oy, 16, 16, USED_A)
    # Border
    for i in range(16):
        set_px(img, ox + i, oy, USED_B)
        set_px(img, ox + i, oy + 15, USED_B)
        set_px(img, ox, oy + i, USED_B)
        set_px(img, ox + 15, oy + i, USED_B)
    # Inner cross
    fill_rect(img, ox + 2, oy + 2, 12, 12, USED_B)
    fill_rect(img, ox + 3, oy + 3, 10, 10, USED_A)


def draw_brick(img, ox, oy):
    fill_rect(img, ox, oy, 16, 16, BRICK_A)
    # Mortar lines
    for i in range(16):
        set_px(img, ox + i, oy + 7, BRICK_MORTAR)
    for y in range(0, 7):
        set_px(img, ox + 3, oy + y, BRICK_MORTAR)
        set_px(img, ox + 11, oy + y, BRICK_MORTAR)
    for y in range(8, 16):
        set_px(img, ox + 7, oy + y, BRICK_MORTAR)
    # Shade
    fill_rect(img, ox + 1, oy + 1, 2, 6, BRICK_B)
    fill_rect(img, ox + 5, oy + 1, 2, 6, BRICK_B)
    fill_rect(img, ox + 9, oy + 1, 2, 6, BRICK_B)


def draw_goomba(img, ox, oy, squished=False):
    if squished:
        # Flat pancake
        fill_rect(img, ox + 1, oy + 10, 14, 4, GOOMBA_BODY)
        fill_rect(img, ox + 2, oy + 11, 12, 2, GOOMBA_BODY_DARK)
        # Eyes (flat)
        set_px(img, ox + 4, oy + 10, GOOMBA_EYE_W)
        set_px(img, ox + 5, oy + 10, GOOMBA_EYE_P)
        set_px(img, ox + 10, oy + 10, GOOMBA_EYE_W)
        set_px(img, ox + 11, oy + 10, GOOMBA_EYE_P)
        # Feet
        fill_rect(img, ox + 2, oy + 14, 5, 2, GOOMBA_FEET)
        fill_rect(img, ox + 9, oy + 14, 5, 2, GOOMBA_FEET)
        return

    # Head (mushroom cap)
    fill_rect(img, ox + 2, oy + 1, 12, 5, GOOMBA_BODY)
    fill_rect(img, ox + 1, oy + 3, 14, 4, GOOMBA_BODY)
    fill_rect(img, ox + 3, oy + 2, 10, 3, GOOMBA_BODY_DARK)
    # Eyes
    fill_rect(img, ox + 3, oy + 6, 3, 3, GOOMBA_EYE_W)
    fill_rect(img, ox + 10, oy + 6, 3, 3, GOOMBA_EYE_W)
    set_px(img, ox + 5, oy + 7, GOOMBA_EYE_P)
    set_px(img, ox + 10, oy + 7, GOOMBA_EYE_P)
    # Mouth
    fill_rect(img, ox + 6, oy + 8, 4, 1, GOOMBA_BODY_DARK)
    # Body
    fill_rect(img, ox + 4, oy + 9, 8, 3, GOOMBA_BODY)
    fill_rect(img, ox + 5, oy + 10, 6, 2, GOOMBA_BODY_DARK)
    # Feet
    fill_rect(img, ox + 2, oy + 12, 5, 4, GOOMBA_FEET)
    fill_rect(img, ox + 9, oy + 12, 5, 4, GOOMBA_FEET)
    fill_rect(img, ox + 3, oy + 14, 3, 2, GOOMBA_BODY_DARK)
    fill_rect(img, ox + 10, oy + 14, 3, 2, GOOMBA_BODY_DARK)


def main():
    img = Image.new('RGB', (W, H), BG)

    # Row 0: Player frames
    frames = ['stand', 'walk1', 'walk2', 'walk3', 'brake', 'jump']
    for i, frame in enumerate(frames):
        draw_player(img, i * TILE, 0, frame)

    # Row 0, col 6: Used block
    draw_used_block(img, 6 * TILE, 0)

    # Row 0, col 7: Brick
    draw_brick(img, 7 * TILE, 0)

    # Row 1, col 6: Goomba walk
    draw_goomba(img, 6 * TILE, TILE, squished=False)

    # Row 1, col 7: Goomba squish
    draw_goomba(img, 7 * TILE, TILE, squished=True)

    # Convert to palette mode with index 0 = transparent (black)
    img_p = img.quantize(colors=64)

    # Save
    img_p.save('assets/mario.bmp')
    print(f'Generated assets/mario.bmp ({W}x{H})')

    # Verify
    check = Image.open('assets/mario.bmp')
    print(f'Verify: {check.size}, mode={check.mode}')


if __name__ == '__main__':
    main()
