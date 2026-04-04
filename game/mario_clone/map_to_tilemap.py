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
  python map_to_tilemap.py assets/SuperMarioBrosMap1-1.png
  python map_to_tilemap.py assets/SuperMarioBrosMap1-1.png --annotate 1-1
  python map_to_tilemap.py assets/SuperMarioBrosMap1-1.png -o level_1_1.txt
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


# --- NES Mario color definitions (exact palette values) ---
COLOR_SKY = (92, 148, 252)
COLOR_BROWN = (200, 76, 12)
COLOR_QUESTION = (252, 152, 56)
COLOR_GREEN_BRIGHT = (0, 168, 0)      # Dark green (pipes AND bushes)
COLOR_GREEN_HILL = (128, 208, 16)     # Light green (pipes only, NOT bushes)
COLOR_GREEN_DARK = (0, 68, 0)
COLOR_WHITE = (252, 252, 252)
COLOR_PEACH = (252, 188, 176)
COLOR_TEAL = (0, 128, 136)
COLOR_LIGHT_TEAL = (156, 252, 240)
COLOR_BLACK = (0, 0, 0)


def color_match(pixel, ref, tol=25):
    return all(abs(a - b) <= tol for a, b in zip(pixel, ref))


def classify_pixel(r, g, b):
    """Map a pixel RGB to a category."""
    if color_match((r, g, b), COLOR_SKY, 30):
        return "sky"
    if r < 15 and g < 15 and b < 15:
        return "black"
    if color_match((r, g, b), COLOR_BROWN, 30):
        return "brown"
    if color_match((r, g, b), COLOR_QUESTION, 30):
        return "question"
    if color_match((r, g, b), COLOR_GREEN_BRIGHT, 30):
        return "dark_green_obj"   # Dark green (shared by pipes AND bushes)
    if color_match((r, g, b), COLOR_GREEN_HILL, 40):
        return "light_green_obj"  # Light green (pipes only, NOT bushes)
    if color_match((r, g, b), COLOR_GREEN_DARK, 30):
        return "dark_green"
    if color_match((r, g, b), COLOR_WHITE, 10):
        return "white"
    if color_match((r, g, b), COLOR_PEACH, 30):
        return "peach"
    if color_match((r, g, b), COLOR_TEAL, 30):
        return "teal"
    if color_match((r, g, b), COLOR_LIGHT_TEAL, 30):
        return "light_teal"
    return "other"


def classify_tile(img, col, row, tile_size):
    """Classify a tile by sampling multiple points."""
    cats = Counter()
    x0 = col * tile_size
    y0 = row * tile_size
    for dx_frac in [0.2, 0.4, 0.6, 0.8]:
        for dy_frac in [0.2, 0.4, 0.6, 0.8]:
            px = int(x0 + tile_size * dx_frac)
            py = int(y0 + tile_size * dy_frac)
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
    """Parse the map image into a tile grid."""
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    tile_size = 16

    level_h = 15 * tile_size  # 240
    if h > level_h:
        img = img.crop((0, 0, w, level_h))

    cols = w // tile_size
    rows = level_h // tile_size
    print(f"Image: {w}x{h}, level area: {cols}x{rows} tiles @ {tile_size}px",
          file=sys.stderr)

    grid = []
    for row in range(rows):
        line = []
        for col in range(cols):
            cat = classify_tile(img, col, row, tile_size)
            line.append(cat)
        grid.append(line)

    return grid, cols, rows, tile_size, img


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


def detect_flagpole(img, cols, rows, tile_size):
    """Detect the flagpole: thin vertical line of light green near end of level.

    Flagpole has ~32 light_green pixels per tile (2px wide pole),
    much less than pipes (~195). Spans 6+ consecutive rows.
    """
    for col in range(max(0, cols - 30), cols):
        consecutive = 0
        start_row = None
        for row in range(rows):
            x0, y0 = col * tile_size, row * tile_size
            count = 0
            for dy in range(tile_size):
                for dx in range(tile_size):
                    r, g, b = img.getpixel((x0 + dx, y0 + dy))[:3]
                    if color_match((r, g, b), COLOR_GREEN_HILL, 30):
                        count += 1
            if 15 <= count <= 80:
                if start_row is None:
                    start_row = row
                consecutive += 1
            else:
                if consecutive >= 6:
                    print(f"Flagpole at col {col}, rows {start_row}-{start_row + consecutive - 1}",
                          file=sys.stderr)
                    return col, start_row, start_row + consecutive - 1
                consecutive = 0
                start_row = None
        if consecutive >= 6:
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

    grid, cols, rows, tile_size, img = analyze_image(args.image)
    pipe_cells = detect_pipes(grid, cols, rows)
    gaps = detect_gaps(grid, cols, rows)

    flagpole_result = detect_flagpole(img, cols, rows, tile_size)
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
