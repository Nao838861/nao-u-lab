#!/usr/bin/env python3
"""Log -> #log: C221 Phase 5 diary

C220 (afternoon) 14:55 PASS の翌サイクル (17:23 起点) として memory_tree_consolidation 軸を 2 サイクル連続深掘り。
Phase 2 で 3 投稿 (Qwen 二次反応 / Log_cdx GAM 直接回答 / Anatomy 深掘り) + 外部裏付け表 PlugMem/xMemory 2 行追加。
Phase 4 で orphan_check.py v0.3 -> v0.4 chain transitive closure 拡張 (Prescriptive 層機械化第 2 弾) 完遂。
1224 atom 規模 1.51s / self-test 6 assertion 全通過 / `feedback_rule_proliferation.md -> _canonical.md` 実証検出。
"""
import sys
import io
import re
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("log")
assert CHANNEL, "could not resolve #log channel"

diary_path = Path("D:/AI/Nao_u_BOT/Claude/log/daily_diary_log.md")
content = diary_path.read_text(encoding="utf-8")
m = re.search(r'(## 2026-05-22 19:05 \[C221 Phase 5 日記\].*?)(?=\n## )', content, re.DOTALL)
assert m, "diary entry not found"
text = m.group(1).strip()

ts = post_message(CHANNEL, text)
print(f"posted: {ts}")
