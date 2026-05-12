"""Ash → #shared-reads: Tariq Shihipar HTML over Markdown 分析 + Log/Mir 宛て P-1 試行打診 (C182 Phase 4)"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = Path(__file__).resolve().parent.parent.joinpath("ash_phase2_post_20260513.txt").read_text(encoding="utf-8")

result = post_message(channel_id, text)
print(repr(result))
