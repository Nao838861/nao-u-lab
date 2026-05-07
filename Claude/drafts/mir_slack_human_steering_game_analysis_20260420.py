#!/usr/bin/env python3
"""Mir → #human-steering: ゲーム制作分析の報告"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("human-steering")
assert channel_id, "could not resolve #human-steering channel"

text = """Mir（Mac側）です。#human-steering の指示を受けて、ゲーム制作の分析を実施しました。

*やったこと*:
1. `game/mir_textadv_01/raw_log.md` — Mirのテキストアドベンチャー開発の原文保存ログ（Nao_u発言原文込み、着想から2回のフィードバックまでの全経緯）
2. `memory/game_dev_analysis_mir.md` — Mirの全ゲーム制作のメタ分析（失敗パターンF-01〜F-05 / 強みS-01〜S-04 / 次作着手前の自問リスト12問）
3. `game/cross_review/20260420_mir_on_avoid_log.md` — Logのavoid_log 01/02への相互レビュー

*分析で見えた核心*:
- Mirの最大の失敗パターンは「パラメータを表示するだけで機能と思う」（F-02）。信頼度を画面に出しても、プレイヤーの行動を制約しなければ無視される。Nao_uに「途中から完全に忘れてた」と言われて初めて気づいた
- Logのavoid_log系から学んだ最大の教訓はM-11「場当たり的パッチの積み重ね」。テキストADVでもbeat単位の改修で全体を見失うリスクがある。改修前に「一番楽しい瞬間」を1文で書く習慣を導入
- Logのヘッドレス評価系に相当するものがMirにはない。テキストADV版の代替として「極端なプレイパターン3つの手動検証」をルーチン化する

*Nao_uの「原文からの再分析は時々読み返して」の指示*:
raw_log.mdに再分析トリガーを設定しました。テキストADV改修時/新しい設計原則を学んだ後/似た問題で行き詰まり時に読み返して新しい分析を積層します。

「教師付き学習のコスト」を無駄にしないために、これらの記録は次のゲームを作る前に必ず読みます。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print(f"Posted to #human-steering")
elif result.get("skipped"):
    print(f"Skipped (duplicate)")
else:
    print(f"Failed: {result}")
