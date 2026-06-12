from pathlib import Path
import csv
import statistics

OUT = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_analysis")


def read_csv(path):
    with path.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def median(vals):
    vals = [v for v in vals if v is not None]
    if not vals:
        return None
    return statistics.median(vals)


body = read_csv(OUT / "enemy_body_tracks_approx.csv")
oval = read_csv(OUT / "merged_oval_tracks.csv")

# Body tracks: align by fire_frame_est. Phase is negative before firing.
body_by = {}
for r in body:
    name = r["track"]
    fire = int(float(r["fire_frame_est"]))
    frame = int(float(r["frame"]))
    phase = frame - fire
    body_by.setdefault(name, {})[phase] = {
        "screen_y": float(r["screen_y"]),
        "area": float(r["area"]),
        "screen_x": float(r["screen_x"]),
    }

# Forward oval tracks: align by first visible forward frame, which is approx
# fire+3 for right/left and fire+7 for center in current extraction. To avoid
# extracting jitter as timing, use manually identified forward starts.
forward_start = {
    "right_forward": 98,
    "center_forward": 116,
    "left_forward": 126,
}
forward_by = {}
for r in oval:
    name = r["track"]
    if name not in forward_start:
        continue
    frame = int(float(r["frame"]))
    phase = frame - forward_start[name]
    forward_by.setdefault(name, {})[phase] = {
        "cx": float(r["cx"]),
        "cy": float(r["cy"]),
        "w": float(r["w"]),
        "h": float(r["h"]),
        "bbox_area": float(r["bbox_area"]),
        "mask_area": float(r["mask_area"]),
    }


def make_template(grouped, fields):
    phases = sorted({p for rows in grouped.values() for p in rows})
    template = {}
    for p in phases:
        template[p] = {field: median([rows.get(p, {}).get(field) for rows in grouped.values()]) for field in fields}
    return template


body_template = make_template(body_by, ["screen_y", "area"])
forward_template = make_template(forward_by, ["cy", "w", "h", "bbox_area", "mask_area"])


def corrected_rows(grouped, template, fields, x_field_name, x_value_fn, threshold_fn):
    rows = []
    for name, data in grouped.items():
        for phase, tmpl in template.items():
            raw = data.get(phase)
            row = {
                "track": name,
                "phase": phase,
                x_field_name: round(x_value_fn(name, raw), 3),
            }
            changed = False
            for field in fields:
                tv = tmpl[field]
                rv = raw.get(field) if raw else None
                if tv is None:
                    cv = rv
                    reason = "raw"
                elif rv is None:
                    cv = tv
                    reason = "missing"
                    changed = True
                elif threshold_fn(field, rv, tv):
                    cv = tv
                    reason = "outlier"
                    changed = True
                else:
                    cv = rv
                    reason = "raw"
                row[f"raw_{field}"] = None if rv is None else round(rv, 3)
                row[f"corrected_{field}"] = None if cv is None else round(cv, 3)
                row[f"{field}_source"] = reason
            row["changed"] = int(changed)
            rows.append(row)
    return rows


def body_x(name, raw):
    if raw and raw.get("screen_x") is not None:
        return raw["screen_x"]
    return {"right": 267.0, "center": 167.0, "left": 64.0}[name]


def forward_x(name, raw):
    # Keep raw x; forward objects visibly drift as they come forward.
    if raw and raw.get("cx") is not None:
        return raw["cx"]
    return {"right_forward": 263.0, "center_forward": 184.0, "left_forward": 105.0}[name]


body_corr = corrected_rows(
    body_by,
    body_template,
    ["screen_y", "area"],
    "screen_x",
    body_x,
    lambda field, rv, tv: abs(rv - tv) > (8 if field == "screen_y" else 70),
)

forward_corr = corrected_rows(
    forward_by,
    forward_template,
    ["cy", "w", "h", "bbox_area", "mask_area"],
    "cx",
    forward_x,
    lambda field, rv, tv: abs(rv - tv) > {"cy": 18, "w": 28, "h": 32, "bbox_area": 1250, "mask_area": 650}[field],
)

with (OUT / "normalized_body_template.csv").open("w", encoding="utf-8", newline="") as f:
    fields = ["phase", "screen_x", "raw_screen_y", "corrected_screen_y", "screen_y_source", "raw_area", "corrected_area", "area_source", "track", "changed"]
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for r in sorted(body_corr, key=lambda x: (x["track"], x["phase"])):
        w.writerow(r)

with (OUT / "normalized_forward_template.csv").open("w", encoding="utf-8", newline="") as f:
    fields = ["phase", "cx", "raw_cy", "corrected_cy", "cy_source", "raw_w", "corrected_w", "w_source", "raw_h", "corrected_h", "h_source", "raw_bbox_area", "corrected_bbox_area", "bbox_area_source", "raw_mask_area", "corrected_mask_area", "mask_area_source", "track", "changed"]
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for r in sorted(forward_corr, key=lambda x: (x["track"], x["phase"])):
        w.writerow(r)

with (OUT / "normalized_track_summary.txt").open("w", encoding="utf-8") as f:
    f.write("Body template phases:\n")
    for p in sorted(body_template):
        t = body_template[p]
        f.write(f"  phase {p:3d}: y={t['screen_y']:.2f} area={t['area']:.1f}\n")
    f.write("\nForward template phases:\n")
    for p in sorted(forward_template):
        t = forward_template[p]
        f.write(f"  phase {p:3d}: cy={t['cy']:.2f} w={t['w']:.1f} h={t['h']:.1f} bbox={t['bbox_area']:.1f} mask={t['mask_area']:.1f}\n")
    f.write("\nCorrections:\n")
    f.write(f"  body changed rows: {sum(r['changed'] for r in body_corr)} / {len(body_corr)}\n")
    f.write(f"  forward changed rows: {sum(r['changed'] for r in forward_corr)} / {len(forward_corr)}\n")

print(OUT / "normalized_body_template.csv")
print(OUT / "normalized_forward_template.csv")
print((OUT / "normalized_track_summary.txt").read_text(encoding="utf-8"))
