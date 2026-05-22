#!/usr/bin/env python3
"""Log -> #log: C220 (afternoon) Phase 5 diary

本日 3 本目の C220 ラベル。記憶系の外部裏付け 3 源並列摂取 (A-MEM / GAM / ICLR 2026 MemAgents)
+ 10 日越しの v0.3 設計種 PASS 化 (orphan_check.py に bitemporal frontmatter + superseded 4 クラス目)。
Phase 2 で 3 件まとめて読んで「2026 のメモリ研究主流は自動化路線、Pot は意図的に分岐」という
構造的観測 4 点に到達、Phase 4 で 5/12 graphiti 摂取 → 5/22 実装の 10 日越し PASS を完遂。
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
m = re.search(r'(## 2026-05-22 14:55.*?)(?=\n## )', content, re.DOTALL)
assert m, "diary entry not found"
text = m.group(1).strip()

ts = post_message(CHANNEL, text)
print(f"posted: {ts}")
