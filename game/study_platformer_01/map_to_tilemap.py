"""map_to_tilemap.py — Mario map image → text tilemap converter

Analyzes a full-width Mario stage map image and converts it to
the text tilemap format used by tilemap.py.

Extended tile characters:
  .  empty (sky)
  =  ground block
  #  brick block (empty)
  c  brick block (coin inside)
  m  brick block (mushroom inside)
  s  brick block (star inside)
  ?  question block (coin)
  Q  question block (mushroom)
  T  10-coin brick (looks like normal brick)
  [  pipe top-left
  ]  pipe top-right
  {  pipe body-left
  }  pipe body-right
  X  staircase block
  G  Goomba spawn
  P  flagpole (goal)

Usage:
  python map_to_tilemap.py assets/reference_map.png
  python map_to_tilemap.py assets/reference_map.png --annotate 1-1
  python map_to_tilemap.py assets/reference_map.png -o level_1_1.txt
"""

import argparse
import sys
from pathlib import Path
from collections import Counter

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow required. pip install Pillow", file=sys.stderr)
    sys.exit(1)


# --- Color definitions (supports both NES-exact and GIF palette) ---
COLOR_SKY = (96, 150, 255)            # GIF: (96,150,255), NES: (92,148,252)
COLOR_BROWN = (200, 76, 12)           # GIF: ~(206,82,19), NES: (200,76,12)
COLOR_QUESTION = (252, 152, 56)
COLOR_GREEN_BRIGHT = (0, 170, 0)      # GIF: (0,171,0), NES: (0,168,0)
COLOR_GREEN_HILL = (130, 210, 17)     # GIF: (130,212,17), NES: (128,208,16)
COLOR_GREEN_DARK = (0, 68, 0)
COLOR_WHITE = (252, 252, 252)
COLOR_PEACH = (252, 188, 176)         # GIF: (251,188,175)
COLOR_TEAL = (0, 128, 136)
COLOR_LIGHT_TEAL = (156, 252, 240)
COLOR_BLACK = (0, 0, 0)


def color_match(pixel, ref, tol=25):
    return all(abs(a - b) <= tol for a, b in zip(pixel, ref))


def classify_pixel(r, g, b):
    """Map a pixel RGB to a category."""
    if color_match((r, g, b), COLOR_SKY, 35):
        return "sky"
    if r < 20 and g < 20 and b < 20:
        return "black"
    # Green detection first (before brown, since some greens have r>0)
    if g > 130 and r < 60 and b < 60:
        return "dark_green_obj"   # Dark green (pipes AND bushes)
    if g > 170 and r > 80 and r < 170 and b < 50:
        return "light_green_obj"  # Light green (pipes only, NOT bushes)
    if color_match((r, g, b), COLOR_GREEN_DARK, 35):
        return "dark_green"
    if color_match((r, g, b), COLOR_BROWN, 40):
        return "brown"
    if color_match((r, g, b), COLOR_QUESTION, 35):
        return "question"
    if r > 230 and g > 230 and b > 230:
        return "white"
    if color_match((r, g, b), COLOR_PEACH, 35):
        return "peach"
    if color_match((r, g, b), COLOR_TEAL, 35):
        return "teal"
    if color_match((r, g, b), COLOR_LIGHT_TEAL, 35):
        return "light_teal"
    return "other"


def classify_tile(img, col, row, tile_w, tile_h=None):
    """Classify a tile by sampling multiple points."""
    if tile_h is None:
        tile_h = tile_w
    cats = Counter()
    x0 = col * tile_w
    y0 = row * tile_h
    for dx_frac in [0.2, 0.4, 0.6, 0.8]:
        for dy_frac in [0.2, 0.4, 0.6, 0.8]:
            px = int(x0 + tile_w * dx_frac)
            py = int(y0 + tile_h * dy_frac)
            if 0 <= px < img.width and 0 <= py < img.height:
                r, g, b = img.getpixel((px, py))[:3]
                cats[classify_pixel(r, g, b)] += 1
    if not cats:
        return "sky"

    # --- Goomba/sprite detection ---
    # Goomba = brown body + peach feet. Background is sky OR bush green.
    # When Goomba overlaps a bush, sky=0 but dark_green_obj fills the role.
    # Distinguish from castle/ground (brown+peach but no background gap):
    #   Goomba: brown ~96, peach ~44 (peach < brown)
    #   Castle window: brown ~72, peach ~88 (peach > brown)
    bg = cats["sky"] + cats["dark_green_obj"]
    if cats["brown"] >= 3 and bg >= 3 and cats["peach"] >= 2 and cats["peach"] <= cats["brown"]:
        return "goomba"
    if cats["peach"] >= 2 and cats["brown"] >= 3 and bg >= 1 and cats["peach"] <= cats["brown"]:
        return "goomba"

    # --- Koopa detection ---
    # Koopa: green shell + orange belly (same (252,152,56) as ? block)
    # This combination is unique: ? blocks have zero green, pipes have zero orange.
    light = cats["light_green_obj"]
    dark = cats["dark_green_obj"]
    total_green = light + dark
    if total_green >= 3 and cats["question"] >= 2:
        return "koopa"

    # --- Green tile classification ---
    # Key rule: pipes have BOTH light_green (128,208,16) AND dark_green (0,168,0)
    #           bushes have ONLY dark_green (0,168,0), zero light_green

    if total_green >= 4:
        if light >= 2 and dark >= 1:
            return "pipe_green"   # Real pipe (both greens present)
        elif light >= 4 and dark == 0:
            return "hill_green"   # Hill decoration (light green only)
        else:
            return "bush"         # Bush (dark green only)

    # Standard priority classification
    for priority in ["question", "brown"]:
        if cats[priority] >= 4:
            return priority
    return cats.most_common(1)[0][0]


