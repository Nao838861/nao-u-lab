from pathlib import Path
import csv
import math
from collections import defaultdict

from PIL import Image, ImageDraw

OUT = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_analysis")
csv_path = OUT / "candidates.csv"

rows = []
with csv_path.open("r", encoding="utf-8", newline="") as f:
    for r in csv.DictReader(f):
        row = {k: (float(v) if k not in ("frame",) else int(v)) for k, v in r.items()}
        # The three Space Harrier enemies in this section are small orange/white
        # sprites in the sky. Blue player shots and pink fireballs are excluded.
        if not (78 <= row["frame"] <= 145):
            continue
        if not (88 <= row["cy"] <= 185):
            continue
        if not (10 <= row["area"] <= 260):
            continue
        if not (row["mean_r"] >= 125 and row["mean_g"] >= 55 and row["mean_b"] <= 175):
            continue
        if row["mean_b"] > row["mean_r"] + 10:
            continue
        # Exclude HUD/score colored fragments and tiny mountain/ground pixels.
        if row["cy"] < 94 and row["area"] < 25:
            continue
        rows.append(row)

# Group by stable X columns. Since the user notes X does not move, quantized X
# clustering is enough for a first pass.
clusters = defaultdict(list)
for row in rows:
    key = int(round(row["cx"] / 16.0) * 16)
    clusters[key].append(row)

summary = []
for key, vals in clusters.items():
    frames = sorted({int(v["frame"]) for v in vals})
    if len(frames) < 4:
        continue
    xs = [v["cx"] for v in vals]
    ys = [v["cy"] for v in vals]
    areas = [v["area"] for v in vals]
    summary.append({
        "key": key,
        "n": len(vals),
        "frame_min": min(frames),
        "frame_max": max(frames),
        "x_mean": sum(xs) / len(xs),
        "x_min": min(xs),
        "x_max": max(xs),
        "y_min": min(ys),
        "y_max": max(ys),
        "area_max": max(areas),
    })

summary.sort(key=lambda s: (-s["n"], s["key"]))
chosen_keys = [s["key"] for s in summary[:8]]

with (OUT / "orange_clusters.csv").open("w", encoding="utf-8", newline="") as f:
    fieldnames = ["key", "n", "frame_min", "frame_max", "x_mean", "x_min", "x_max", "y_min", "y_max", "area_max"]
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    for s in summary:
        w.writerow({k: (round(v, 2) if isinstance(v, float) else v) for k, v in s.items()})

with (OUT / "orange_points.csv").open("w", encoding="utf-8", newline="") as f:
    fieldnames = ["cluster", "frame", "time", "cx", "cy", "w", "h", "area", "mean_r", "mean_g", "mean_b"]
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    for row in rows:
        key = int(round(row["cx"] / 16.0) * 16)
        if key in chosen_keys:
            out = dict(row)
            out["cluster"] = key
            w.writerow({k: (round(v, 2) if isinstance(v, float) else v) for k, v in out.items()})

# Overlay selected clusters on every 5th frame.
frames_dir = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_frames")
colors = [(255, 0, 0), (255, 160, 0), (255, 255, 0), (0, 255, 0), (0, 220, 255), (80, 80, 255), (255, 0, 255), (255, 255, 255)]
color_for = {k: colors[i % len(colors)] for i, k in enumerate(chosen_keys)}
by_frame = defaultdict(list)
for row in rows:
    key = int(round(row["cx"] / 16.0) * 16)
    if key in color_for:
        by_frame[int(row["frame"])].append((key, row))

sel = []
for frame_no in range(78, 146, 5):
    p = frames_dir / f"frame_{frame_no:04d}.png"
    if not p.exists():
        continue
    img = Image.open(p).convert("RGB")
    d = ImageDraw.Draw(img)
    for key, row in by_frame.get(frame_no, []):
        c = color_for[key]
        cx, cy = row["cx"], row["cy"]
        d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), outline=c, width=2)
        d.text((cx + 5, cy - 7), str(key), fill=c)
    sel.append((frame_no, img.crop((0, 62, 320, 245))))

thumb_w, thumb_h = 160, 122
cols = 5
sheet = Image.new("RGB", (cols * thumb_w, math.ceil(len(sel) / cols) * (thumb_h + 16)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, (frame_no, im) in enumerate(sel):
    im = im.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
    x = (i % cols) * thumb_w
    y = (i // cols) * (thumb_h + 16)
    sheet.paste(im, (x, y + 16))
    d.text((x + 2, y + 2), f"f{frame_no}", fill=(255, 255, 0))
sheet.save(OUT / "orange_overlay.png")

print("clusters")
for s in summary[:12]:
    print({k: (round(v, 2) if isinstance(v, float) else v) for k, v in s.items()})
print(OUT / "orange_clusters.csv")
print(OUT / "orange_points.csv")
print(OUT / "orange_overlay.png")
