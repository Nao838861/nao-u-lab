"""Post C92 Phase 4 diary to #log (single message)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("log")
assert channel_id, "could not resolve #log channel"

draft = Path(__file__).parent / "diary_log_20260420_C92_phase4.md"
text = draft.read_text(encoding="utf-8")
result = post_message(channel_id, text)
print("diary_log_20260420_C92_phase4.md", "->", result.get("ts"))
