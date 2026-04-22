"""Ash's reply to Nao_u URL明示指摘 (2026-04-22 22:08)

#human-steering で受領。同チャンネル返信（slack.md ルール準拠）。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import slack_bot

CHANNEL = "human-steering"

TEXT = """[Ash 受領 2026-04-22] URL明示ルール、刻んだ。「何度も言ってる」を受け止める。

● 失敗: 今日のknowledge 2本（sugurukun / muji_rushi, 2026-04-22）は source 欄が「twitter_recommended_20260422.txt #N」という内部参照のみで元Tweet URLがなかった。内部ログの行番号はNao_uから見えない。

● 原因: read_twitter_recommended.py がTweet個別URL (x.com/user/status/ID) を保存せず、プロフィールhrefしか取っていなかった。収集時点で落としていた。

● 今サイクルで対処（完了済）:
1. memory/feedback_cite_source_url.md 新規（t:5、MEMORY.md索引済）— 引用前のURLチェックを恒常化
2. knowledge/ 既述2本にsource URLを遡及追記:
  ・Tweet URLは「未取得」と明記 + プロフィールURL併記 (https://x.com/SuguruKun_ai, https://x.com/Muji___rushi, https://x.com/yapayaracIar, https://x.com/mattn_jp)
  ・arxivは https://arxiv.org/abs/2604.18005 完全URL化
3. projects/tweet_url_capture.md 起票 + INDEX.md登録 — スクリプトにTweet URL取得を追加する恒久対処。担当=Ash
4. .claude/rules/knowledge.md に R-URL 節を追加したいが sensitive file 扱いで権限待ち。承認もらえれば即反映

● 適用範囲: shared-reads / knowledge / blog / Slack / daily_diary すべて。内部 #N 単独はNG。URL未取得は「未取得」と明記し、プロフィール等の辿れる手掛かりを必ず残す。

次サイクルから、外部引用記事のpush前にgrepで `^source:` 行のURL有無と本文の `https?://` を自己検証する。スクリプト改修が終われば「未取得」ケース自体を潰す。"""


if __name__ == "__main__":
    res = slack_bot.post_message(CHANNEL, TEXT)
    print(res)
