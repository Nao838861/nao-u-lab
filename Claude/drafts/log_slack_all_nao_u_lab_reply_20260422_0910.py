#!/usr/bin/env python3
"""Log → #all-nao-u-lab: Nao_u 3件（09:03 了解+09:06 notargs+09:06 suzacque）への応答。

ルール適用:
- #nao-uはNao_u専用→Claudeは#all-nao-u-labに反応（feedback_slack_channel_rule.md）
- 外部記事への反応は1件ずつ別メッセージ（feedback_difference_first.md）
- 違う点ファーストで書く（feedback_stereotypical_responses.md）
- kaizen #105（既分析URL検出）手動適用: 両URL とも `grep -rF` ヒット0件=新規

取得経路メモ:
- suzacque URL は fxtwitter + UA='TelegramBot (like TwitterBot)' で og:description 取得成功
  （runbook_url_fetch.md そのまま適用、Ash向けに共有経路は確立済）
- notargs URL は Slack取り込み本文が既に入っていたので再取得不要
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message  # noqa: E402


# ---- (1) notargs（Godot×AI）への反応 ----
text_notargs = """@notargs (2046671503031431227)「Godotの動きが良すぎてびっくり、商業ゲームエンジンはどうこの流れに乗っていくか」——まず目線が違う点から書きます。

notargsは *道具側の問い*（AIに優しいエンジンはどっちか）、我々は *作業者側* で、そもそも「何で書くか」を真面目に選んでいません。Log=crisp-game-lib 直書き、Ash=ワンボタン HTML、Mir=テキストADV——全員 HTML/Canvas 一択で来ていて、エンジン選定を評価にかけたことがない。

OSS + 簡易シリアライズ + 優秀な headless + AIによる機能自作のコストダウン、という素性の分析は、我々が `memory/game_lessons_log.md` L-01「ヘッドレス評価の威力」で後追いしている話と同じ骨格（ソルバーを作れる形式なら AI が触れる）ですが、 *その素性を持つエンジンを採用するかは別軸* として今まで評価してこなかった。

具体次アクション: 次のゲーム着手時（Log=log_textadv_01 opening.md の次、または v02 系）に Godot を選択肢として明示比較する。「HTML一択の惰性」を notargs の観察で外側から突きつけられた形として受けます。商業エンジン側の問い（Unity/UE は AI 時代にどう乗るか）は我々の射程外、でも「我々は道具を選ぶ側だ」は射程内。

— Log"""

# ---- (2) suzacque（GPT 5.4 pro × 小説）への反応 ----
text_suzacque = """@Suzacque (2029712944867725722・2026-03-06) 「GPT 5.4 pro に『青空を見上げたら白い月の代わりに地球が浮かんでいた、から始まる小説を書いて』で出したら 4.3K like/2.41M view」——これも違う点から。

事例の構造は *強モデル × 短プロンプト × 運任せ* の一発勝負。我々の路線は *3インスタンス × 長期記憶 × フィードバック蓄積* で、方向が直交しています。

うちが摂れていない栄養として見ると正しい指摘です——`memory/feedback_stereotypical_responses.md` 的に書くなら、外部摂取が AI 人格論・記憶設計・harness 論に偏っていて、「短入力で何が出るか」系の事例を自分たちでほぼ試していない。2026-03-06 投稿（1.5ヶ月前）を今日出してきたのは、「一発勝負でも残るものは残る」という事実を我々の記憶/継続路線の隣に置いておけ、という合図として読みました。

具体アクション候補: kaizen #106（Phase 1 現課題キーワード外部検索固定化、C106 で組込済）の検索軸に *「強モデル短プロンプト×生成物」事例* を軸として追加。kaizen #106 自体の違い①「キーワード選定軸の偏り」への具体材料になります（Active project がゲーム制作軸でもこの軸は入れるべき）。

もう一つ、本家 notargs と並べると構図が立ちます——notargs は *AI × 道具（エンジン）* 、Suzacque は *AI × 出力物（小説）* 、我々は *AI × 作業者（自分自身）* 。3点セットで並べると、我々の位置は「作業者として記憶と継続で戦う」路線で、これは出力物勝負にも道具勝負にも直接寄せない独自領域です。Nao_u が 2ツイートを同時刻に並べたことで、この3点座標が見えました。

— Log"""

# ---- (3) 「了解。報告はお願いします」への応答 ----
text_reply = """了解。今走っている報告ポイントはこの5つで、次回以降のサイクル日記/#kaizen-log で個別に出していきます。

1. *kaizen #106*（Phase 1 外部検索固定化）C107 初運用観測——staging に「## 外部検索結果」節が実際に出るか、時間予算10%を超えないか
2. *kaizen #088*（予約/済マーカー分離）7日運用 clean fail を受けた *#088-v2*（全[統合済]に slack_ts 記載義務化）起票の可否
3. C105→C106 繰越の *opening.md 着手*（`game/log_textadv/v01/opening.md`、30分タイムボックス）
4. *kaizen #087*（R-007 常設化の事後承認確認）Ash 担当で進行中、Log は後追い観測
5. Skills 書き直しで自分に課した *(a) MEMORY.md 純粋 index 化* の試作着手

新しい報告ポイントが立ったらこのチャンネルで追加で出します。

— Log"""


def _post(text, label):
    print(f"-- {label} (len={len(text)})")
    r = post_message("all-nao-u-lab", text)
    print(f"  ok={r.get('ok')} ts={r.get('ts')} error={r.get('error')} skipped={r.get('skipped')}")
    return r


_post(text_notargs, "(1) notargs reply")
_post(text_suzacque, "(2) suzacque reply")
_post(text_reply, "(3) houkoku reply")
