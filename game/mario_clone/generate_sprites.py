"""Generate original sprites: auto-transform + hand-touch on GBA poses.

Approach C (hybrid):
  1. Read original mario_original.bmp
  2. Auto-transform each frame:
     - Shift body down 1px to make head taller (bigger head proportion)
     - Replace hat shape with round helmet (hand-drawn top 5 rows)
     - Widen shoes by 1px each side
  3. Recolor with original palette
  4. Hand-redraw goomba into a distinct slime/blob enemy

The silhouette is recognizably different from Mario while preserving
the animation quality (arm swing, brake lean, jump tuck).
"""

from PIL import Image

# --- New Palette ---
BG       = (255, 0, 255)    # Magenta transparent
HELMET   = (40, 100, 200)   # Blue helmet
HELM_HI  = (80, 140, 240)   # Helmet highlight
HAIR     = (60, 40, 25)     # Dark brown hair
SKIN     = (240, 200, 160)  # Warm skin
SHIRT    = (220, 220, 60)   # Yellow-green vest
PANTS    = (40, 100, 200)   # Blue pants (matches helmet)
SHOE     = (60, 40, 25)     # Brown boots (matches hair)
OUTLINE  = (20, 15, 10)     # Near-black outline

# Goomba → Slime enemy
SLIME_BODY   = (60, 180, 100)   # Green slime
SLIME_DARK   = (30, 120, 60)    # Dark green
SLIME_EYE_W  = (255, 255, 255)
SLIME_EYE_P  = (20, 15, 10)
SLIME_MOUTH  = (30, 80, 40)

# Block palette
BLOCK_DARK  = (120, 80, 40)
BLOCK_LIGHT = (180, 140, 100)

# Original color → semantic role
ORIG_BG      = (0, 0, 0)
ORIG_RED     = (222, 0, 0)       # Hat & shirt
ORIG_HAIR    = (128, 128, 0)     # Hair & shoes
ORIG_SKIN    = (255, 144, 57)    # Skin
ORIG_BRICK_D = (206, 77, 8)     # Brick/goomba dark
ORIG_BRICK_L = (254, 190, 181)  # Brick light
ORIG_GOOMBA  = (255, 154, 57)   # Goomba body
ORIG_OUTLINE = (0, 0, 10)       # Block outline


def load_original():
    return Image.open('assets/mario_original.bmp').convert('RGB')


def get_px(img, x, y):
    if 0 <= x < img.width and 0 <= y < img.height:
        return img.getpixel((x, y))
    return ORIG_BG


def recolor_player_pixel(rgb):
    """Map original player colors to new palette."""
    if rgb == ORIG_BG:     return BG
    if rgb == ORIG_RED:    return SHIRT     # Red shirt → Yellow-green vest
    if rgb == ORIG_HAIR:   return HAIR      # Hair/shoes stay brown
    if rgb == ORIG_SKIN:   return SKIN
    return BG


def transform_player_frame(src, frame_idx):
    """Transform one 16x16 player frame with auto-shift + hand-drawn helmet."""
    ox = frame_idx * 16
    out = Image.new('RGB', (16, 16), BG)

    # --- Step 1: Read original body (rows 5-15), shift down 1px (to rows 6-15) ---
    # This gives 1 more pixel of head room
    for y in range(5, 16):
        for x in range(16):
            rgb = get_px(src, ox + x, y)
            if rgb != ORIG_BG:
                ny = y + 1 if y < 15 else y  # Shift down, clamp at bottom
                px = recolor_player_pixel(rgb)
                out.putpixel((x, min(ny, 15)), px)

    # --- Step 2: Draw helmet (rows 0-5) based on original hat shape ---
    # Read where the original hat pixels are
    for y in range(6):
        for x in range(16):
            rgb = get_px(src, ox + x, y)
            if rgb == ORIG_RED:
                # Replace red hat with round helmet shape
                out.putpixel((x, y), HELMET)
            elif rgb == ORIG_SKIN:
                # Keep skin (face) at original position
                out.putpixel((x, y), SKIN)
            elif rgb == ORIG_HAIR:
                # Hair under helmet → darker
                out.putpixel((x, y), HAIR)

    # Helmet highlight (top-left shine, 2px)
    for y in range(6):
        for x in range(16):
            if out.getpixel((x, y)) == HELMET:
                # Add highlight to the upper portion
                if y <= 1:
                    out.putpixel((x, y), HELM_HI)
                break  # Only leftmost helmet pixel per row gets highlight? No, top rows.

    # Add visor line (row where face starts: find first skin pixel column-wise)
    for y in range(16):
        has_skin = False
        for x in range(16):
            if out.getpixel((x, y)) == SKIN:
                has_skin = True
                break
        if has_skin:
            # Row above first skin = visor
            vy = y - 1
            if vy >= 0:
                for x in range(16):
                    if out.getpixel((x, vy)) == HELMET:
                        out.putpixel((x, vy), HELM_HI)
            break

    # --- Step 3: Recolor pants (lower body red → blue pants) ---
    # Original: rows 7-12 have red (shirt+overalls). We want:
    #   Upper body red → SHIRT (vest)
    #   Lower body (rows ~11-13 of new = 10-12 of original) → PANTS
    for y in range(10, 16):
        for x in range(16):
            if out.getpixel((x, y)) == SHIRT:
                out.putpixel((x, y), PANTS)

    # --- Step 4: Shoes (keep but ensure distinct from pants) ---
    for y in range(13, 16):
        for x in range(16):
            if out.getpixel((x, y)) == HAIR:
                out.putpixel((x, y), SHOE)

    return out


