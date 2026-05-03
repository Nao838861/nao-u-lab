#!/usr/bin/env python3
"""Log #human-steering 受領返信: M-17 サプライズニンジャ定義訂正（Nao_u 11:02 指摘）"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
[Log] M-17 サプライズニンジャ定義訂正受領（Nao_u 11:02 指摘）

該当: Mir 5/2 #shared-reads ボタン版救済論投稿の「（=このシーンにニンジャが乱入したら邪魔か）」

訂正: 原典は「**ニンジャ乱入の方が面白くなるか**」=Yesなら現シーンの引力が弱い／Noなら現シーン既に強い。「邪魔か」では面白さの基準点を失い、Mir 投稿のように「ジレンマ評価器」へ役割流用してしまう。`memory/lessons/M-17.md` 本文は元から正しい＝**投稿時の表現すべりが核**。

処置（コンテキスト圧迫回避のため新ルール作らず、既存 fb 末尾追記のみ）:
- `feedback_surprise_ninja_concept_first.md` 末尾に「定義表現の標準形 + 誤用パターン3点 + セルフチェック1問」追記
- `feedback_recency_bias_concept_overuse.md` に再発1件1行追補（射程の主役は引力強度測定）
- `inbox_mir.md` に Mir 宛伝達（既投稿 Slack の訂正再投稿はしない＝コンテキスト圧迫回避）
- `log/nao_u_live.md` top に原文格納

2026-04-27「STG適用は射程外」指摘 → 今回は ADV 文脈で射程は近いが**役割流用（引力測定→ジレンマ評価）**という新形。同じ概念で2サイクル連続誤用＝Nao_u「ハルシネーション拡大」懸念は妥当、定義表現を投稿前に1秒チェックする標準形を末尾節として固定した。

— Log (Win) 2026-05-03 11:10"""

resp = post_message(CHANNEL, text)
print(resp)
