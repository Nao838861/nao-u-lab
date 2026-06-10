from pathlib import Path
import csv

OUT = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_analysis")
src = OUT / "orange_points.csv"

rows = []
with src.open("r", encoding="utf-8", newline="") as f:
    for r in csv.DictReader(f):
        rows.append({
            "cluster": int(float(r["cluster"])),
            "frame": int(float(r["frame"])),
            "time": float(r["time"]),
            "cx": float(r["cx"]),
            "cy": float(r["cy"]),
            "area": float(r["area"]),
        })

# Manual range cut after automatic detection, based on overlay inspection.
# These are enemy-body rise phases before the forward projectile dominates.
body_specs = {
    "right": {"cluster": 272, "start": 83, "end": 94, "fire": 95},
    "center": {"cluster": 160, "start": 81, "end": 108, "fire": 109},
    "left": {"cluster": 64, "start": 95, "end": 124, "fire": 125},
}

out_rows = []
for name, spec in body_specs.items():
    pts = [
        r for r in rows
        if r["cluster"] == spec["cluster"] and spec["start"] <= r["frame"] <= spec["end"]
    ]
    pts.sort(key=lambda r: r["frame"])
    if not pts:
        continue
    # Keep one point per frame, choosing the largest component if split.
    by_frame = {}
    for p in pts:
        if p["frame"] not in by_frame or p["area"] > by_frame[p["frame"]]["area"]:
            by_frame[p["frame"]] = p
    pts = [by_frame[f] for f in sorted(by_frame)]
    max_area = max(p["area"] for p in pts)
    min_y = min(p["cy"] for p in pts)
    max_y = max(p["cy"] for p in pts)
    for p in pts:
        # screen_y: lower is upward. z_proxy is size-ish; bigger area means closer/larger.
        # Normalize to 0..255 only as a fitting aid, not final MonoSH wz.
        z_proxy = 0 if max_area <= 0 else round(255 * (p["area"] / max_area))
        y_norm = 0 if max_y <= min_y else round(255 * (p["cy"] - min_y) / (max_y - min_y))
        out_rows.append({
            "track": name,
            "frame": p["frame"],
            "time": round(p["time"], 4),
            "screen_x": round(p["cx"], 2),
            "screen_y": round(p["cy"], 2),
            "area": int(p["area"]),
            "z_proxy_area_0_255": z_proxy,
            "y_norm_down_0_255": y_norm,
            "fire_frame_est": spec["fire"],
        })

with (OUT / "enemy_body_tracks_approx.csv").open("w", encoding="utf-8", newline="") as f:
    fieldnames = ["track", "frame", "time", "screen_x", "screen_y", "area", "z_proxy_area_0_255", "y_norm_down_0_255", "fire_frame_est"]
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(out_rows)

with (OUT / "enemy_body_tracks_summary.txt").open("w", encoding="utf-8") as f:
    for name, spec in body_specs.items():
        pts = [r for r in out_rows if r["track"] == name]
        if not pts:
            continue
        f.write(
            f"{name}: x={sum(p['screen_x'] for p in pts)/len(pts):.2f}, "
            f"frames={pts[0]['frame']}-{pts[-1]['frame']}, "
            f"time={pts[0]['time']:.3f}-{pts[-1]['time']:.3f}, "
            f"y={max(p['screen_y'] for p in pts):.2f}->{min(p['screen_y'] for p in pts):.2f}, "
            f"fire_frame_est={spec['fire']} ({34.0 + (spec['fire'] - 1) / 29.97:.3f}s)\n"
        )

print(OUT / "enemy_body_tracks_approx.csv")
print((OUT / "enemy_body_tracks_summary.txt").read_text(encoding="utf-8"))
