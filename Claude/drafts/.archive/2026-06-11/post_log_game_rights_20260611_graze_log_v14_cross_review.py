"""Log C323 Phase 3 -> #game-rights: graze_log v14 (k-α + k-β) cross_review 観点共有 (judgment は Ash 主導継続)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights channel"

draft_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                          "post_log_game_rights_graze_log_v14_cross_review_20260611.txt")
with open(draft_path, "r", encoding="utf-8") as f:
    text = f.read().rstrip()

ts = post_message(channel_id, text)
print(f"posted ts={ts}")
