"""Mario Clone - AI Script Interface + Logging + Replay

=== Play (headless, no Pygame) ===

    from api import MarioAPI
    game = MarioAPI()                        # Default test level
    game = MarioAPI("assets/level_1_1.txt")  # Mario 1-1

    state = game.reset()
    while not state['dead'] and not state['cleared']:
        state = game.step(right=True, b=True)
        if should_jump(state):
            state = game.step(right=True, b=True, a=True)

    game.save_log("my_run.json")

=== Replay (headless) ===

    from api import MarioAPI
    game = MarioAPI()
    states = game.replay("my_run.json")   # Returns list of all states
    for s in states:
        print(f"frame {s['frame']}: x={s['x']:.0f}")

=== Replay (visual, 60fps in Pygame window) ===

    python play.py --replay my_run.json
"""

import json
from core import MarioGame, Input
from tilemap import Tilemap, DEFAULT_LEVEL


class MarioAPI:
    """AI script interface with built-in logging.

    State dict keys:
        x, y        : position in pixels (float)
        vx, vy      : velocity in pixels/frame (float)
        on_ground   : bool
        dash        : bool
        stop        : bool
        flip        : bool (True = facing left)
        pattern     : int (0=stand, 1-3=walk, 4=brake, 5=jump)
        scroll_x    : camera scroll in pixels (float)
        frame       : int
        dead        : bool
        cleared     : bool
        goombas     : list of {x, y, alive, squished}
        koopas      : list of {x, y, alive, state}
    """

    def __init__(self, level_path=None):
        if level_path:
            with open(level_path, encoding='utf-8') as f:
                self._level_text = f.read()
        else:
            self._level_text = DEFAULT_LEVEL
        self._tm = Tilemap(self._level_text)
        self._game = MarioGame(tilemap=self._tm)

    def reset(self):
        """Reset game to initial state. Returns state dict.

        Rebuilds the tilemap from source so that mutated tiles
        (broken bricks, used ? blocks) are restored.
        """
        self._tm = Tilemap(self._level_text)
        self._game.tilemap = self._tm
        return self._game.reset()

    def step(self, left=False, right=False, a=False, b=False):
        """Advance one frame. Returns state dict."""
        return self._game.step(Input(left=left, right=right, a=a, b=b))

    def get_state(self):
        """Get current state without advancing."""
        return self._game.get_state()

    @property
    def done(self):
        """True if game ended (dead or cleared)."""
        return self._game.dead or self._game.cleared

    @property
    def log(self):
        """Frame log: list of {frame, input, x, y, vx, vy, ...}."""
        return self._game.log

    def save_log(self, path):
        """Save frame log to JSON file."""
        data = {
            'level': self._level_text,
            'result': 'cleared' if self._game.cleared else
                      'dead' if self._game.dead else 'incomplete',
            'total_frames': self._game.frame,
            'final_x': self._game.x / 256,
            'frames': self._game.log,
        }
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, separators=(',', ':'))

    def replay(self, path):
        """Load a log file and replay it. Returns list of state dicts."""
        with open(path, encoding='utf-8') as f:
            data = json.load(f)

        # Rebuild tilemap from saved level
        if 'level' in data:
            tm = Tilemap(data['level'])
            game = MarioGame(tilemap=tm)
        else:
            game = MarioGame(tilemap=self._tm)

        states = [game.get_state()]
        for entry in data['frames']:
            inp = entry['input']
            state = game.step(Input(
                left=inp['left'], right=inp['right'],
                a=inp['a'], b=inp['b'],
            ))
            states.append(state)
        return states

    @staticmethod
    def load_log(path):
        """Load a log file and return the raw data dict."""
        with open(path, encoding='utf-8') as f:
            return json.load(f)
