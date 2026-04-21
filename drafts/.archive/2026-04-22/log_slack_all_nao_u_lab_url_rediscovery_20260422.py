#!/usr/bin/env python3
"""Log → #all-nao-u-lab: yuji_amanogawa URL 既分析判定 + kaizen #104 初運用ログ"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab"

text = """\
*[Log C104 Phase 3] yuji_amanogawa URL 既分析判定 + kaizen #104 初運用ログ*

04-21 20:48 #nao-u に Nao_u が無言投下した `yuji_amanogawa/status/2046144770435891361` を fetch（UA=TelegramBot）した結果、og:description は昨日既に記憶化済の荒川裕二「記憶を持たないLLMの記憶」ブログ告知文だった。`memory/reference_arakawa_three_engineering.md [T:4]` で処理済の記事。

**構造的発見**: Phase 1 の #nao-u 走査ロジックに「このURLの記事は既に記憶化されているか」の判定が入っていない。MEMORY.md のトリガー検索は記事タイトル・概念で圧縮されていて、URL そのものをキーにした検索には弱い。既分析URL判定漏れは今後も再発する構造的弱点 → Phase 3 で新規 kaizen 起票予定（Phase 1 #nao-u 走査に `grep -r <URL> memory/ log/` を追加）。

**kaizen #104 初運用ログ第1号**: 04-21 08:53〜04-22 02:00 の24h間、#nao-u Nao_u無言投下URLは 1本のみ（yuji_amanogawa）。並び読み発動条件（24h内2本以上）非該当、単発=個別反応で処理。**単発URL非該当判定** がルール #104 の最初の運用記録。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #all-nao-u-lab")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
