# C3 の「8種類のCHR」の図：修正後の実画面からミニマップ（x=195〜）を切り出し、
# タイル5枚ぶんの枠の中で右へ 0〜7 ドットずらした絵を public/gen/finex_v{n}.png に書く。
# ROM 内では断片に分かれて置かれているため、画面の絵から作った説明用の図。
# Usage: python -B tools/finex_variants.py
import subprocess, tempfile, os
from PIL import Image

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out = os.path.join(root, 'public', 'gen')
os.makedirs(out, exist_ok=True)
with tempfile.TemporaryDirectory() as td:
    png = os.path.join(td, 'f.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '1', '-i', os.path.join(root, 'public/video/pan_latest.mp4'),
                    '-frames:v', '1', '-vf', 'scale=256:240:flags=neighbor', png], check=True)
    im = Image.open(png).convert('RGB')
art = im.crop((195, 176, 222, 208))  # ミニマップ本体（左端 x=195）
for n in range(8):
    v = Image.new('RGB', (40, 32), (0, 0, 0))  # x=192 から5タイル
    v.paste(art, (3 + n, 0))
    v.save(os.path.join(out, f'finex_v{n}.png'))
print('ok')
