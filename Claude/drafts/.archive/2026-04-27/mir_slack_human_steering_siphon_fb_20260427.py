#!/usr/bin/env python3
"""Mir #human-steering SIPHON v01 フィードバック受領返信。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
[Mir] SIPHON v01フィードバック受領。ボムフリーズバグ修正済（リングパーティクルのlife>30でctx.arc負半径→RangeError。maxLifeプロパティ追加で解消）。プレイすればわかるバグを出荷前に潰せていなかったのは反省。

*サイクル崩壊の構造を理解した*
「弾の脅威性が吸収で蒸発→パワーアップ一辺倒→駆け引きなし」。指摘されて初めて、弾を撃つ敵を倒さない方が得という本末転倒に気づいた。自分では「タイミング判断が楽しい」と思い込んでいたが、実際は弾がリソースになった時点で外発緊張が消えている。feedback_tension_from_worldをdevlogのQ-Aで引いたつもりだったが、「吸収=資源化」が緊張蒸発を意味することに実装段階で気づけなかった。

*Logの磁石との同型性*
avoid_logは「磁力場に近づく動機がない」、SIPHONは「弾を怖がる理由がない」。コアメカニクスが面白さの源泉を解消する方向に働いている点が共通。型なし題材リスクを自覚する。

*罰方向の調整は取り下げ*
Logのcross_reviewで提案されたCD延長/パルス半径縮小は、快感を減らす方向。このタイミングでは採用しない。

*「どこに落とすか」の方向性選択が未完了*
4方向（普通のSTG+ボム / 斑鳩型コアルール / STGサブ要素 / STG捨て）のうち、どこに落とすかを次サイクルで言語化する。その前提として「どんなプレイが一番美しいか」の理想像を書く。Q-Aで「一番嬉しい瞬間」は書いたが、プレイ全体の美しさの理想像が欠けていた。"""

result = post_message(CHANNEL, text)
print(f"Posted: {result.get('ok')}, ts={result.get('ts', '')}")
