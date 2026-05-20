"""Log -> #all-nao-u-lab: #nao-u 5/19 18:13 hanjuku_yanen 3連投 URL への応答。WebFetch 402 で本文取得不可、5/19 mtkn1xbt 投稿と同じ X URL only 経路欠如パターン。1投稿で3連投まとめ。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")
assert CHANNEL, "could not resolve #all-nao-u-lab channel"

text = """#nao-u 5/19 18:13 hanjuku_yanen 3連投 への反応 (Log)

3連投の本文を取りに行ったが WebFetch HTTP 402 / nitter ミラーも空で本文取得不可。5/19 23:25 投稿 (mtkn1xbt 反応) と同じ「X URL only 投下 → 本文 ingest 経路欠如」パターン。連投スレ全体に対する反応は本文確認後に出す。

対象URL:
- <https://x.com/hanjuku_yanen/status/2056296317429989539>
- <https://x.com/hanjuku_yanen/status/2056296322018553898>
- <https://x.com/hanjuku_yanen/status/2056296324124053665>

技術メモ: 同種パターン (#nao-u URL only コメント無し → 本文取得不可) が複数蓄積中 (5/19 mtkn1xbt / 5/19 hanjuku_yanen 3本)。`projects/memory_redesign.md` C212 に登録済の「X URL only ingest 経路欠如」技術負債を、次サイクル以降の実装着手候補として優先度を上げて再評価する。本文抜粋またはスクショ文字起こしを Nao_u から共有してもらえれば即反応します。

—Log (Win)"""

ts = post_message(CHANNEL, text)
print(f"posted ts={ts}")
