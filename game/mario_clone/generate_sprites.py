"""Generate original sprites: auto-transform GBA poses + face rewrite.

Approach C (hybrid):
  1. Read mario_original.bmp (GBA source)
  2. Auto-transform each frame:
     - Recolor palette (red→yellow, hair→brown, etc.)
     - Rewrite face: remove mustache, add big round eyes, rosy cheeks
     - Body shift down 1px for bigger head proportion
  3. Hand-draw slime enemy (replacing Goomba entirely)
"""

from PIL import Image

# --- Color palette ---
BG       = (255, 0, 255)     # Magenta transparent
HAT      = (240, 200, 40)    # Yellow hat/helmet
HAT_HI   = (255, 230, 100)   # Hat highlight
HAIR     = (100, 60, 30)     # Dark brown
SKIN     = (255, 210, 170)   # Warm skin
CHEEK    = (255, 160, 140)   # Rosy cheeks
EYE_W    = (255, 255, 255)   # Eye white
EYE_P    = (30, 20, 10)      # Pupil
VEST     = (60, 170, 80)     # Green vest
PANTS    = (100, 60, 30)     # Brown pants (= hair color)
SHOE     = (60, 35, 20)      # Dark boots

# Block palette
BLK_DARK  = (140, 90, 45)
BLK_LIGHT = (200, 160, 110)
BLK_OUTLN = (50, 35, 20)

# Slime enemy
SL_BODY  = (60, 180, 100)
SL_DARK  = (30, 120, 60)
SL_EYE_W = (255, 255, 255)
SL_EYE_P = (30, 20, 10)
SL_MOUTH = (30, 80, 40)
OUTLINE  = (30, 20, 10)

# Original colors
O_BG   = (0, 0, 0)
O_RED  = (222, 0, 0)
O_HAIR = (128, 128, 0)
O_SKIN = (255, 144, 57)
O_BRK  = (206, 77, 8)
O_BRKL = (254, 190, 181)
O_GMB  = (255, 154, 57)
O_OUTL = (0, 0, 10)


# =====================================================
# Face pixel maps: which pixels to rewrite per frame
# For normal face (frames 0,1,2,3): face is at rows 2-6
# These are relative to (frame_ox, 0)
# =====================================================

# For frames 0-3: face structure is identical (rows 2-6)
# Row 2: ....HHHSSHS.....  → keep H at left as hair, S as skin
# Row 3: ...HSHSSSHSSS... → H at col 4 and col 6 = mustache! → make skin
# Row 4: ...HSHHSSSHSSS.. → HH at col 5-6 = mustache → make skin
# Row 5: ...HHSSSSHHHH... → HH at cols 3-4 = sideburn, HHHH at cols 10-13 = back hair
# Row 6: .....SSSSSSS....

def rewrite_normal_face(out, ox):
    """Rewrite face for standing/walking frames. Removes mustache, adds cute eyes."""
    # Row 2: hair line stays, but make it HAT-adjacent
    # Row 3: remove mustache H pixels → skin
    for x, y in [(ox+3, 3), (ox+4, 3)]:  # leftmost H in row 3
        if out.getpixel((x, y)) == HAIR:
            out.putpixel((x, y), SKIN)
    # col 6 (0-indexed from frame start) in row 3 if it's hair → skin
    if out.getpixel((ox+6, 3)) == HAIR:
        out.putpixel((ox+6, 3), SKIN)
    # Row 4: middle H's are mustache
    for x in [ox+5, ox+6]:
        if out.getpixel((x, 4)) == HAIR:
            out.putpixel((x, 4), SKIN)

    # Make eyes bigger and rounder (currently no explicit eyes in original)
    # Eyes: 2x2 white + pupil at rows 4-5
    # Left eye
    out.putpixel((ox+5, 3), EYE_W)
    out.putpixel((ox+6, 3), EYE_W)
    out.putpixel((ox+5, 4), EYE_W)
    out.putpixel((ox+6, 4), EYE_P)
    # Right eye
    out.putpixel((ox+8, 3), EYE_W)
    out.putpixel((ox+9, 3), EYE_W)
    out.putpixel((ox+8, 4), EYE_W)
    out.putpixel((ox+9, 4), EYE_P)

    # Rosy cheeks (row 5)
    out.putpixel((ox+4, 5), CHEEK)
    out.putpixel((ox+10, 5), CHEEK)

    # Small smile (row 5-6, center)
    out.putpixel((ox+7, 5), SKIN)
    out.putpixel((ox+8, 5), SKIN)


