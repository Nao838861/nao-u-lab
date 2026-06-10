from pathlib import Path
from collections import deque
import csv
import math

import numpy as np
from PIL import Image, ImageDraw

FRAMES = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_wave2_frames")
OUT = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_wave2_analysis")
OUT.mkdir(parents=True, exist_ok=True)


def components(mask):
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    for sy in range(h):
        for sx in range(w):
            if not mask[sy, sx] or seen[sy, sx]:
                continue
            q = deque([(sx, sy)])
            seen[sy, sx] = True
            xs = []
            ys = []
            while q:
                x, y = q.popleft()
                xs.append(x)
                ys.append(y)
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((nx, ny))
            yield np.array(xs), np.array(ys)


def merge_close(boxes, pad=16):
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
                b = boxes[j]
                dx = max(0, max(cur["x0"], b["x0"]) - min(cur["x1"], b["x1"]))
                dy = max(0, max(cur["y0"], b["y0"]) - min(cur["y1"], b["y1"]))
                if dx <= pad and dy <= pad:
                    cur["x0"] = min(cur["x0"], b["x0"])
                    cur["y0"] = min(cur["y0"], b["y0"])
                    cur["x1"] = max(cur["x1"], b["x1"])
                    cur["y1"] = max(cur["y1"], b["y1"])
                    cur["mask_area"] += b["mask_area"]
                    used[j] = True
                    changed = True
            out.append(cur)
        boxes = out
    return boxes


def detect(frame_path):
    img = Image.open(frame_path).convert("RGB")
    a = np.asarray(img)
    r = a[:, :, 0].astype(int)
    g = a[:, :, 1].astype(int)
    b = a[:, :, 2].astype(int)
    yy = np.indices(r.shape)[0]
    # Ovals are high-saturation red/pink/white/cyan-blue. Exclude HUD top and
    # green ground. Purple sky has high blue but low red/green balance.
    red_pink = (r > 175) & (g > 65) & (g < 210) & (b > 80) & (b < 235)
    orange_red = (r > 180) & (g > 70) & (g < 190) & (b < 145)
    white = (r > 210) & (g > 190) & (b > 160)
    cyan_blue = (b > 170) & (g > 120) & (r < 185)
    mask = (red_pink | orange_red | white | cyan_blue) & (yy >= 45) & (yy <= 185)

    boxes = []
    for xs, ys in components(mask):
        area = len(xs)
        if area < 10 or area > 2600:
            continue
        x0, x1 = int(xs.min()), int(xs.max())
        y0, y1 = int(ys.min()), int(ys.max())
        bw = x1 - x0 + 1
        bh = y1 - y0 + 1
        if bw < 4 or bh < 4:
            continue
        if bw > 120 or bh > 90:
            continue
        if y0 < 52 and bw < 18 and area < 40:
            continue
        boxes.append({"x0": x0, "y0": y0, "x1": x1, "y1": y1, "mask_area": area})

    merged = []
    for box in merge_close(boxes):
        bw = box["x1"] - box["x0"] + 1
        bh = box["y1"] - box["y0"] + 1
        bbox_area = bw * bh
        if bbox_area < 45 or bbox_area > 5000:
            continue
        cx = (box["x0"] + box["x1"]) / 2
        cy = (box["y0"] + box["y1"]) / 2
        # Avoid player body fragments.
        if cx > 210 and cy < 105 and bbox_area > 1600:
            continue
        merged.append({
            **box,
            "cx": cx,
            "cy": cy,
            "w": bw,
            "h": bh,
            "bbox_area": bbox_area,
        })
    return merged


blobs_by_frame = {}
all_rows = []
for fp in sorted(FRAMES.glob("frame_*.png")):
    frame = int(fp.stem.split("_")[1])
    if not (55 <= frame <= 150):
        continue
    blobs = detect(fp)
    for b in blobs:
        b["frame"] = frame
        b["time"] = 40.0 + (frame - 1) / 30.0
        all_rows.append(b)
    blobs_by_frame[frame] = blobs

with (OUT / "wave2_oval_candidates.csv").open("w", encoding="utf-8", newline="") as f:
    fields = ["frame", "time", "cx", "cy", "w", "h", "bbox_area", "mask_area", "x0", "y0", "x1", "y1"]
    wr = csv.DictWriter(f, fields)
    wr.writeheader()
    for r in all_rows:
        wr.writerow({k: round(r[k], 2) if isinstance(r[k], float) else r[k] for k in fields})


