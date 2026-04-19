"""Post C82 Phase 4 diary to #log."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import _resolve_channel, post_message

draft = Path(__file__).parent / "diary_log_20260419_C82_phase4.md"
text = draft.read_text(encoding="utf-8")

channel_id = _resolve_channel("log")
assert channel_id, "could not resolve #log channel"
result = post_message(channel_id, text)
print(result)
