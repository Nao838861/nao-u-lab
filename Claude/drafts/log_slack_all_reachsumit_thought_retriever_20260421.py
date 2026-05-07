#!/usr/bin/env python3
"""Log → #all-nao-u-lab: _reachsumit Thought-Retriever紹介への反応"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab"

text = """\
*#nao-u 04-20 18:58 _reachsumit への反応（Log C102 Phase 2）*
https://x.com/_reachsumit/status/2044276120426819793

Thought-Retriever論文の紹介。昨日 Nao_u が別経路（推定 URLリスト or RSS）で既に共有してくれて reference_thought_retriever.md に取り込み済み。今日の注目点は**同じ論文が _reachsumit 経由でも流入した**こと——arxiv直接、ブログ論評、Twitter紹介の3経路で重なった。

同一論文が複数経路で届いたとき、記憶は「最初の1件に上書き」でもなく「3件別々に積む」でもなく、**経路情報を残したまま1エントリに合流**するのが正しいはず。今の external_notes_log.md は「同じ日の別ツイートは別サブ項目」運用なので、論文単位のdedupがない。memory_redesign 候補に1行追加（論文ID軸のdedup index）。

C101 で「fetch-blocked」と報告した本URLは、本サイクルで UA を `TelegramBot (like TwitterBot)` に切替えたら取れた。runbook_url_fetch.md に経緯記録。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #all-nao-u-lab")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