tracks = []
active = []
for frame in range(55, 151):
    bs = blobs_by_frame.get(frame, [])
    used = set()
    next_active = []
    for ti in active:
        tr = tracks[ti]
        last = tr[-1]
        if frame - last["frame"] > 5:
            continue
        best = None
        best_score = 999999.0
        for bi, b in enumerate(bs):
            if bi in used:
                continue
            dx = b["cx"] - last["cx"]
            dy = b["cy"] - last["cy"]
            ds = math.sqrt(b["bbox_area"]) - math.sqrt(last["bbox_area"])
            score = dx * dx + dy * dy + 20 * abs(ds)
            # Leader should mostly move left/up and shrink, but allow small
            # noisy deviations due to occlusion and merging.
            if dx > 16:
                score += 900
            if dy > 18:
                score += 500
            if ds > 8:
                score += 300
            if abs(dx) < 55 and abs(dy) < 45 and score < best_score:
                best_score = score
                best = bi
        if best is not None:
            used.add(best)
            tr.append(bs[best])
            next_active.append(ti)
    for bi, b in enumerate(bs):
        if bi in used:
            continue
        tracks.append([b])
        next_active.append(len(tracks) - 1)
    active = next_active

summaries = []
for i, tr in enumerate(tracks):
    if len(tr) < 4:
        continue
    first = tr[0]
    last = tr[-1]
    maxb = max(tr, key=lambda p: p["bbox_area"])
    x_delta = last["cx"] - first["cx"]
    y_delta = last["cy"] - first["cy"]
    area_delta = last["bbox_area"] - first["bbox_area"]
    # Score for the first right-foreground to left-background formation.
    score = 0.0
    score += len(tr) * 4
    score += max(0, first["cx"] - 175) * 3
    score += max(0, -x_delta) * 4
    score += max(0, -y_delta) * 2
    score += max(0, -area_delta) * 0.15
    if first["frame"] > 100:
        score -= 140
    if first["frame"] < 65:
        score -= 50
    if first["cx"] < 150:
        score -= 120
    summaries.append({
        "track": i,
        "n": len(tr),
        "frame_min": first["frame"],
        "frame_max": last["frame"],
        "x0": first["cx"],
        "x1": last["cx"],
        "y0": first["cy"],
        "y1": last["cy"],
        "area0": first["bbox_area"],
        "area1": last["bbox_area"],
        "area_max": maxb["bbox_area"],
        "area_max_frame": maxb["frame"],
        "score": score,
    })

summaries.sort(key=lambda s: -s["score"])
chosen_tracks = [s["track"] for s in summaries[:12]]

with (OUT / "wave2_oval_summary.csv").open("w", encoding="utf-8", newline="") as f:
    fields = ["track", "n", "frame_min", "frame_max", "x0", "x1", "y0", "y1", "area0", "area1", "area_max", "area_max_frame", "score"]
    wr = csv.DictWriter(f, fields)
    wr.writeheader()
    for s in summaries:
        wr.writerow({k: round(s[k], 2) if isinstance(s[k], float) else s[k] for k in fields})

with (OUT / "wave2_oval_tracks.csv").open("w", encoding="utf-8", newline="") as f:
    fields = ["track", "frame", "time", "cx", "cy", "w", "h", "bbox_area", "mask_area", "x0", "y0", "x1", "y1"]
    wr = csv.DictWriter(f, fields)
    wr.writeheader()
    for ti in chosen_tracks:
        for b in tracks[ti]:
            row = {"track": ti, **b}
            wr.writerow({k: round(row[k], 2) if isinstance(row[k], float) else row[k] for k in fields})

colors = [(255, 0, 0), (255, 160, 0), (255, 255, 0), (0, 255, 0), (0, 220, 255), (80, 80, 255), (255, 0, 255), (255, 255, 255), (180, 80, 255), (255, 120, 180), (120, 255, 180), (220, 220, 120)]
color_for = {ti: colors[i % len(colors)] for i, ti in enumerate(chosen_tracks)}
by_frame = {}
for ti in chosen_tracks:
    for b in tracks[ti]:
        by_frame.setdefault(b["frame"], []).append((ti, b))

selected = []
for frame in range(55, 151, 5):
    fp = FRAMES / f"frame_{frame:04d}.png"
    if not fp.exists():
        continue
    img = Image.open(fp).convert("RGB")
    d = ImageDraw.Draw(img)
    for ti, b in by_frame.get(frame, []):
        c = color_for[ti]
        d.rectangle((b["x0"] - 2, b["y0"] - 2, b["x1"] + 2, b["y1"] + 2), outline=c, width=2)
        d.text((b["x1"] + 2, b["y0"]), str(ti), fill=c)
    selected.append((frame, img))

thumb_w = 160
thumb_h = 120
cols = 5
sheet = Image.new("RGB", (cols * thumb_w, math.ceil(len(selected) / cols) * (thumb_h + 16)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, (frame, img) in enumerate(selected):
    img = img.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
    x = (i % cols) * thumb_w
    y = (i // cols) * (thumb_h + 16)
    sheet.paste(img, (x, y + 16))
    d.text((x + 2, y + 2), f"f{frame}", fill=(255, 255, 0))
sheet.save(OUT / "wave2_oval_overlay.png")

print("top oval tracks")
for s in summaries[:12]:
    print({k: round(v, 2) if isinstance(v, float) else v for k, v in s.items()})
print(OUT / "wave2_oval_candidates.csv")
print(OUT / "wave2_oval_summary.csv")
print(OUT / "wave2_oval_tracks.csv")
print(OUT / "wave2_oval_overlay.png")