def analyze_image(img_path):
    """Parse the map image into a tile grid.

    Supports both full-res (16px tiles) and scaled images (auto-detect).
    """
    img = Image.open(img_path).convert("RGB")
    w, h = img.size

    rows = 15  # NES: always 15 tile rows

    # Auto-detect tile size from image dimensions
    tile_h = h / rows
    if tile_h > 12:
        # Full-res image (~16px tiles)
        tile_w = 16
        tile_h = 16
        level_h = rows * 16
        if h > level_h:
            img = img.crop((0, 0, w, level_h))
        cols = w // 16
    else:
        # Scaled image (e.g. GIF overview maps, ~7px tiles)
        tile_w = round(w / round(w / 7))  # Snap to nearest integer tile width
        cols = round(w / tile_w)
        print(f"Auto-detected scaled image: tile {tile_w:.2f}x{tile_h:.2f}",
              file=sys.stderr)

    print(f"Image: {w}x{h}, level area: {cols}x{rows} tiles "
          f"@ {tile_w:.1f}x{tile_h:.1f}px",
          file=sys.stderr)

    grid = []
    for row in range(rows):
        line = []
        for col in range(cols):
            cat = classify_tile(img, col, row, tile_w, tile_h)
            line.append(cat)
        grid.append(line)

    return grid, cols, rows, tile_w, img


def detect_pipes(grid, cols, rows):
    """Detect pipes: 2-wide vertical columns of pipe_green, at least 2 rows tall."""
    pipe_cells = {}

    visited = set()
    for col in range(cols - 1):
        for row in range(rows - 2):
            if (row, col) in visited:
                continue
            if (grid[row][col] == "pipe_green" and
                    grid[row][col + 1] == "pipe_green"):
                if row == 0 or grid[row - 1][col] != "pipe_green":
                    # Trace down
                    top = row
                    r = row
                    while r < rows and grid[r][col] == "pipe_green":
                        visited.add((r, col))
                        visited.add((r, col + 1))
                        r += 1
                    height = r - top
                    if height >= 2:  # Real pipes are at least 2 tiles tall
                        for rr in range(top, r):
                            if rr == top:
                                pipe_cells[(rr, col)] = "top_left"
                                pipe_cells[(rr, col + 1)] = "top_right"
                            else:
                                pipe_cells[(rr, col)] = "body_left"
                                pipe_cells[(rr, col + 1)] = "body_right"
    return pipe_cells


def detect_flagpole(img, cols, rows, tile_w, tile_h=None):
    """Detect the flagpole: thin vertical line of light green near end of level."""
    if tile_h is None:
        tile_h = tile_w
    # Scale thresholds to tile area
    area = tile_w * tile_h
    min_green = max(2, int(area * 0.08))
    max_green = max(5, int(area * 0.5))

    for col in range(max(0, cols - 30), cols):
        consecutive = 0
        start_row = None
        for row in range(rows):
            x0, y0 = int(col * tile_w), int(row * tile_h)
            x1, y1 = int((col + 1) * tile_w), int((row + 1) * tile_h)
            count = 0
            for dy in range(y0, min(y1, img.height)):
                for dx in range(x0, min(x1, img.width)):
                    r, g, b = img.getpixel((dx, dy))[:3]
                    if color_match((r, g, b), COLOR_GREEN_HILL, 35):
                        count += 1
            if min_green <= count <= max_green:
                if start_row is None:
                    start_row = row
                consecutive += 1
            else:
                if consecutive >= 5:
                    print(f"Flagpole at col {col}, rows {start_row}-{start_row + consecutive - 1}",
                          file=sys.stderr)
                    return col, start_row, start_row + consecutive - 1
                consecutive = 0
                start_row = None
        if consecutive >= 5:
            print(f"Flagpole at col {col}, rows {start_row}-{start_row + consecutive - 1}",
                  file=sys.stderr)
            return col, start_row, start_row + consecutive - 1
    return None


