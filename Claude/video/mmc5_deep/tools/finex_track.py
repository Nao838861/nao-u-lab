# C3：修正後の映像（pan_latest）の各フレームで、どの「ずらした絵」が選ばれているかを求める。
# 同じ視点の流し方で撮った相殺外し版（pan_latest_shake）では、ミニマップの左端が 195 − fine X に来る。
# 出力: src/data/finex_pan.json（フレームごとの fine X 0〜7）
# Usage: python -B tools/finex_track.py
import json, os
import numpy as np

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
a = np.fromfile(os.path.join(root, 'rec/pan_latest_shake/frames.rgb'), dtype=np.uint8).reshape(-1, 240, 256, 3)
out, prev = [], 0
for fr in a:
    m = fr.max(axis=2)[176:208, 176:256] > 60
    cols = np.where(m.any(0))[0]
    x = 176 + int(cols.min()) if len(cols) else -1
    fine = 195 - x if 188 <= x <= 195 else prev
    out.append(fine)
    prev = fine
json.dump(out, open(os.path.join(root, 'src/data/finex_pan.json'), 'w'))
print(len(out), out[:24])
