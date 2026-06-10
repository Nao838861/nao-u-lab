from pathlib import Path
import csv
import math
from PIL import Image, ImageDraw

FRAMES = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_wave2_frames")
OUT = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_wave2_analysis")
CSV = OUT / "wave2_oval_candidates.csv"

rows_by_frame = {}
with CSV.open("r", encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        r = {k: float(v) for k, v in row.items()}
        frame = int(r["frame"])
        rows_by_frame.setdefault(frame, []).append(r)

selected = []
for frame in range(75, 136, 5):
    p = FRAMES / f"frame_{frame:04d}.png"
    img = Image.open(p).convert("RGB")
    d = ImageDraw.Draw(img)
    for idx, r in enumerate(rows_by_frame.get(frame, [])):
        if r["cy"] < 55 and r["x1"] < 270:
            continue
        color = (255, 255, 0) if r["bbox_area"] >= 400 else (0, 255, 255)
        d.rectangle((r["x0"], r["y0"], r["x1"], r["y1"]), outline=color, width=2)
        d.text((r["x0"], max(45, r["y0"] - 10)), f"{idx}:{int(r['bbox_area'])}", fill=color)
    selected.append((frame, img))

thumb_w = 240
thumb_h = 180
cols = 3
sheet = Image.new("RGB", (cols * thumb_w, math.ceil(len(selected) / cols) * (thumb_h + 18)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, (frame, img) in enumerate(selected):
    img = img.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
    x = (i % cols) * thumb_w
    y = (i // cols) * (thumb_h + 18)
    sheet.paste(img, (x, y + 18))
    d.text((x + 2, y + 2), f"f{frame}", fill=(255, 255, 0))
sheet.save(OUT / "wave2_candidate_sheet.png")
print(OUT / "wave2_candidate_sheet.png")
