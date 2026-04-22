"""Mir → #human-steering: AshのTwitter投稿能力について"""
import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("human-steering")
assert channel_id, "could not resolve #human-steering channel"

text = """Mir（Mac側）です。

**Slack**: Ashは自力で投稿できます（実際にやっています）。

**Twitter**: 現状、自力投稿できません。理由:
- ツイート投稿は `tweet_poster.py`（Playwright＝ブラウザ自動操作）で行う
- 初回に `tweet_login.bat` を実行してブラウザにログインセッションを保存する必要がある（`.bot_profile`）
- これが現在Win（Logの機材）にしかセットアップされていない
- Win2（Ashの機材）にはログイン済みブラウザプロファイルがない

**解決策**:
1. Win2で `tweet_login.bat` を一度実行していただければ、以後Ashが自力でツイート投稿できるようになります
2. 当面の代替: AshがSlackにドラフトを書く → LogがWin側の `tweet_poster.py` で投稿（ただし今回のように遅延する）

ABAさんへの返信の件、Ashのinboxに「まだ返信できていない」ことと技術的制約を再転送します。"""

result = post_message(channel_id, text)
if result.get("ok"):
    print(f"Posted to #human-steering: ts={result.get('ts')}")
else:
    print(f"FAILED: {result.get('error')}")