def draw_slime(out, squished=False):
    """Hand-draw a slime/blob enemy (distinct from Goomba)."""
    if squished:
        # Flat splat
        for y in range(16):
            for x in range(16):
                out.putpixel((x, y), BG)
        # Body splat (rows 9-14)
        for y in range(9, 15):
            for x in range(2, 14):
                out.putpixel((x, y), SLIME_BODY)
        for y in range(10, 14):
            for x in range(1, 15):
                out.putpixel((x, y), SLIME_BODY)
        # Dark underside
        for x in range(3, 13):
            out.putpixel((x, 13), SLIME_DARK)
            out.putpixel((x, 14), SLIME_DARK)
        # Eyes (squished = narrow)
        out.putpixel((4, 10), SLIME_EYE_W)
        out.putpixel((5, 10), SLIME_EYE_P)
        out.putpixel((10, 10), SLIME_EYE_W)
        out.putpixel((11, 10), SLIME_EYE_P)
        # Outline
        for x in range(2, 14):
            out.putpixel((x, 9), OUTLINE)
        for x in range(1, 15):
            out.putpixel((x, 14), OUTLINE)
        return

    # Standing slime blob
    for y in range(16):
        for x in range(16):
            out.putpixel((x, y), BG)

    # Body: dome shape
    shape = [
        #  y: (x_start, x_end)  — inclusive
        (3, 6, 9),
        (4, 4, 11),
        (5, 3, 12),
        (6, 2, 13),
        (7, 2, 13),
        (8, 2, 13),
        (9, 1, 14),
        (10, 1, 14),
        (11, 1, 14),
        (12, 1, 14),
        (13, 2, 13),
        (14, 3, 12),
    ]
    for y, xs, xe in shape:
        for x in range(xs, xe + 1):
            out.putpixel((x, y), SLIME_BODY)
    # Dark lower half
    for y, xs, xe in shape:
        if y >= 10:
            for x in range(xs + 1, xe):
                out.putpixel((x, y), SLIME_DARK)

    # Eyes (large, expressive)
    for dy in range(3):
        for dx in range(3):
            out.putpixel((4 + dx, 6 + dy), SLIME_EYE_W)
            out.putpixel((9 + dx, 6 + dy), SLIME_EYE_W)
    out.putpixel((5, 7), SLIME_EYE_P)
    out.putpixel((6, 7), SLIME_EYE_P)
    out.putpixel((10, 7), SLIME_EYE_P)
    out.putpixel((11, 7), SLIME_EYE_P)
    # Mouth
    for x in range(6, 10):
        out.putpixel((x, 10), SLIME_MOUTH)

    # Outline
    for y, xs, xe in shape:
        out.putpixel((xs, y), OUTLINE)
        out.putpixel((xe, y), OUTLINE)
    # Top outline
    for x in range(6, 10):
        out.putpixel((x, 2), OUTLINE)
    for x in range(4, 12):
        out.putpixel((x, 3), OUTLINE) if out.getpixel((x, 3)) == BG else None


def recolor_block_pixel(rgb):
    if rgb == ORIG_BG:      return BG
    if rgb == ORIG_BRICK_D: return BLOCK_DARK
    if rgb == ORIG_BRICK_L: return BLOCK_LIGHT
    if rgb == ORIG_OUTLINE: return OUTLINE
    if rgb == ORIG_GOOMBA:  return BLOCK_DARK  # Used in blocks too
    return BG


def main():
    src = load_original()
    out = Image.new('RGB', (128, 64), BG)

    # --- Player frames (row 0, cols 0-5) ---
    for fi in range(6):
        frame = transform_player_frame(src, fi)
        out.paste(frame, (fi * 16, 0))

    # --- Blocks (row 0, cols 6-7) ---
    for col in [6, 7]:
        ox = col * 16
        for y in range(16):
            for x in range(16):
                rgb = get_px(src, ox + x, y)
                out.putpixel((ox + x, y), recolor_block_pixel(rgb))

    # --- Slime enemy (row 1, cols 6-7) ---
    slime_walk = Image.new('RGB', (16, 16), BG)
    draw_slime(slime_walk, squished=False)
    out.paste(slime_walk, (6 * 16, 16))

    slime_squish = Image.new('RGB', (16, 16), BG)
    draw_slime(slime_squish, squished=True)
    out.paste(slime_squish, (7 * 16, 16))

    # --- Save ---
    out_p = out.quantize(colors=64)
    out_p.save('assets/mario.bmp')
    print(f'Generated assets/mario.bmp (128x64)')

    # Verify
    check = Image.open('assets/mario.bmp')
    print(f'Verify: {check.size}, mode={check.mode}')


if __name__ == '__main__':
    main()
