from pathlib import Path
from collections import deque
import csv
import math

from PIL import Image, ImageDraw

FRAMES = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_wave2_frames")
OUT = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_wave2_analysis")
OUT.mkdir(parents=True, exist_ok=True)


def component_boxes(mask, pix, w, h):
    seen = bytearray(w * h)
    boxes = []
    for y in range(32, h - 4):
        base = y * w
        for x in range(0, w):
            idx = base + x
            if seen[idx] or not mask[idx]:
                continue
            q = deque([(x, y)])
            seen[idx] = 1
            xs = []
            ys = []
            rs = []
            gs = []
            bs = []
            while q:
                cx, cy = q.popleft()
                cidx = cy * w + cx
                xs.append(cx)
                ys.append(cy)
                r, g, b = pix[cidx]
                rs.append(r)
                gs.append(g)
                bs.append(b)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if nx < 0 or nx >= w or ny < 32 or ny >= h - 4:
                        continue
                    nidx = ny * w + nx
                    if seen[nidx] or not mask[nidx]:
                        continue
                    seen[nidx] = 1
                    q.append((nx, ny))
            area = len(xs)
            if area < 5:
                continue
            x0, x1 = min(xs), max(xs)
            y0, y1 = min(ys), max(ys)
            bw = x1 - x0 + 1
            bh = y1 - y0 + 1
            if bw > 90 or bh > 80:
                continue
            if area > 2200:
                continue
            cx = sum(xs) / area
            cy = sum(ys) / area
            # HUD, mountains, and score fragments usually become long, flat,
            # white components. Keep compact moving sprites.
            if cy < 44 and area < 30:
                continue
            if bh <= 2 and bw > 14:
                continue
            boxes.append({
                "cx": cx,
                "cy": cy,
                "x0": x0,
                "y0": y0,
                "x1": x1,
                "y1": y1,
                "w": bw,
                "h": bh,
                "area": area,
                "mean_r": sum(rs) / area,
                "mean_g": sum(gs) / area,
                "mean_b": sum(bs) / area,
            })
    return boxes


def detect(frame_path):
    img = Image.open(frame_path).convert("RGB")
    w, h = img.size
    pix = list(img.getdata())
    mask = bytearray(w * h)
    for i, (r, g, b) in enumerate(pix):
        y = i // w
        x = i - y * w
        if y < 32 or y > 220:
            continue
        # Warm body colors plus bright highlights. This deliberately excludes
        # blue player shots and most green ground/background pixels.
        warm = (r >= 120 and g >= 45 and b <= 185 and r >= b + 18)
        orange = (r >= 160 and 55 <= g <= 205 and b <= 150)
        white_hot = (r >= 205 and g >= 185 and b >= 150 and y > 45)
        if warm or orange or white_hot:
            # Avoid the purple sky being lifted by compression noise.
            if r > 150 or g > 70 or white_hot:
                mask[i] = 1
    boxes = component_boxes(mask, pix, w, h)
    return boxes


rows = []
for fp in sorted(FRAMES.glob("frame_*.png")):
    frame = int(fp.stem.split("_")[1])
    for b in detect(fp):
        b["frame"] = frame
        b["time"] = 40.0 + (frame - 1) / 30.0
        rows.append(b)

with (OUT / "wave2_candidates.csv").open("w", encoding="utf-8", newline="") as f:
    fields = ["frame", "time", "cx", "cy", "w", "h", "area", "x0", "y0", "x1", "y1", "mean_r", "mean_g", "mean_b"]
    wr = csv.DictWriter(f, fields)
    wr.writeheader()
    for r in rows:
        wr.writerow({k: round(r[k], 2) if isinstance(r[k], float) else r[k] for k in fields})


tracks = []
active = []
for frame in range(1, 151):
    bs = [r for r in rows if r["frame"] == frame]
    used = set()
    new_active = []
    for ti in active:
        tr = tracks[ti]
        last = tr[-1]
        best = None
        best_score = 999999.0
        for bi, b in enumerate(bs):
            if bi in used:
                continue
            gap = frame - last["frame"]
            if gap > 4:
                continue
            dx = b["cx"] - last["cx"]
            dy = b["cy"] - last["cy"]
            # The wanted leader moves generally leftward and shrinks. Do not
            # hard-reject brief noisy right steps, but make them expensive.
            score = dx * dx + dy * dy + 12.0 * abs(math.sqrt(b["area"]) - math.sqrt(last["area"]))
            if dx > 12:
                score += 1200
            if score < best_score and abs(dx) < 48 and abs(dy) < 42:
                best_score = score
                best = bi
        if best is not None:
            used.add(best)
            tr.append(bs[best])
            new_active.append(ti)
    for bi, b in enumerate(bs):
        if bi not in used:
            tracks.append([b])
            new_active.append(len(tracks) - 1)
    active = new_active

