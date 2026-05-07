"""Mario Clone - Text-based Tilemap

Level format: each character = one 16x16 tile.
  .  empty (sky)
  =  ground block
  #  brick block
  ?  question block
  !  used question block (hit from below)
  S  springboard (bounces Mario very high)
  o  coin (collectible, non-solid)
  G  Goomba spawn point (replaced with '.' after parsing)
  K  Koopa Troopa spawn point (replaced with '.' after parsing)

Easy for humans and LLMs to edit.
"""

SOLID_TILES = frozenset('=#?![]{}XcsmTQS')
SPAWN_CHARS = frozenset('GK')  # Entity spawns (not solid tiles)
GOAL_TILE = 'P'               # Flagpole (not solid, triggers clear)


class Tilemap:
    """Tile-based level map loaded from a text string."""

    def __init__(self, text):
        lines = text.split('\n')
        while lines and not lines[0].strip():
            lines.pop(0)
        while lines and not lines[-1].strip():
            lines.pop()

        self.tiles = [list(line) for line in lines]
        self.rows = len(self.tiles)
        self.cols = max((len(row) for row in self.tiles), default=0)

        # Pad all rows to same width
        for row in self.tiles:
            row.extend(['.'] * (self.cols - len(row)))

        # Extract entity spawn positions, then clear from tile grid
        self.goomba_spawns = []
        self.koopa_spawns = []
        for r, row in enumerate(self.tiles):
            for c, ch in enumerate(row):
                if ch == 'G':
                    self.goomba_spawns.append((c * 16, r * 16))
                    row[c] = '.'
                elif ch == 'K':
                    self.koopa_spawns.append((c * 16, r * 16))
                    row[c] = '.'

    @property
    def pixel_width(self):
        return self.cols * 16

    @property
    def pixel_height(self):
        return self.rows * 16

    def get(self, pixel_x, pixel_y):
        """Get tile char at pixel position. '.' for out of bounds."""
        if pixel_x < 0 or pixel_y < 0:
            return '.'
        col = pixel_x // 16
        row = pixel_y // 16
        if row >= self.rows or col >= self.cols:
            return '.'
        return self.tiles[row][col]

    def is_solid(self, pixel_x, pixel_y):
        """True if tile at pixel position blocks movement."""
        return self.get(pixel_x, pixel_y) in SOLID_TILES

    def find_ground(self, pixel_x):
        """Find the ground surface Y pixel at the given X.

        Scans from bottom up to find the topmost row of the lowest
        solid group, skipping floating platforms above.
        """
        col = pixel_x // 16
        if col < 0 or col >= self.cols:
            return None
        ground_top = None
        for row in range(self.rows - 1, -1, -1):
            if self.tiles[row][col] in SOLID_TILES:
                ground_top = row * 16
            elif ground_top is not None:
                return ground_top
        return ground_top


# Default test level: 15 rows x 100 columns (NES standard)
# Ground at rows 13-14. Floating platforms at row 8.
# G = Goomba spawns (on row 12, fall to ground)
DEFAULT_LEVEL = """\
....................................................................................................
....................................................................................................
....................................................................................................
....................................................................................................
....................................................................................................
....................................................................................................
....................................................................................................
....................................................................................................
........===.........................................................====.............................
....................?...#?#?#.......................................?..?..?...........................
....................................................................................................
....................................................................................................
...............G..............G...........K............G..........===.....K.....G...................
====================================..======..======================..==============================
====================================..======..======================..=============================="""
