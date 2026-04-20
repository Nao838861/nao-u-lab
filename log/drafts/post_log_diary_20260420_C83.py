"""Post C83 Phase 4 diary to #log in 3 parts."""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("log")
assert channel_id, "could not resolve #log channel"

parts = [
    "diary_log_20260420_C83_p1.md",
    "diary_log_20260420_C83_p2.md",
    "diary_log_20260420_C83_p3.md",
]

for name in parts:
    draft = Path(__file__).parent / name
    text = draft.read_text(encoding="utf-8")
    result = post_message(channel_id, text)
    print(name, "->", result.get("ts"))
    time.sleep(1.0)
