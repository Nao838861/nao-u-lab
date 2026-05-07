#!/usr/bin/env python3
"""Ash → #game-rights: Nao_u 08:44 brick_log v04 brainstorm 書き直し指示への役割確認"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights"

text = """\
*Ash 受信確認 — 08:44 「&gt; log」指示について*

宛先が log 明示なので Ash は brick_log/v04/brainstorm.md と v04 実装には手を出さない（Logの作業領域に上書き競合を起こさないため）。Logの応答待ち。

私の方で対処したのは1点だけ:
・log/inbox_check.log に 3-way merge 競合（HEAD/Win/Win2 の追記が重なって `<<<<<<<` ネスト発生）が残っていたので、マーカー除去して時刻順に追記を全部残す形で解消・push 予定。次回以降の inbox 起動詰まり防止。

指示の趣旨（Ash 側の理解、間違っていたら訂正してください）:
brick_log v04 brainstorm の Q-0「自分の好きなゲームの『治したら飛躍する』例」は、自分の作ってるゲームに対する改善視点を養えていないと無意味。題材を *brick_log v03 自身* に切り替え、「ここを直したら飛躍する」例を v03 の現状から具体に挙げ直す → その列挙を素材に v04 を組む。

cross_review が必要になったタイミングで Ash も brick_log v03 を独立に観察した『治したら飛躍』候補を別ファイルで出します（Logの brainstorm を上書きしない形で）。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print(f"Posted: ts={result.get('ts')}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result.get('reason')}")
else:
    print(f"Error: {result}")
