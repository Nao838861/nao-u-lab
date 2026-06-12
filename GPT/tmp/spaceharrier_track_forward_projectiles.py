from pathlib import Path
from collections import deque, defaultdict
import csv
import math

import numpy as np
from PIL import Image, ImageDraw

FRAMES = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_frames")
OUT = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_analysis")
OUT.mkdir(parents=True, exist_ok=True)

# Approximate X columns found from the enemy-body pass.
TARGETS = {
    "right": {"x": 267, "start": 94, "end": 125},
    "center": {"x": 167, "start": 108, "end": 142},
    "left": {"x": 64, "start": 124, "end": 160},
}

Y0, Y1 = 82, 238


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


rows = []
by_frame = defaultdict(list)

for p in sorted(FRAMES.glob("frame_*.png")):
    frame_no = int(p.stem.split("_")[1])
    img = Image.open(p).convert("RGB")
    arr = np.asarray(img)
    roi = arr[Y0:Y1, :, :]
    r = roi[:, :, 0].astype(np.int16)
    g = roi[:, :, 1].astype(np.int16)
    b = roi[:, :, 2].astype(np.int16)

    # Forward projectile/enemy-facing sprite becomes pink/orange/white and grows.
    # Keep saturated warm/pink pixels while excluding cyan player shots and green ground.
    warm = (r > 150) & (g > 45) & (g < 205) & (b > 55) & (b < 235)
    pink = (r > 165) & (b > 120) & (g < 175)
    orange = (r > 165) & (g > 80) & (g < 190) & (b < 150)
    mask = warm & (pink | orange)

    for xs, ys in components(mask):
        area = len(xs)
        if area < 8 or area > 1600:
            continue
        minx, maxx = int(xs.min()), int(xs.max())
        miny, maxy = int(ys.min() + Y0), int(ys.max() + Y0)
        w, h = maxx - minx + 1, maxy - miny + 1
        if w < 3 or h < 3 or w > 70 or h > 90:
            continue
        cx, cy = float(xs.mean()), float(ys.mean() + Y0)
        patch = roi[ys, xs]
        mean = patch.mean(axis=0)
        comp = {
            "frame": frame_no,
            "time": 34.0 + (frame_no - 1) / 29.97,
            "cx": cx,
            "cy": cy,
            "w": w,
            "h": h,
            "area": area,
            "mean_r": float(mean[0]),
            "mean_g": float(mean[1]),
            "mean_b": float(mean[2]),
        }
        by_frame[frame_no].append(comp)

for name, spec in TARGETS.items():
    last = None
    for frame_no in range(spec["start"], spec["end"] + 1):
        comps = by_frame.get(frame_no, [])
        candidates = []
        for c in comps:
            if not (90 <= c["cy"] <= 235):
                continue
            # After firing, the object should stay near the enemy's column,
            # but can drift slightly. Prefer growing/larger warm blobs.
            dx = abs(c["cx"] - spec["x"])
            if dx > 38:
                continue
            if last is not None and abs(c["cy"] - last["cy"]) > 42 and c["area"] < 150:
                continue
            # Bigger is more likely to be the forward-moving sprite.
            score = dx * 1.8 - c["area"] * 0.12 + abs(c["cy"] - 155) * 0.05
            candidates.append((score, c))
        if not candidates:
            continue
        candidates.sort(key=lambda x: x[0])
        c = dict(candidates[0][1])
        c["track"] = name
        rows.append(c)
        last = c

with (OUT / "forward_projectile_tracks.csv").open("w", encoding="utf-8", newline="") as f:
    fields = ["track", "frame", "time", "cx", "cy", "w", "h", "area", "mean_r", "mean_g", "mean_b"]
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for r in rows:
        w.writerow({k: (round(v, 3) if isinstance(v, float) else v) for k, v in r.items()})

with (OUT / "forward_projectile_summary.txt").open("w", encoding="utf-8") as f:
    for name in TARGETS:
        vals = [r for r in rows if r["track"] == name]
        if not vals:
            f.write(f"{name}: no forward-growth track found\n")
            continue
        first, last = vals[0], vals[-1]
        max_area = max(vals, key=lambda r: r["area"])
        f.write(
            f"{name}: frames={first['frame']}-{last['frame']} "
            f"time={first['time']:.3f}-{last['time']:.3f} "
            f"x={sum(v['cx'] for v in vals)/len(vals):.2f} "
            f"y={first['cy']:.2f}->{last['cy']:.2f} "
            f"area={first['area']}->{last['area']} max={max_area['area']}@f{max_area['frame']} "
            f"w/h={first['w']}x{first['h']}->{last['w']}x{last['h']}\n"
        )

# Overlay tracked forward objects.
colors = {"right": (255, 128, 0), "center": (255, 0, 255), "left": (255, 255, 0)}
selected = []
for frame_no in range(92, 156, 4):
    p = FRAMES / f"frame_{frame_no:04d}.png"
    if not p.exists():
        continue
    img = Image.open(p).convert("RGB")
    d = ImageDraw.Draw(img)
    for r in rows:
        if r["frame"] != frame_no:
            continue
        c = colors[r["track"]]
        cx, cy = r["cx"], r["cy"]
        d.rectangle((cx - r["w"] / 2 - 2, cy - r["h"] / 2 - 2, cx + r["w"] / 2 + 2, cy + r["h"] / 2 + 2), outline=c, width=2)
        d.text((cx + 6, cy - 8), f"{r['track'][0]} {r['area']}", fill=c)
    selected.append((frame_no, img.crop((0, 62, 320, 260))))

thumb_w, thumb_h = 160, 99
cols = 6
sheet = Image.new("RGB", (cols * thumb_w, math.ceil(len(selected) / cols) * (thumb_h + 16)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, (frame_no, im) in enumerate(selected):
    im = im.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
    x = (i % cols) * thumb_w
    y = (i // cols) * (thumb_h + 16)
    sheet.paste(im, (x, y + 16))
    d.text((x + 2, y + 2), f"f{frame_no}", fill=(255, 255, 0))
sheet.save(OUT / "forward_projectile_overlay.png")

print(OUT / "forward_projectile_tracks.csv")
print((OUT / "forward_projectile_summary.txt").read_text(encoding="utf-8"))
print(OUT / "forward_projectile_overlay.png")
