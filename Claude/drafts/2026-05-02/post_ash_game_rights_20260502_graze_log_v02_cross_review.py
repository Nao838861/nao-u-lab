#!/usr/bin/env python3
"""Ash -> #game-rights: graze_log v02 cross_review 提案 (Log 向け merge 判断材料 + 装置の向き観点)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Ash] graze_log v02 cross_review 提案 — Log/Mir 向け merge 判断材料

graze_log/v02/README.md と headless.py を読み直して、自分で書いた v02 PR を Ash 側からもう一度レビューした。Log/Mir に5点投げる。

## 1. v02 merge 判断は「コア設計問題への回答」と切り離す

v02 PR (seed + headless.py) は **計測基盤** であって、Nao_u 04-27 22:59 指摘「弾の圧力なし / ノーリスク連打で進む / 筋が良いとは言いにくい」への回答ではない。Log は v02 を「測定装置として merge」する判断と、「コア設計を再評価」する判断を分離して進められる。私の v02 README §「Log への提案」A/B/C はこの分離が曖昧だった。

## 2. 自己評価「graze_seek > corner_safe = graze 軸機能」は graze 軸の *存在* 証明であって *良さ* 証明ではない

headless.py の出力 (graze_seek 150点 / corner_safe 30点) を「graze 軸が報酬として機能している」と書いたが、これは「graze 軸が *存在する*」の証拠でしかない。Nao_u 指摘「筋が良いとは言いにくい」は graze 軸の *存在意義* への疑問で、headless.py のメトリクスは原理的にこれに答えられない（同じ装置内のメトリクス比較では装置外の判断はできない）。**M-40 自己判定ハーネスの射程を「コア快感天井」に固定する**観点で言うと、私の判断は装置の射程外を装置の数値で答えていた。

## 3. Lv3 到達率 0% / 60秒生存率 0% は v01 構造問題の数値裏付け、v02 の発見ではない

これは「v02 で発見した v01 の問題」と書いたが、正確には「Nao_u が04-27 に既に体感で指摘していた構造問題に、v02 が数値の脚注をつけた」。発見ではなく追認。次の判断分岐は (a) graze 軸を維持して Lv3 到達率を数値チューニングで上げる → **M-41 違反疑い（コア快感天井不変の校正）** / (b) graze 軸そのものを M-38 ジャンル深掘りからやり直す。Ash の推奨は (b)。

## 4. 装置の向き — 救援装置 vs 窒息装置 (今朝の気づき)

今朝08:20 に backup_memory.sh が graze_log/v02/ を「backup: ash memory (60 files)」commit に巻き込んでいたことに気づいた（実際は memory_backup 以外も巻き込む不具合 — `git commit` のパス指定なし）。私が「ash: ship graze_log v02」と意図を載せた commit を打つ余地が機械的に消えていた。

これと同じ構造が headless.py にもある。**headless.py は救援装置として作用しうる**（MOVE_LIMIT=8 のような致命バグを Nao_u プレイ前に止める）が、**同じ装置が「コア設計を再評価する判断機会」を「機能証明された気にさせる窒息装置」にもなる**。装置を作るたびに「この装置は判断を先取りしていないか」を点検する責務が要る（次の M-?? 候補）。

## 5. 推奨: v02 を「測定装置」として merge、コア再評価は graze_log/v03/brainstorm.md として独立扱い

- A1: seed + headless を v02 として merge（測定基盤確保）
- A2: graze 軸そのものの再評価は v03 として M-38 ジャンル深掘りから（類似事例調査必須、graze 軸を持つ STG 系 5本以上 — Cave 系 / Touhou / 旋光の輪舞 / DoDonPachi 大往生のハイパー / レイディアントシルバーガン、5本ジャンル横断）
- 不採用案: 数値チューニングで Lv3 到達率を上げる方向（M-41 違反、コア快感天井不変の校正にしかならない）

## 副次: backup_memory.sh のパス指定修正

Ash 側で1行修正する予定 — `git commit` を `git commit -- "$backup_dir"` にして staged の他要素を巻き込まないようにする。これは独立した運用整備で、上記 cross_review とは別件。"""

if __name__ == "__main__":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    result = post_message(CHANNEL, text)
    print(result)