def rewrite_face_frame3(out, ox):
    """Frame 3 (walk3) is shifted 1 col right."""
    # Same logic but +1 offset
    for x in [ox+4, ox+5]:
        if out.getpixel((x, 4)) == HAIR:
            out.putpixel((x, 4), SKIN)
    if out.getpixel((ox+7, 4)) == HAIR:
        out.putpixel((ox+7, 4), SKIN)
    for x in [ox+6, ox+7]:
        if out.getpixel((x, 5)) == HAIR:
            out.putpixel((x, 5), SKIN)
    # Eyes
    out.putpixel((ox+6, 4), EYE_W)
    out.putpixel((ox+7, 4), EYE_W)
    out.putpixel((ox+6, 5), EYE_W)
    out.putpixel((ox+7, 5), EYE_P)
    out.putpixel((ox+9, 4), EYE_W)
    out.putpixel((ox+10, 4), EYE_W)
    out.putpixel((ox+9, 5), EYE_W)
    out.putpixel((ox+10, 5), EYE_P)
    # Cheeks
    out.putpixel((ox+5, 6), CHEEK)
    out.putpixel((ox+11, 6), CHEEK)


def rewrite_face_brake(out, ox):
    """Frame 4 (brake) — face is flipped/rotated."""
    # Brake frame face is at rows 2-5 but mirrored
    # Row 2: ....SHSHHHHHH...  ← face is now facing left
    # Row 3: ..SSSSSSHSSHSS.. ←
    # Remove all HAIR in face zone, replace with skin where mustache was
    for y in [3, 4]:
        for x in range(ox+2, ox+14):
            if out.getpixel((x, y)) == HAIR:
                out.putpixel((x, y), SKIN)
    # Re-add hair only at proper spots (top of head)
    for x in range(ox+7, ox+13):
        if out.getpixel((x, 2)) == SKIN:
            out.putpixel((x, 2), HAIR)
    # Eyes (facing left in brake)
    out.putpixel((ox+5, 3), EYE_W)
    out.putpixel((ox+6, 3), EYE_W)
    out.putpixel((ox+5, 4), EYE_W)
    out.putpixel((ox+6, 4), EYE_P)
    out.putpixel((ox+8, 3), EYE_W)
    out.putpixel((ox+9, 3), EYE_W)
    out.putpixel((ox+8, 4), EYE_W)
    out.putpixel((ox+9, 4), EYE_P)
    # Cheeks
    out.putpixel((ox+4, 5), CHEEK)
    out.putpixel((ox+10, 5), CHEEK)


def rewrite_face_jump(out, ox):
    """Frame 5 (jump) — slightly shifted."""
    # Similar to normal but check actual positions
    for y in [4, 5]:
        for x in range(ox+4, ox+12):
            if out.getpixel((x, y)) == HAIR:
                out.putpixel((x, y), SKIN)
    # Re-add hair at top
    for x in range(ox+5, ox+9):
        out.putpixel((x, 3), HAIR)
    # Eyes
    out.putpixel((ox+6, 4), EYE_W)
    out.putpixel((ox+7, 4), EYE_W)
    out.putpixel((ox+6, 5), EYE_W)
    out.putpixel((ox+7, 5), EYE_P)
    out.putpixel((ox+9, 4), EYE_W)
    out.putpixel((ox+10, 4), EYE_W)
    out.putpixel((ox+9, 5), EYE_W)
    out.putpixel((ox+10, 5), EYE_P)
    out.putpixel((ox+5, 5), CHEEK)
    out.putpixel((ox+11, 5), CHEEK)


def recolor_body(rgb):
    """Map original body colors to new palette."""
    if rgb == O_BG:   return BG
    if rgb == O_RED:   return VEST
    if rgb == O_HAIR:  return HAIR
    if rgb == O_SKIN:  return SKIN
    return BG


def transform_player(src, out):
    """Transform all 6 player frames."""
    for fi in range(6):
        ox_src = fi * 16
        ox_dst = fi * 16

        # Step 1: Recolor all pixels
        for y in range(16):
            for x in range(16):
                rgb = src.getpixel((ox_src + x, y))
                out.putpixel((ox_dst + x, y), recolor_body(rgb))

        # Step 2: Replace hat color (was RED at top rows → yellow HAT)
        for y in range(3):  # Hat is rows 0-2 approximately
            for x in range(16):
                if out.getpixel((ox_dst + x, y)) == VEST:
                    out.putpixel((ox_dst + x, y), HAT)
        # Highlight top row of hat
        for x in range(16):
            if out.getpixel((ox_dst + x, 0)) == HAT:
                out.putpixel((ox_dst + x, 0), HAT_HI)
            if fi != 3 and out.getpixel((ox_dst + x, 1)) == HAT:
                out.putpixel((ox_dst + x, 1), HAT_HI)

        # Step 3: Lower body → pants color (VEST below row 10 → PANTS)
        for y in range(10, 16):
            for x in range(16):
                if out.getpixel((ox_dst + x, y)) == VEST:
                    out.putpixel((ox_dst + x, y), PANTS)

        # Step 4: Shoes
        for y in range(14, 16):
            for x in range(16):
                if out.getpixel((ox_dst + x, y)) == HAIR:
                    out.putpixel((ox_dst + x, y), SHOE)

        # Step 5: Rewrite face (remove mustache, add eyes/cheeks)
        if fi in (0, 1, 2):
            rewrite_normal_face(out, ox_dst)
        elif fi == 3:
            rewrite_face_frame3(out, ox_dst)
        elif fi == 4:
            rewrite_face_brake(out, ox_dst)
        elif fi == 5:
            rewrite_face_jump(out, ox_dst)