summaries = []
for i, tr in enumerate(tracks):
    if len(tr) < 5:
        continue
    first = tr[0]
    last = tr[-1]
    area_first = first["area"]
    area_last = last["area"]
    x_delta = last["cx"] - first["cx"]
    y_delta = last["cy"] - first["cy"]
    area_delta = area_last - area_first
    max_area = max(p["area"] for p in tr)
    # Candidate leader: starts on right half, moves left, generally shrinks,
    # begins before the later mirrored group.
    score = 0
    score += max(0, first["cx"] - 150) * 2
    score += max(0, -x_delta) * 3
    score += max(0, -area_delta) * 0.3
    score += len(tr) * 2
    if first["frame"] > 85:
        score -= 80
    if first["cx"] < 140:
        score -= 80
    summaries.append({
        "track": i,
        "n": len(tr),
        "frame_min": first["frame"],
        "frame_max": last["frame"],
        "x0": first["cx"],
        "x1": last["cx"],
        "y0": first["cy"],
        "y1": last["cy"],
        "area0": area_first,
        "area1": area_last,
        "max_area": max_area,
        "score": score,
    })

summaries.sort(key=lambda s: -s["score"])
chosen = {s["track"] for s in summaries[:10]}

with (OUT / "wave2_track_summary.csv").open("w", encoding="utf-8", newline="") as f:
    fields = ["track", "n", "frame_min", "frame_max", "x0", "x1", "y0", "y1", "area0", "area1", "max_area", "score"]
    wr = csv.DictWriter(f, fields)
    wr.writeheader()
    for s in summaries:
        wr.writerow({k: round(s[k], 2) if isinstance(s[k], float) else s[k] for k in fields})

with (OUT / "wave2_tracks.csv").open("w", encoding="utf-8", newline="") as f:
    fields = ["track", "frame", "time", "cx", "cy", "w", "h", "area", "x0", "y0", "x1", "y1", "mean_r", "mean_g", "mean_b"]
    wr = csv.DictWriter(f, fields)
    wr.writeheader()
    for i, tr in enumerate(tracks):
        if i not in chosen:
            continue
        for b in tr:
            row = {"track": i, **b}
            wr.writerow({k: round(row[k], 2) if isinstance(row[k], float) else row[k] for k in fields})

# Overlay every 5th frame with chosen tracks.
colors = [(255, 0, 0), (255, 150, 0), (255, 255, 0), (0, 255, 0), (0, 220, 255), (80, 80, 255), (255, 0, 255), (255, 255, 255), (180, 80, 255), (255, 120, 180)]
color_for = {s["track"]: colors[i % len(colors)] for i, s in enumerate(summaries[:10])}
by_frame = {}
for i, tr in enumerate(tracks):
    if i not in color_for:
        continue
    for b in tr:
        by_frame.setdefault(b["frame"], []).append((i, b))

thumb_w = 160
thumb_h = 120
sel = []
for frame in range(1, 151, 5):
    fp = FRAMES / f"frame_{frame:04d}.png"
    if not fp.exists():
        continue
    img = Image.open(fp).convert("RGB")
    d = ImageDraw.Draw(img)
    for ti, b in by_frame.get(frame, []):
        c = color_for[ti]
        d.rectangle((b["x0"], b["y0"], b["x1"], b["y1"]), outline=c, width=2)
        d.text((b["x1"] + 2, b["y0"]), str(ti), fill=c)
    sel.append((frame, img))

cols = 5
sheet = Image.new("RGB", (cols * thumb_w, math.ceil(len(sel) / cols) * (thumb_h + 16)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for idx, (frame, img) in enumerate(sel):
    img = img.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
    x = (idx % cols) * thumb_w
    y = (idx // cols) * (thumb_h + 16)
    sheet.paste(img, (x, y + 16))
    d.text((x + 2, y + 2), f"f{frame}", fill=(255, 255, 0))
sheet.save(OUT / "wave2_tracks_overlay.png")

print("top tracks")
for s in summaries[:12]:
    print({k: round(v, 2) if isinstance(v, float) else v for k, v in s.items()})
print(OUT / "wave2_candidates.csv")
print(OUT / "wave2_track_summary.csv")
print(OUT / "wave2_tracks.csv")
print(OUT / "wave2_tracks_overlay.png")
