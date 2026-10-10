"""Copy and crop still images / audio previews from the MonoSH_FX2 repository into public/.

Only the project's own art is used: the 2bpp monochrome art, its palette-colored version, and the 4bpp
16-color art. Columns that show frames of the original arcade recording are not copied.
Usage: python tools/prep_assets.py <MonoSH_FX2 clone> <4bpp comparison dir>
"""
import shutil, subprocess, sys
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
fx2 = Path(sys.argv[1])
img4 = Path(sys.argv[2])
out = root / 'public/img'
out.mkdir(parents=True, exist_ok=True)
(root / 'public/audio').mkdir(parents=True, exist_ok=True)

art = fx2 / 'game/v001/assets/bg_color'
for n in ('00', '03', '04', '13', '14', '31'):
    mono = Image.open(art / f'{n}.png').convert('RGBA')
    color = Image.open(art / f'{n}_color.png').convert('RGBA')
    # monochrome art: index 0 transparent, 1..3 grey levels
    pal = Image.open(art / f'{n}.png')
    idx = list(pal.getdata())
    lv = {0: (0, 0, 0, 0), 1: (0, 0, 0, 255), 2: (170, 170, 170, 255), 3: (255, 255, 255, 255)}
    m = Image.new('RGBA', pal.size)
    m.putdata([lv.get(i, (255, 0, 255, 255)) for i in idx])
    m.save(out / f'art_{n}_mono.png')
    color.save(out / f'art_{n}_color.png')

shutil.copy(fx2 / 'game/v001/results/shadow_grass_20261009/comparison.png', out / 'shadow_grass.png')

# 4bpp 16-color art: right half of each 256x220 cell in materials.png (left half is the recording cutout)
mat = Image.open(img4 / 'cutouts_20261009_materials.png').convert('RGB')
cells = {'00': (0, 0), '02': (2, 0), '03': (3, 0), '04': (0, 1), '12': (2, 1), '13': (3, 1), '14': (0, 2), '05': (1, 2)}
for name, (cx, cy) in cells.items():
    box = (cx * 256 + 128, cy * 220 + 18, cx * 256 + 256, cy * 220 + 218)
    c = mat.crop(box).convert('RGBA')
    px = c.load()
    bg = px[0, c.height - 1]
    for y in range(c.height):
        for x in range(c.width):
            if px[x, y][:3] == bg[:3]:
                px[x, y] = (0, 0, 0, 0)
    bb = c.getbbox()
    c.crop(bb).save(out / f'art4_{name}.png')

audio = fx2 / 'game/v001/results'
shutil.copy(audio / 'native_audio_20261008/bgm_preview.mp3', root / 'public/audio/bgm_v1.mp3')
shutil.copy(audio / 'native_audio_v2_20261009/bgm_preview.mp3', root / 'public/audio/bgm_v2.mp3')
shutil.copy(audio / 'native_audio_v2_20261009/bgm_preview.mp3', root / 'public/audio/bgm.mp3')
shutil.copy(audio / 'native_audio_v2_20261009/se_explosion_chain.mp3', root / 'public/audio/se_chain.mp3')
print('ok')