def detect_gaps(grid, cols, rows):
    """Detect gaps in the ground (rows 13-14 not brown)."""
    gaps = set()
    for col in range(cols):
        if grid[rows - 1][col] != "brown" and grid[rows - 2][col] != "brown":
            gaps.add(col)
    return gaps


def build_tilemap(grid, cols, rows, pipe_cells, gaps, flagpole_col=None):
    """Convert classified grid to tilemap text."""
    lines = []
    for row in range(rows):
        chars = []
        for col in range(cols):
            cell = (row, col)
            cat = grid[row][col]

            # Flagpole
            if flagpole_col is not None and col == flagpole_col and row <= rows - 3:
                chars.append("P")
                continue

            # Pipe tiles
            if cell in pipe_cells:
                ptype = pipe_cells[cell]
                char_map = {
                    "top_left": "[", "top_right": "]",
                    "body_left": "{", "body_right": "}"
                }
                chars.append(char_map[ptype])
            elif cat == "brown":
                if row >= rows - 2:
                    chars.append("=")  # Ground
                elif row >= rows - 5 and col > cols - 35:
                    chars.append("X")  # Staircase near end
                else:
                    chars.append("#")  # Brick
            elif cat == "goomba":
                if row >= rows - 4:
                    chars.append("G")
                else:
                    chars.append(".")
            elif cat == "koopa":
                if row >= rows - 4:
                    chars.append("K")
                else:
                    chars.append(".")
            elif cat == "question":
                chars.append("?")
            elif cat in ("sky", "white", "peach", "hill_green",
                         "dark_green", "black", "teal",
                         "light_teal", "other", "bush",
                         "dark_green_obj", "light_green_obj"):
                chars.append(".")
            elif cat == "pipe_green":
                # Stray pipe_green not caught by pipe detection
                chars.append(".")
            else:
                chars.append(".")

        lines.append("".join(chars))

    return lines


# --- Mario 1-1 known block contents ---
MARIO_1_1 = {
    "Q": [
        (5, 22),
        (9, 106),
    ],
    "c": [
        (9, 24),
    ],
    "s": [
        (9, 78),
    ],
    "m": [
        (5, 101),
    ],
    "T": [
        (9, 94),
    ],
}


def annotate_known_level(lines, level_id):
    """Replace generic # and ? with specific content markers."""
    if level_id != "1-1":
        return lines

    grid = [list(line) for line in lines]

    for char, positions in MARIO_1_1.items():
        for row, col in positions:
            if row < len(grid) and col < len(grid[row]):
                current = grid[row][col]
                if char in ("Q",) and current == "?":
                    grid[row][col] = char
                elif char in ("c", "s", "m", "T") and current == "#":
                    grid[row][col] = char
                else:
                    print(f"  Annotation skip: ({row},{col})='{current}'"
                          f" expected '#' or '?', got '{current}'",
                          file=sys.stderr)

    return ["".join(row) for row in grid]


def main():
    parser = argparse.ArgumentParser(
        description="Convert Mario map image to text tilemap")
    parser.add_argument("image", help="Path to map image PNG")
    parser.add_argument("--annotate", choices=["1-1"],
                        help="Apply known block contents")
    parser.add_argument("-o", "--output", help="Output file (default: stdout)")
    args = parser.parse_args()

    grid, cols, rows, tile_w, img = analyze_image(args.image)
    tile_h = img.height / rows
    pipe_cells = detect_pipes(grid, cols, rows)
    gaps = detect_gaps(grid, cols, rows)

    flagpole_result = detect_flagpole(img, cols, rows, tile_w, tile_h)
    flagpole_col = flagpole_result[0] if flagpole_result else None

    print(f"Detected {len(pipe_cells) // 4} pipes, "
          f"{len(gaps)} gap columns", file=sys.stderr)

    lines = build_tilemap(grid, cols, rows, pipe_cells, gaps, flagpole_col)

    if args.annotate:
        lines = annotate_known_level(lines, args.annotate)

    # Trim trailing dots
    max_len = max(len(line.rstrip(".")) for line in lines)
    lines = [line[:max(max_len, len(line))] for line in lines]

    output = "\n".join(lines)
    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
        print(f"Written to {args.output}", file=sys.stderr)
    else:
        print(output)


if __name__ == "__main__":
    main()
