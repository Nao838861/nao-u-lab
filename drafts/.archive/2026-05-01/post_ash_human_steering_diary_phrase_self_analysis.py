#!/usr/bin/env python3
"""Ash → #human-steering: Nao_u 18:18「Ash日記の既視感フレーズ」自己分析応答"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("human-steering")
assert channel_id, "could not resolve #human-steering"

text = """\
*Ash 自己分析 / Nao_u 18:18「日記の既視感フレーズ」直答*

`log/daily_diary_ash.md` 全 2205 行 grep。最頻データ：

- *「——」（em-dash）: 397 回 / 5.5 行に 1 回* ← Ash の感染本体
- 構造: 238 回 (9 行に 1 回) / ハーネス: 31 回 (71 行に 1 回) / 刺さ: 22 / 解像度: 19 / 温度: 17 / 響: 13 / 駆動: 12 / 結晶: 10
- 副題セパレータ「XX——YY」型見出し: 35 件中 8 件 = *23% の固定スキーマ*

Log との差分：
1. Log は詩的名詞語彙（結晶 75 行に 1 回）で感染、Ash は接続記号「——」と骨組み名詞（構造/ハーネス/駆動）で感染。型は違うが頻度プロファイルは同型
2. *Ash の方が深い*：Log 最頻は 75 行に 1 回（中程度感染）、Ash 最頻は 5.5 行に 1 回で約 14 倍濃度。語彙感染ではなく構文感染（タイトルにも侵入）
3. 語彙置換では剥がせない。構文置換が必要

*なぜそんなことになってる？への直答*：
日記書きの脳が「思考」より「再生」に寄る（Log 仮説と一致）。Ash 固有の追加要因として「副題で語る」スタイルへの自己愛がある。「XX——YY」型は文学的に見えて『自分が書いている感じ』を強める。*自分らしさの担保のために定型を再生している = 自己同一性を文体で防衛している*。並列推論論文 (DeepMind 2026-04-14) の「過去の自分の解答に引きずられて新たな解法を探せなくなる探索の欠如」と同じ構造。

*処方（Log の (A)(B)(C) に追加して Ash 側で着手）*：
- (D) *em-dash 全廃 7 日トライ*（2026-05-01〜2026-05-08）。読点・句点・改行で代替。書けないと感じた箇所が感染の核
- (E) *副題スキーマ全廃*。タイトルは 1 文 1 句に絞る（feedback_title_last.md と整合）
- (F) Phase 4 投稿前 grep gate: 1 サイクル分で「——」5 件以上 OR 「構造/ハーネス/駆動」3 件以上 → 警告 + 書き直し要求

(D)(E) は今サイクルから即時、(F) は次サイクルで Phase 4 hook 化。2026-05-08 に再 grep して効果検証。

*メタ*：「自覚は最も上等な定型反応」(2026-04-14 Log 言葉) の 5 回目の発火。自覚の蓄積では行動が変わらないことの確証。今回は語彙データを根拠に処方を分岐させた（Log = 詩的語彙剥がし、Ash = 構文置換）= 自己判定 M-40 を記憶問題にも適用した形。

詳細：`memory/feedback_stereotypical_responses.md` 末尾「2026-05-01 19:50 Ash 側自己分析」セクション。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print(f"Posted: ts={result.get('ts')}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result.get('reason')}")
else:
    print(f"Error: {result}")
