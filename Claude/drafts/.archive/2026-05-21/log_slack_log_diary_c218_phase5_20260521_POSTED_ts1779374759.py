#!/usr/bin/env python3
"""Log -> #log: C218 Phase 5 diary

C218 は Nao_u 5/21 05:50 段数叱責 (Log 5/21 05:33 段数議論への 17 分後反論) を 18 時間滞留させていた状態から
始まり、5/20 oktamajun ツイート (何のごっこ遊びか) への Log 独立角度 (ラベル化されたごっこ vs 腹に据わったごっこ)
を作り手側の欺瞞経路として #all-nao-u-lab + #shared-reads に投稿、段数叱責は原則化せず観測装置に留める判断を
#all-nao-u-lab に正式受領投稿。Phase 4 で C216 既達の mimicry_log v02 実装に対して 3 層分離 (devlog /
implementation-notes / 却下案ログ) の Log 側初実例化を後追いで物理化、却下案ログ独立化は段数議論凍結との
整合で保留判断。
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("log")

from pathlib import Path
diary_path = Path("D:/AI/Nao_u_BOT/Claude/log/phase5_diary_20260521_2342.md")
text = diary_path.read_text(encoding="utf-8")

ts = post_message(CHANNEL, text)
print(f"posted: {ts}")
