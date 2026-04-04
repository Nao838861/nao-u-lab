"""Generate original sprite sheet by re-coloring the GBA sprite poses.

Preserves the exact silhouette, poses, and animation of the original
mario.bmp, but replaces the color palette to create a distinct character.

Original palette → New palette:
  (222,  0,  0) red hat/shirt  → (40,100,200) blue hat/jacket
  (128,128,  0) hair/shoes     → (80, 60, 40) brown hair/boots
  (255,144, 57) skin           → (240,200,160) lighter skin
  (255,154, 57) goomba orange  → (100,160, 60) green (mushroomish enemy)
  (206, 77,  8) brick brown    → (160,100, 50) warm brick
  (254,190,181) brick light    → (200,160,120) warm brick highlight
  (  0,  0, 10) block outline  → ( 40, 30, 20) dark brown outline
  (  0,  0,  0) background     → (255,  0,255) magenta (transparent)

Requires: assets/mario_original.bmp (the GBA source, kept for reference)
Outputs:  assets/mario.bmp
"""

from PIL import Image

# Exact palette mapping: old RGB → new RGB
COLOR_MAP = {
    (222,   0,   0): ( 40, 100, 200),  # Red → Blue (hat/jacket)
    (128, 128,   0): ( 80,  60,  40),  # Dark yellow → Brown (hair/boots)
    (255, 144,  57): (240, 200, 160),  # Skin → Lighter warm skin
    (255, 154,  57): (100, 160,  60),  # Goomba orange → Forest green
    (206,  77,   8): (160, 100,  50),  # Brick dark → Warm brown
    (254, 190, 181): (200, 160, 120),  # Brick light → Warm highlight
    (  0,   0,  10): ( 40,  30,  20),  # Near-black outline → Dark brown
    (  0,   0,   0): (255,   0, 255),  # Black bg → Magenta (transparent)
}


def main():
    src = Image.open('assets/mario_original.bmp').convert('RGB')
    w, h = src.size

    dst = Image.new('RGB', (w, h))

    for y in range(h):
        for x in range(w):
            rgb = src.getpixel((x, y))
            new_rgb = COLOR_MAP.get(rgb, rgb)
            dst.putpixel((x, y), new_rgb)

    # Save as palette BMP
    dst_p = dst.quantize(colors=64)
    dst_p.save('assets/mario.bmp')
    print(f'Generated assets/mario.bmp ({w}x{h})')

    # Verify
    check = Image.open('assets/mario.bmp')
    print(f'Verify: {check.size}, mode={check.mode}')
    print(f'Transparent color (0,0): {check.getpixel((0,0))} → palette[{check.getpixel((0,0))}]')


if __name__ == '__main__':
    main()
