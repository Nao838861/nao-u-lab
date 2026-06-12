from pathlib import Path
from collections import deque
import csv
import math

import numpy as np
from PIL import Image, ImageDraw

FRAMES = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_frames")
OUT = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_analysis")
Y0, Y1 = 85, 245


def components(mask):
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    for sy in range(h):
        for sx in range(w):
            if not mask[sy, sx] or seen[sy, sx]:
                continue
            q = deque([(sx, sy)])
            seen[sy, sx] = True
            xs, ys = [], []
            while q:
                x, y = q.popleft()
                xs.append(x)
                ys.append(y)
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((nx, ny))
            yield np.array(xs), np.array(ys)


blobs = []
for p in sorted(FRAMES.glob("frame_*.png")):
    frame_no = int(p.stem.split("_")[1])
    if not (94 <= frame_no <= 165):
        continue
    img = Image.open(p).convert("RGB")
    arr = np.asarray(img)
    roi = arr[Y0:Y1, :, :]
    r = roi[:, :, 0].astype(np.int16)
    g = roi[:, :, 1].astype(np.int16)
    b = roi[:, :, 2].astype(np.int16)
    # Big forward sprites are saturated pink/orange with bright highlights.
    pink = (r > 165) & (b > 115) & (g < 180)
    orange = (r > 175) & (g > 80) & (g < 190) & (b < 155)
    white_hot = (r > 210) & (g > 180) & (b > 150)
    mask = pink | orange | white_hot

    for xs, ys in components(mask):
        area = len(xs)
        if area < 25 or area > 2600:
            continue
        minx, maxx = int(xs.min()), int(xs.max())
        miny, maxy = int(ys.min() + Y0), int(ys.max() + Y0)
        w, h = maxx - minx + 1, maxy - miny + 1
        if w < 5 or h < 5 or w > 95 or h > 105:
            continue
        cx, cy = float(xs.mean()), float(ys.mean() + Y0)
        if cy < 95 or cy > 238:
            continue
        # Exclude player body fragments: too central around player colors and
        # not large oval-like enough. Keep broad; we will inspect.
        if area < 90 and w < 15 and h < 15:
            continue
        blobs.append({
            "frame": frame_no,
            "time": 34.0 + (frame_no - 1) / 29.97,
            "cx": cx,
            "cy": cy,
            "w": w,
            "h": h,
            "area": area,
        })

# Greedy temporal tracks for large blobs. This is intentionally simple because
# there are only a few visible forward sprites in the clip.
tracks = []
for b in sorted(blobs, key=lambda x: (x["frame"], -x["area"])):
    best = None
    best_cost = 9999
    for tr in tracks:
        last = tr[-1]
        df = b["frame"] - last["frame"]
        if df <= 0 or df > 8:
            continue
        dist = abs(b["cx"] - last["cx"]) + abs(b["cy"] - last["cy"]) * 0.7
        # Permit growth; prefer continuity.
        if dist < best_cost and dist < 70:
            best = tr
            best_cost = dist
    if best is None:
        tracks.append([b])
    else:
        best.append(b)

tracks = [tr for tr in tracks if len(tr) >= 2 or max(x["area"] for x in tr) >= 250]
tracks.sort(key=lambda tr: (tr[0]["frame"], -max(x["area"] for x in tr)))

with (OUT / "big_blob_tracks.csv").open("w", encoding="utf-8", newline="") as f:
    fields = ["track", "frame", "time", "cx", "cy", "w", "h", "area"]
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for ti, tr in enumerate(tracks):
        for b in tr:
            row = {"track": ti, **b}
            w.writerow({k: (round(v, 3) if isinstance(v, float) else v) for k, v in row.items()})

with (OUT / "big_blob_summary.txt").open("w", encoding="utf-8") as f:
    for ti, tr in enumerate(tracks):
        first, last = tr[0], tr[-1]
        mx = max(tr, key=lambda x: x["area"])
        f.write(
            f"track{ti}: frames={first['frame']}-{last['frame']} "
            f"time={first['time']:.3f}-{last['time']:.3f} "
            f"x={first['cx']:.1f}->{last['cx']:.1f} y={first['cy']:.1f}->{last['cy']:.1f} "
            f"area={first['area']}->{last['area']} max={mx['area']}@f{mx['frame']} "
            f"w/h={first['w']}x{first['h']}->{last['w']}x{last['h']}\n"
        )

colors = [(255, 0, 255), (255, 128, 0), (255, 255, 0), (0, 255, 255), (255, 0, 0), (0, 255, 0)]
selected = []
by_frame = {}
for ti, tr in enumerate(tracks):
    for b in tr:
        by_frame.setdefault(b["frame"], []).append((ti, b))

for frame_no in range(96, 162, 4):
    p = FRAMES / f"frame_{frame_no:04d}.png"
    if not p.exists():
        continue
    img = Image.open(p).convert("RGB")
    d = ImageDraw.Draw(img)
    for ti, b in by_frame.get(frame_no, []):
        c = colors[ti % len(colors)]
        x0 = b["cx"] - b["w"] / 2 - 3
        y0 = b["cy"] - b["h"] / 2 - 3
        x1 = b["cx"] + b["w"] / 2 + 3
        y1 = b["cy"] + b["h"] / 2 + 3
        d.rectangle((x0, y0, x1, y1), outline=c, width=2)
        d.text((x1 + 2, y0), f"T{ti} {b['area']}", fill=c)
    selected.append((frame_no, img.crop((0, 62, 320, 270))))

thumb_w, thumb_h = 160, 104
cols = 6
sheet = Image.new("RGB", (cols * thumb_w, math.ceil(len(selected) / cols) * (thumb_h + 16)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, (frame_no, im) in enumerate(selected):
    im = im.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
    x = (i % cols) * thumb_w
    y = (i // cols) * (thumb_h + 16)
    sheet.paste(im, (x, y + 16))
    d.text((x + 2, y + 2), f"f{frame_no}", fill=(255, 255, 0))
sheet.save(OUT / "big_blob_overlay.png")

print(OUT / "big_blob_tracks.csv")
print((OUT / "big_blob_summary.txt").read_text(encoding="utf-8"))
print(OUT / "big_blob_overlay.png")
