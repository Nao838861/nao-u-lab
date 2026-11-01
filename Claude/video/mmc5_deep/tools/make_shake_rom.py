# C3 の「修正前」映像用：最新ROM（Web版の game.nes）の fine X 相殺だけを外したROMを作る。
# 固定バンク127 $F3CC の8バイトは fine X 0〜7 → 分割側CHRバンク（右へ0〜7ドットずらした絵）の表。
# 8つとも「ずらし0」のバンクにすると、分割側のBGだけが本体の fine X に引きずられて揺れる。
# Usage: python -B tools/make_shake_rom.py  → rec/roms/latest.nes, rec/roms/latest_shake.nes
import os, shutil

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
src = os.path.join(root, 'webcore/web/assets/game.nes')
out = os.path.join(root, 'rec/roms')
os.makedirs(out, exist_ok=True)
rom = bytearray(open(src, 'rb').read())
at = 16 + 127 * 8192 + (0xF3CC & 8191)
assert list(rom[at:at + 8]) == [60, 61, 64, 128, 192, 127, 191, 254], list(rom[at:at + 8])
shutil.copyfile(src, os.path.join(out, 'latest.nes'))
rom[at:at + 8] = bytes([60]) * 8
open(os.path.join(out, 'latest_shake.nes'), 'wb').write(rom)
print('ok')
