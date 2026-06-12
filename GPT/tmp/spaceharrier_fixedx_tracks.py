from pathlib import Path
from collections import deque
import csv

import numpy as np
from PIL import Image, ImageDraw

FRAMES = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_frames")
OUT = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_analysis")
OUT.mkdir(parents=True, exist_ok=True)

Y0, Y1 = 82, 215
TARGETS = {
    "right": 267,
    "center": 167,
    "left": 64,
}


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


tracks = {name: [] for name in TARGETS}
all_comps = []

for p in sorted(FRAMES.glob("frame_*.png")):
    frame_no = int(p.stem.split("_")[1])
    if not (70 <= frame_no <= 150):
        continue
    img = Image.open(p).convert("RGB")
    arr = np.asarray(img)
    roi = arr[Y0:Y1, :, :]
    r = roi[:, :, 0].astype(np.int16)
    g = roi[:, :, 1].astype(np.int16)
    b = roi[:, :, 2].astype(np.int16)
    sky = (r > 135) & (r < 205) & (g > 70) & (g < 145) & (b > 175) & (b < 245)
    green_ground = (g > 150) & (r < 150)
    dark = (r < 25) & (g < 25) & (b < 25)
    mask = (~sky) & (~green_ground) & (~dark)

    comps = []
    for xs, ys in components(mask):
        area = len(xs)
        if area < 5 or area > 420:
            continue
        minx, maxx = int(xs.min()), int(xs.max())
        miny, maxy = int(ys.min() + Y0), int(ys.max() + Y0)
        w, h = maxx - minx + 1, maxy - miny + 1
        if w > 42 or h > 42:
            continue
        cx, cy = float(xs.mean()), float(ys.mean() + Y0)
        patch = roi[ys, xs]
        mean = patch.mean(axis=0)
        # Drop cyan player shots and obvious blue clouds.
        if mean[2] > mean[0] + 35 and mean[2] > 150:
            continue
        comps.append({
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
        })
    all_comps.extend(comps)

    for name, tx in TARGETS.items():
        # Pick the largest/closest plausible object in the fixed X column.
        cand = []
        for c in comps:
            dx = abs(c["cx"] - tx)
            if dx > 26:
                continue
            if not (90 <= c["cy"] <= 195):
                continue
            # Pink forward bullet is valid as fire evidence but not enemy body;
            # keep it marked by color for later separation.
            score = dx * 2.0 - c["area"] * 0.08 + abs(c["cy"] - 135) * 0.15
            cand.append((score, c))
        if cand:
            cand.sort(key=lambda x: x[0])
            c = cand[0][1]
            tracks[name].append(c)

with (OUT / "fixedx_tracks.csv").open("w", encoding="utf-8", newline="") as f:
    fieldnames = ["track", "frame", "time", "cx", "cy", "w", "h", "area", "mean_r", "mean_g", "mean_b"]
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    for name, vals in tracks.items():
        for v in vals:
            row = {"track": name, **v}
            w.writerow({k: (round(val, 3) if isinstance(val, float) else val) for k, val in row.items()})

# Summaries for likely enemy body phase: ignore large pink bullet-like blobs by
# requiring less red/pink dominance and area < 180.
with (OUT / "fixedx_summary.txt").open("w", encoding="utf-8") as f:
    for name, vals in tracks.items():
        body = [
            v for v in vals
            if v["area"] <= 180 and not (v["mean_r"] > 180 and v["mean_b"] > 130 and v["mean_g"] < 150)
        ]
        if not body:
            f.write(f"{name}: no body points\n")
            continue
        ymin = min(body, key=lambda v: v["cy"])
        ymax = max(body, key=lambda v: v["cy"])
        f.write(
            f"{name}: points={len(body)} frame={body[0]['frame']}-{body[-1]['frame']} "
            f"x_mean={sum(v['cx'] for v in body)/len(body):.2f} "
            f"y_min={ymin['cy']:.2f}@f{ymin['frame']} "
            f"y_max={ymax['cy']:.2f}@f{ymax['frame']} "
            f"area_max={max(v['area'] for v in body)}\n"
        )

# Draw tracks over selected frames.
colors = {"right": (255, 120, 0), "center": (255, 0, 0), "left": (255, 255, 0)}
selected = []
for frame_no in range(76, 146, 4):
    p = FRAMES / f"frame_{frame_no:04d}.png"
    if not p.exists():
        continue
    img = Image.open(p).convert("RGB")
    d = ImageDraw.Draw(img)
    for name, vals in tracks.items():
        for v in vals:
            if v["frame"] != frame_no:
                continue
            c = colors[name]
            cx, cy = v["cx"], v["cy"]
            d.rectangle((cx - 6, cy - 6, cx + 6, cy + 6), outline=c, width=2)
            d.text((cx + 7, cy - 8), name[0], fill=c)
    selected.append((frame_no, img.crop((0, 62, 320, 245))))

thumb_w, thumb_h = 160, 92
cols = 6
rows = (len(selected) + cols - 1) // cols
sheet = Image.new("RGB", (cols * thumb_w, rows * (thumb_h + 16)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, (frame_no, im) in enumerate(selected):
    im = im.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
    x = (i % cols) * thumb_w
    y = (i // cols) * (thumb_h + 16)
    sheet.paste(im, (x, y + 16))
    d.text((x + 2, y + 2), f"f{frame_no}", fill=(255, 255, 0))
sheet.save(OUT / "fixedx_tracks_overlay.png")

print(OUT / "fixedx_tracks.csv")
print(OUT / "fixedx_summary.txt")
print((OUT / "fixedx_summary.txt").read_text(encoding="utf-8"))
print(OUT / "fixedx_tracks_overlay.png")