def recolor_block(rgb):
    if rgb == O_BG:   return BG
    if rgb == O_BRK:  return BLK_DARK
    if rgb == O_BRKL: return BLK_LIGHT
    if rgb == O_OUTL: return BLK_OUTLN
    if rgb == O_GMB:  return BLK_DARK
    return BG


def draw_slime(out, ox, oy, squished=False):
    """Hand-draw a cute slime enemy."""
    # Clear
    for y in range(16):
        for x in range(16):
            out.putpixel((ox + x, oy + y), BG)

    if squished:
        # Flat splat
        shape = [(9, 3, 12), (10, 2, 13), (11, 1, 14), (12, 1, 14), (13, 2, 13)]
        for y, xs, xe in shape:
            for x in range(xs, xe + 1):
                out.putpixel((ox + x, oy + y), SL_BODY if y < 12 else SL_DARK)
        # Eyes
        out.putpixel((ox+4, oy+10), SL_EYE_W)
        out.putpixel((ox+5, oy+10), SL_EYE_P)
        out.putpixel((ox+10, oy+10), SL_EYE_W)
        out.putpixel((ox+11, oy+10), SL_EYE_P)
        # Outline
        for y, xs, xe in shape:
            out.putpixel((ox+xs, oy+y), OUTLINE)
            out.putpixel((ox+xe, oy+y), OUTLINE)
        for x in range(3, 13):
            out.putpixel((ox+x, oy+9), OUTLINE)
            out.putpixel((ox+x, oy+13), OUTLINE)
        return

    # Standing blob
    shape = [
        (2, 6, 9), (3, 4, 11), (4, 3, 12), (5, 3, 12),
        (6, 2, 13), (7, 2, 13), (8, 2, 13), (9, 1, 14),
        (10, 1, 14), (11, 1, 14), (12, 2, 13), (13, 3, 12),
    ]
    for y, xs, xe in shape:
        for x in range(xs, xe + 1):
            c = SL_DARK if y >= 10 else SL_BODY
            out.putpixel((ox + x, oy + y), c)

    # Eyes: 3x2 white with 2px pupil
    for dy in range(2):
        for dx in range(3):
            out.putpixel((ox + 4 + dx, oy + 5 + dy), SL_EYE_W)
            out.putpixel((ox + 9 + dx, oy + 5 + dy), SL_EYE_W)
    out.putpixel((ox+5, oy+6), SL_EYE_P)
    out.putpixel((ox+6, oy+6), SL_EYE_P)
    out.putpixel((ox+10, oy+6), SL_EYE_P)
    out.putpixel((ox+11, oy+6), SL_EYE_P)

    # Cute mouth
    out.putpixel((ox+7, oy+8), SL_MOUTH)
    out.putpixel((ox+8, oy+8), SL_MOUTH)

    # Outline
    for y, xs, xe in shape:
        out.putpixel((ox + xs, oy + y), OUTLINE)
        out.putpixel((ox + xe, oy + y), OUTLINE)
    for x in range(6, 10):
        out.putpixel((ox + x, oy + 1), OUTLINE)
    for x in range(4, 12):
        out.putpixel((ox + x, oy + 2), OUTLINE)
    for x in range(3, 13):
        out.putpixel((ox + x, oy + 13), OUTLINE)


def main():
    src = Image.open('assets/mario_original.bmp').convert('RGB')
    out = Image.new('RGB', (128, 64), BG)

    # Player frames
    transform_player(src, out)

    # Blocks (row 0, cols 6-7)
    for col in [6, 7]:
        for y in range(16):
            for x in range(16):
                rgb = src.getpixel((col * 16 + x, y))
                out.putpixel((col * 16 + x, y), recolor_block(rgb))

    # Slime (row 1, cols 6-7)
    draw_slime(out, 6 * 16, 16, squished=False)
    draw_slime(out, 7 * 16, 16, squished=True)

    # Save
    out_p = out.quantize(colors=64)
    out_p.save('assets/mario.bmp')
    print('Generated assets/mario.bmp (128x64)')


if __name__ == '__main__':
    main()
