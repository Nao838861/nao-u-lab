"""Mario Clone - AI Script Interface

LLM/external scripts use this to play the game without rendering.
No Pygame dependency. No API cost per frame.

Usage:
    from api import MarioAPI

    game = MarioAPI()
    state = game.reset()

    # Run right with dash for 120 frames (2 seconds)
    for _ in range(120):
        state = game.step(right=True, b=True)

    # Jump
    state = game.step(right=True, b=True, a=True)

    # Custom level:
    game = MarioAPI(level_text='===....===')
"""

from core import MarioGame, Input
from tilemap import Tilemap, DEFAULT_LEVEL


class MarioAPI:
    """Simple interface for AI scripts to play the game.

    State dict keys:
        x, y        : position in pixels (float)
        vx, vy      : velocity in pixels/frame (float)
        on_ground   : bool
        dash        : bool (B button held on ground)
        stop        : bool (braking this frame)
        flip        : bool (True = facing left)
        pattern     : int (animation: 0=stand, 1-3=walk, 4=brake, 5=jump)
        scroll_x    : camera scroll in pixels (float)
        frame       : frame counter (int)
    """

    def __init__(self, level_text=None):
        tm = Tilemap(level_text if level_text else DEFAULT_LEVEL)
        self._game = MarioGame(tilemap=tm)

    def reset(self):
        """Reset game to initial state. Returns state dict."""
        return self._game.reset()

    def step(self, left=False, right=False, a=False, b=False):
        """Advance one frame with given inputs. Returns state dict."""
        return self._game.step(Input(left=left, right=right, a=a, b=b))

    def get_state(self):
        """Get current state without advancing a frame."""
        return self._game.get_state()
