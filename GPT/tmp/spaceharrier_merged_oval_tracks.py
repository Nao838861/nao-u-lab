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


def close(a, b):
    ax0, ay0, ax1, ay1 = a["x0"], a["y0"], a["x1"], a["y1"]
    bx0, by0, bx1, by1 = b["x0"], b["y0"], b["x1"], b["y1"]
    dx = max(0, max(ax0, bx0) - min(ax1, bx1))
    dy = max(0, max(ay0, by0) - min(ay1, by1))
    return dx <= 18 and dy <= 18


def merge_boxes(boxes):
    boxes = [dict(b) for b in boxes]
    changed = True
    while changed:
        changed = False
        out = []
        used = [False] * len(boxes)
        for i, a in enumerate(boxes):
            if used[i]:
                continue
            cur = dict(a)
            used[i] = True
            for j in range(i + 1, len(boxes)):
                if used[j]:
                    continue
                if close(cur, boxes[j]):
                    b = boxes[j]
                    cur["x0"] = min(cur["x0"], b["x0"])
                    cur["y0"] = min(cur["y0"], b["y0"])
                    cur["x1"] = max(cur["x1"], b["x1"])
                    cur["y1"] = max(cur["y1"], b["y1"])
                    cur["area"] += b["area"]
                    used[j] = True
                    changed = True
            out.append(cur)
        boxes = out
    return boxes


blobs_by_frame = {}
for p in sorted(FRAMES.glob("frame_*.png")):
    frame_no = int(p.stem.split("_")[1])
    if not (94 <= frame_no <= 170):
        continue
    img = Image.open(p).convert("RGB")
    a = np.asarray(img)[Y0:Y1, :, :]
    r = a[:, :, 0].astype(int)
    g = a[:, :, 1].astype(int)
    b = a[:, :, 2].astype(int)
    # Broad pink/orange highlight mask. It captures parts of an oval, then
    # nearby parts are merged into a whole-object bbox.
    mask = ((r > 200) & (g > 80) & (g < 190) & (b > 120) & (b < 235)) | ((r > 175) & (g > 85) & (g < 190) & (b < 160))
    boxes = []
    for xs, ys in components(mask):
        area = len(xs)
        if area < 12 or area > 2200:
            continue
        x0, x1 = int(xs.min()), int(xs.max())
        y0, y1 = int(ys.min() + Y0), int(ys.max() + Y0)
        w, h = x1 - x0 + 1, y1 - y0 + 1
        if w > 90 or h > 110:
            continue
        boxes.append({"x0": x0, "y0": y0, "x1": x1, "y1": y1, "area": area})
    merged = []
    for box in merge_boxes(boxes):
        w, h = box["x1"] - box["x0"] + 1, box["y1"] - box["y0"] + 1
        if w < 6 or h < 6:
            continue
        if box["area"] < 35 and max(w, h) < 14:
            continue
        cx = (box["x0"] + box["x1"]) / 2
        cy = (box["y0"] + box["y1"]) / 2
        merged.append({
            "frame": frame_no,
            "time": 34.0 + (frame_no - 1) / 29.97,
            "cx": cx,
            "cy": cy,
            "w": w,
            "h": h,
            "bbox_area": w * h,
            "mask_area": box["area"],
            **box,
        })
    blobs_by_frame[frame_no] = merged

# Manual identity windows after visual inspection. These are the forward ovals
# after the three enemies fire, not the tiny enemy body rise.
IDENTITIES = {
    "right_forward": {"frames": range(98, 125), "x_range": (235, 320)},
    "center_forward": {"frames": range(116, 145), "x_range": (120, 230)},
    "left_forward": {"frames": range(126, 156), "x_range": (20, 130)},
}

rows = []
for name, spec in IDENTITIES.items():
    last = None
    for frame_no in spec["frames"]:
        cand = []
        for b in blobs_by_frame.get(frame_no, []):
            if not (spec["x_range"][0] <= b["cx"] <= spec["x_range"][1]):
                continue
            if not (105 <= b["cy"] <= 235):
                continue
            # Prefer large bbox/area. If we have continuity, prefer nearby.
            # The left projectile grows near the lower-left and otherwise gets
            # confused with the tiny enemy body, so size matters more there.
            continuity = 0 if last is None else abs(b["cx"] - last["cx"]) + abs(b["cy"] - last["cy"]) * 0.6
            if name == "left_forward":
                score = continuity * 0.35 - b["bbox_area"] * 0.08 - b["mask_area"] * 0.05
                if frame_no >= 138 and b["cy"] < 160:
                    score += 80
            else:
                score = continuity - b["bbox_area"] * 0.03 - b["mask_area"] * 0.04
            cand.append((score, b))
        if not cand:
            continue
        cand.sort(key=lambda x: x[0])
        b = dict(cand[0][1])
        b["track"] = name
        rows.append(b)
        last = b

with (OUT / "merged_oval_tracks.csv").open("w", encoding="utf-8", newline="") as f:
    fields = ["track", "frame", "time", "cx", "cy", "w", "h", "bbox_area", "mask_area", "x0", "y0", "x1", "y1"]
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for r in rows:
        w.writerow({k: (round(r[k], 3) if isinstance(r[k], float) else r[k]) for k in fields})

with (OUT / "merged_oval_summary.txt").open("w", encoding="utf-8") as f:
    for name in IDENTITIES:
        vals = [r for r in rows if r["track"] == name]
        if not vals:
            f.write(f"{name}: no points\n")
            continue
        first, last = vals[0], vals[-1]
        mx = max(vals, key=lambda x: x["bbox_area"])
        f.write(
            f"{name}: frames={first['frame']}-{last['frame']} "
            f"time={first['time']:.3f}-{last['time']:.3f} "
            f"x={first['cx']:.1f}->{last['cx']:.1f} y={first['cy']:.1f}->{last['cy']:.1f} "
            f"bbox={first['w']}x{first['h']}->{last['w']}x{last['h']} "
            f"bbox_area={first['bbox_area']}->{last['bbox_area']} max={mx['bbox_area']}@f{mx['frame']} "
            f"mask_area={first['mask_area']}->{last['mask_area']}\n"
        )

colors = {"right_forward": (255, 120, 0), "center_forward": (255, 0, 255), "left_forward": (255, 255, 0)}
by_frame = {}
for r in rows:
    by_frame.setdefault(r["frame"], []).append(r)

selected = []
for frame_no in range(96, 156, 4):
    p = FRAMES / f"frame_{frame_no:04d}.png"
    if not p.exists():
        continue
    img = Image.open(p).convert("RGB")
    d = ImageDraw.Draw(img)
    for r in by_frame.get(frame_no, []):
        c = colors[r["track"]]
        d.rectangle((r["x0"] - 3, r["y0"] - 3, r["x1"] + 3, r["y1"] + 3), outline=c, width=2)
        d.text((r["x1"] + 3, r["y0"]), f"{r['track'][0]} {r['w']}x{r['h']}", fill=c)
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
sheet.save(OUT / "merged_oval_overlay.png")

print(OUT / "merged_oval_tracks.csv")
print((OUT / "merged_oval_summary.txt").read_text(encoding="utf-8"))
print(OUT / "merged_oval_overlay.png")
