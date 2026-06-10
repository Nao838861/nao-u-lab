from pathlib import Path
import csv
import re

ROOT = Path(r"D:\HomeBrew\MonoSH")
AN = Path(r"D:\AI\Nao_u_BOT\GPT\tmp\monosh_spaceharrier_analysis")
OUT = ROOT / "tools" / "houdini" / "export" / "enemy_path_spaceharrier_wave1_tables.h"

SPRITE_H = [30, 24, 21, 19, 17, 15, 14, 12, 10, 9, 8, 6, 5, 4, 2, 2]


def read_csv(path):
    with path.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def parse_enemy_z2sc():
    text = (ROOT / "src" / "enemy_tables.c").read_text(encoding="utf-8")
    m = re.search(r"const unsigned int enemy_z2sc\[224\] = \{(.*?)\};", text, re.S)
    if not m:
        raise RuntimeError("enemy_z2sc not found")
    return [int(x) for x in re.findall(r"\d+", m.group(1))]


def size_to_wz_map():
    text = (ROOT / "src" / "enemy_tables.c").read_text(encoding="utf-8")
    m = re.search(r"const unsigned char enemy_z2size\[224\] = \{(.*?)\};", text, re.S)
    if not m:
        raise RuntimeError("enemy_z2size not found")
    vals = [int(x) for x in re.findall(r"\d+", m.group(1))]
    out = {}
    for size in range(16):
        idxs = [i for i, v in enumerate(vals) if v == size]
        out[size] = idxs[len(idxs) // 2] if idxs else 0
    return out


Z2SC = parse_enemy_z2sc()
SIZE_TO_WZ = size_to_wz_map()


def nearest_size_from_h(h):
    h = max(2, min(30, float(h)))
    return min(range(16), key=lambda i: abs(SPRITE_H[i] - h))


def wx_from_sx_wz(sx, wz):
    sc = Z2SC[max(0, min(223, int(wz)))]
    dx = int(round(sx)) - 128
    if sc <= 0:
        return 0
    return int(round(dx * 512 / sc))


body_rows = read_csv(AN / "normalized_body_template.csv")
forward_rows = read_csv(AN / "normalized_forward_template.csv")

body_by_track = {}
for r in body_rows:
    body_by_track.setdefault(r["track"], {})[int(r["phase"])] = r

forward_track_name = {
    "right": "right_forward",
    "center": "center_forward",
    "left": "left_forward",
}
forward_by_track = {}
for r in forward_rows:
    forward_by_track.setdefault(r["track"], {})[int(r["phase"])] = r

logical_x = {
    "right": 214,
    "center": 134,
    "left": 51,
}
pattern_id = {
    "right": 1,
    "center": 2,
    "left": 3,
}


def make_path(name):
    frames = []

    # Body rise: phase -30..-1. Use direct screen Y as bottom-center proxy.
    for phase in range(-30, 0):
        r = body_by_track[name][phase]
        sx = logical_x[name]
        bot = int(round(float(r["corrected_screen_y"])))
        area = float(r["corrected_area"])
        # Small far enemy: area 80..114 -> size 10..8 roughly.
        size = max(8, min(12, int(round(13 - area / 28))))
        wz = SIZE_TO_WZ[size]
        frames.append({"sx": sx, "bot": bot, "size": size, "wz": wz})

    # A few top/shot frames before the forward-facing sprite dominates.
    top = frames[-1]
    for _ in range(3):
        frames.append(dict(top))

    # Forward motion: phase 0..21. Convert bbox height to sprite size.
    ftrack = forward_track_name[name]
    for phase in range(0, 22):
        r = forward_by_track[ftrack][phase]
        raw_cx = r.get("cx", "")
        sx_src = float(raw_cx) if raw_cx != "" else logical_x[name] / 0.8
        sx = int(round(sx_src * 0.8))
        bot = int(round(float(r["corrected_cy"])))
        h = float(r["corrected_h"])
        size = nearest_size_from_h(h)
        wz = SIZE_TO_WZ[size]
        frames.append({"sx": sx, "bot": bot, "size": size, "wz": wz})

    for fr in frames:
        fr["wz"] = max(0, min(223, int(fr["wz"])))
        fr["zb"] = max(0, min(7, fr["wz"] >> 5))
        fr["wy"] = max(0, min(255, int(fr["bot"])))
        fr["wx"] = wx_from_sx_wz(fr["sx"], fr["wz"])
    return frames


def c_array(name, ctype, vals, per_line=10):
    lines = [f"static const {ctype} {name}[ENEMY_PATH_SPACEHARRIER_WAVE1_FRAMES] = {{"]
    for i in range(0, len(vals), per_line):
        chunk = vals[i:i + per_line]
        lines.append("    " + ", ".join(str(v) for v in chunk) + ("," if i + per_line < len(vals) else ""))
    lines.append("};")
    return "\n".join(lines)


parts = [
    "/* Auto-generated from Space Harrier reference clip analysis.",
    " * Source: C:/Users/owner/Downloads/スペースハリアー参考.mp4, 34s..40s, left half.",
    " * Template: body rise + forward approach, normalized across right/center/left tracks.",
    " */",
    "#define ENEMY_PATH_SPACEHARRIER_WAVE1_FRAMES 55",
    "",
]

shared_frames = make_path("right")

for name in ("right", "center", "left"):
    pid = pattern_id[name]
    frames = make_path(name)
    prefix = f"enemy_path_{pid}"
    parts.append(f"/* Space Harrier wave1 {name} lane */")
    parts.append(c_array(f"{prefix}_wx", "signed int", [f["wx"] for f in frames]))
    parts.append(c_array(f"{prefix}_sx", "unsigned char", [f["sx"] for f in frames]))
    if name == "right":
        parts.append(c_array(f"{prefix}_wy", "unsigned char", [f["wy"] for f in shared_frames]))
        parts.append(c_array(f"{prefix}_wz", "unsigned char", [f["wz"] for f in shared_frames]))
        parts.append(c_array(f"{prefix}_bot", "unsigned char", [f["bot"] for f in shared_frames]))
        parts.append(c_array(f"{prefix}_sz", "unsigned char", [f["size"] for f in shared_frames]))
        parts.append(c_array(f"{prefix}_zb", "unsigned char", [f["zb"] for f in shared_frames]))
    else:
        parts.append(f"#define {prefix}_wy  enemy_path_1_wy")
        parts.append(f"#define {prefix}_wz  enemy_path_1_wz")
        parts.append(f"#define {prefix}_bot enemy_path_1_bot")
        parts.append(f"#define {prefix}_sz  enemy_path_1_sz")
        parts.append(f"#define {prefix}_zb  enemy_path_1_zb")
    parts.append("")

OUT.write_text("\n".join(parts), encoding="utf-8", newline="\n")
print(OUT)
