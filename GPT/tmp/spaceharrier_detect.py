from pathlib import Path
from collections import deque
import csv

import numpy as np
from PIL import Image, ImageDraw

FRAMES = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_frames")
OUT = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_analysis")
OUT.mkdir(parents=True, exist_ok=True)

# Left-half crop is 320x360. These bounds keep the sky/play area and remove
# most score/header and ground noise.
Y0, Y1 = 78, 230
X0, X1 = 0, 320


def components(mask: np.ndarray):
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


rows = []
overlay_frames = []

for p in sorted(FRAMES.glob("frame_*.png")):
    frame_no = int(p.stem.split("_")[1])
    img = Image.open(p).convert("RGB")
    arr = np.asarray(img)
    roi = arr[Y0:Y1, X0:X1]
    r = roi[:, :, 0].astype(np.int16)
    g = roi[:, :, 1].astype(np.int16)
    b = roi[:, :, 2].astype(np.int16)

    # Sky background is purple. Ground is mostly below Y1. Keep non-purple,
    # non-green objects in the sky: enemies, player, bullets, HUD scraps.
    sky = (r > 135) & (r < 205) & (g > 70) & (g < 145) & (b > 175) & (b < 245)
    green_ground = (g > 150) & (r < 150)
    dark_noise = (r < 35) & (g < 35) & (b < 35)
    mask = (~sky) & (~green_ground) & (~dark_noise)

    # Remove tiny compression noise.
    for xs, ys in components(mask):
        area = len(xs)
        if area < 6:
            continue
        minx, maxx = int(xs.min()), int(xs.max())
        miny, maxy = int(ys.min()), int(ys.max())
        w = maxx - minx + 1
        h = maxy - miny + 1
        cx = float(xs.mean() + X0)
        cy = float(ys.mean() + Y0)
        patch = roi[ys, xs]
        mean = patch.mean(axis=0)

        # Candidate enemies/bullets: ignore large player body, wide HUD text,
        # and very low ground pieces. Keep broad enough to inspect manually.
        if area > 500:
            kind = "large"
        elif h > 45 or w > 45:
            kind = "large"
        elif cy < 86:
            kind = "hud"
        else:
            kind = "candidate"

        if kind == "candidate":
            rows.append({
                "frame": frame_no,
                "time": round(34.0 + (frame_no - 1) / 29.97, 4),
                "cx": round(cx, 2),
                "cy": round(cy, 2),
                "w": w,
                "h": h,
                "area": area,
                "mean_r": round(float(mean[0]), 1),
                "mean_g": round(float(mean[1]), 1),
                "mean_b": round(float(mean[2]), 1),
            })

    if frame_no % 5 == 1:
        overlay = img.copy()
        d = ImageDraw.Draw(overlay)
        for row in rows:
            if row["frame"] != frame_no:
                continue
            cx, cy = row["cx"], row["cy"]
            d.ellipse((cx - 3, cy - 3, cx + 3, cy + 3), outline=(255, 0, 0), width=2)
            d.text((cx + 4, cy - 8), f'{row["area"]}', fill=(255, 255, 0))
        overlay_frames.append((frame_no, overlay.crop((0, 62, 320, 300))))

with (OUT / "candidates.csv").open("w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["frame", "time", "cx", "cy", "w", "h", "area", "mean_r", "mean_g", "mean_b"])
    writer.writeheader()
    writer.writerows(rows)

thumb_w, thumb_h = 160, 119
cols = 6
sel = overlay_frames[12:30]  # around 36-39 sec
sheet = Image.new("RGB", (cols * thumb_w, ((len(sel) + cols - 1) // cols) * (thumb_h + 16)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, (frame_no, im) in enumerate(sel):
    im = im.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
    x = (i % cols) * thumb_w
    y = (i // cols) * (thumb_h + 16)
    sheet.paste(im, (x, y + 16))
    d.text((x + 2, y + 2), f"f{frame_no}", fill=(255, 255, 0))
sheet.save(OUT / "candidate_overlay.png")

print(f"rows={len(rows)}")
print(OUT / "candidates.csv")
print(OUT / "candidate_overlay.png")
