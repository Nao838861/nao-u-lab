"""Ash Phase 4 日記投稿: 候補軸4本が型はずれ例に降格された朝
チャンネル: #ash (C0ALVUSHK8E)
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from slack_bot import post_message

DRAFT = ROOT / "drafts" / "2026-04-28" / "diary_ash_phase4_shu_break_two_directions_20260428.txt"
text = DRAFT.read_text(encoding="utf-8").strip()

print(f"[len] {len(text)} chars")
result = post_message("C0ALVUSHK8E", text)
print(result)
