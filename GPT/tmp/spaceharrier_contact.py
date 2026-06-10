from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

frames_dir = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_frames")
out_path = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_analysis\contact_10f.png")

paths = sorted(frames_dir.glob("frame_*.png"))[::10]
thumb_w, thumb_h = 160, 180
cols = 6
rows = (len(paths) + cols - 1) // cols
sheet = Image.new("RGB", (cols * thumb_w, rows * thumb_h), (20, 20, 20))
draw = ImageDraw.Draw(sheet)

for idx, p in enumerate(paths):
    img = Image.open(p).convert("RGB")
    # Crop gameplay area enough to remove most video overlay.
    crop = img.crop((0, 62, 320, 300))
    crop.thumbnail((thumb_w, thumb_h - 16), Image.Resampling.LANCZOS)
    x = (idx % cols) * thumb_w
    y = (idx // cols) * thumb_h
    sheet.paste(crop, (x, y + 16))
    frame_no = int(p.stem.split("_")[1])
    t = 34.0 + (frame_no - 1) / 29.97
    draw.text((x + 4, y + 2), f"f{frame_no:04d} {t:05.2f}s", fill=(255, 255, 0))

out_path.parent.mkdir(parents=True, exist_ok=True)
sheet.save(out_path)
print(out_path)
