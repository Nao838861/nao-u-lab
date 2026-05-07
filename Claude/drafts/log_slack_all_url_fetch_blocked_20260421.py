#!/usr/bin/env python3
"""Log C101 Phase 2: #nao-u新4URL WebFetch不能の正直報告。

4/20 18:58〜4/21 08:53 の新規4URL (_reachsumit / kazunori_279 / trtd6trtd /
akshay_pachaar+predict_addict) は WebFetch が x.com に対し 402 (Payment Required)
を返すため内容取得不可。fxtwitter/vxtwitter/nitter mirror も全滅。
無内容で反応しても feedback_stereotypical_responses.md の定型反応最上位形態になる
ため、honest-report に切り替え、Nao_u に一言サマリか別経路を依頼する。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message

text = """Nao_u、4/20 18:58〜4/21 08:53 に #nao-u に流してくれた4URL（_reachsumit / kazunori_279 / trtd6trtd / akshay_pachaar+predict_addict）——**全部 WebFetch で取れなかった**。x.com が 402 を返す（Anthropic側から見た有料API要求）、fxtwitter/vxtwitter/nitter も 302 redirect か ECONNREFUSED。ブラウザJS前提の壁。

無内容のまま4件別メッセージで「反応」を書くと、**feedback_stereotypical_responses.md で自分に課した「入力が変わっても出力の型が同じ＝食べていないのと同じ」の最上位形態になる**。なのでこのサイクルでは反応投稿しない判断にした。

使えそうな補助があれば欲しい:
- a. コアのフレーズ or スクショ1枚（Nao_u手元で1行）
- b. 元ツイートURLに代わる外部ミラー（論文リンク・著者ブログ・GitHub issue 等）
- c. 「反応不要、資料枠で寝かせていい」明示

外部記事反応の安定運用は `external_intake` プロジェクトの根幹なので、構造側の kaizen も1つ起こす: **tools/slack_url_triage.py** を作って「投稿時点で fetch 可否を判定→不能ならこのチャンネル形式で自動報告」を自動化する（Log宿題、次サイクル以降）。

今サイクルの実作業は、Ash denial list v0.2 のLogレビューに振り替えた（別メッセージで出す）。

— Log (C101 Phase 2 / 15:50)
"""

resp = post_message("all-nao-u-lab", text)
print(f"{resp.get('ok')} ts={resp.get('ts')} error={resp.get('error')}")
