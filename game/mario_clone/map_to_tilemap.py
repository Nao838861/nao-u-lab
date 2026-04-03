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
COLOR_GREEN_BRIGHT = (0, 168, 0)
COLOR_GREEN_HILL = (128, 208, 16)
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
        return "pipe_green"
    if color_match((r, g, b), COLOR_GREEN_HILL, 40):
        return "hill_green"
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
    # Sample 4x4 grid inside the tile
    for dx_frac in [0.2, 0.4, 0.6, 0.8]:
        for dy_frac in [0.2, 0.4, 0.6, 0.8]:
            px = int(x0 + tile_size * dx_frac)
            py = int(y0 + tile_size * dy_frac)
            if 0 <= px < img.width and 0 <= py < img.height:
                r, g, b = img.getpixel((px, py))[:3]
                cats[classify_pixel(r, g, b)] += 1
    # Return category with most votes, ignoring "sky" ties
    if not cats:
        return "sky"
    # If brown or question or pipe_green present, prefer them over sky
    for priority in ["question", "brown", "pipe_green"]:
        if cats[priority] >= 4:  # At least 4/16 samples
            return priority
    return cats.most_common(1)[0][0]


def analyze_image(img_path):
    """Parse the map image into a tile grid."""
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    tile_size = 16

    # Level area is top 240 pixels (15 rows of 16px)
    level_h = 15 * tile_size  # 240
    if h > level_h:
        # Crop to just the level area
        img = img.crop((0, 0, w, level_h))

    cols = w // tile_size
    rows = level_h // tile_size
    print(f"Image: {w}x{h}, level area: {cols}x{rows} tiles @ {tile_size}px",
          file=sys.stderr)

    # Classify all tiles
    grid = []
    for row in range(rows):
        line = []
        for col in range(cols):
            cat = classify_tile(img, col, row, tile_size)
            line.append(cat)
        grid.append(line)

    return grid, cols, rows, tile_size


def detect_pipes(grid, cols, rows):
    """Detect pipes: 2-wide vertical columns of pipe_green."""
    pipe_cells = {}  # (row, col) -> "top_left"|"top_right"|"body_left"|"body_right"

    visited = set()
    for col in range(cols - 1):
        for row in range(rows - 2):
            if (row, col) in visited:
                continue
            # Look for 2-wide green column
            if (grid[row][col] == "pipe_green" and
                    grid[row][col + 1] == "pipe_green"):
                # Check above isn't green (this is the top)
                if row == 0 or grid[row - 1][col] != "pipe_green":
                    # Trace down
                    top = row
                    r = row
                    while r < rows and grid[r][col] == "pipe_green":
                        visited.add((r, col))
                        visited.add((r, col + 1))
                        if r == top:
                            pipe_cells[(r, col)] = "top_left"
                            pipe_cells[(r, col + 1)] = "top_right"
                        else:
                            pipe_cells[(r, col)] = "body_left"
                            pipe_cells[(r, col + 1)] = "body_right"
                        r += 1

    return pipe_cells


def detect_gaps(grid, cols, rows):
    """Detect gaps in the ground (rows 13-14 not brown)."""
    gaps = set()
    for col in range(cols):
        if grid[rows - 1][col] != "brown" and grid[rows - 2][col] != "brown":
            gaps.add(col)
    return gaps


def build_tilemap(grid, cols, rows, pipe_cells, gaps):
    """Convert classified grid to tilemap text."""
    lines = []
    for row in range(rows):
        chars = []
        for col in range(cols):
            cell = (row, col)
            cat = grid[row][col]

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
                    # Near end of level, check for staircase pattern
                    # Stairs: ascending brown blocks from right to left
                    chars.append("X")
                else:
                    chars.append("#")  # Brick
            elif cat == "question":
                chars.append("?")
            elif cat in ("sky", "white", "peach", "hill_green",
                         "dark_green", "black", "teal",
                         "light_teal", "other"):
                chars.append(".")
            elif cat == "pipe_green":
                # Stray green not caught by pipe detection (bushes, etc)
                chars.append(".")
            else:
                chars.append(".")

        lines.append("".join(chars))

    return lines


# --- Mario 1-1 known block contents ---
# Column positions are from the left edge of the 224-tile grid.
# These are the well-documented contents of each special block.
MARIO_1_1 = {
    # Question blocks with mushroom/fireflower
    "Q": [  # question block → mushroom
        (5, 22),   # Floating ? above brick row (power-up)
        (9, 106),  # After second pit area
    ],
    # Brick with coins
    "c": [
        (9, 24),   # Right brick in ?#?#? group (coin)
    ],
    # Brick with star
    "s": [
        (9, 78),   # Star block
    ],
    # Brick with 1UP mushroom
    "m": [
        (5, 101),  # Hidden 1UP
    ],
    # 10-coin brick
    "T": [
        (9, 94),   # 10-coin block
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
                # Only replace if it's the right base type
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

    grid, cols, rows, tile_size = analyze_image(args.image)
    pipe_cells = detect_pipes(grid, cols, rows)
    gaps = detect_gaps(grid, cols, rows)

    print(f"Detected {len(pipe_cells)//4} pipes, "
          f"{len(gaps)} gap columns", file=sys.stderr)

    lines = build_tilemap(grid, cols, rows, pipe_cells, gaps)

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
