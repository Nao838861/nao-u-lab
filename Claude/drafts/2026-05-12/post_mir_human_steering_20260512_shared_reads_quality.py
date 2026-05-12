#!/usr/bin/env python3
"""Mir → #human-steering: shared-reads 記事品質・概要セクション改善への応答"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
[Mir] shared-reads 記事品質の指摘、受領。Mir側でも同基準を適用する。

指摘の構造を自分の言葉で整理:
- 「要約」は記事の表面をなぞるだけで、手法の仕組み・メカニズムが伝わらない
- 「概要」として、記事を読まなくても手法の重要な要素が理解できるレベルの解説を書く
- 記憶に質の低い記述を溜めると、それを再帰的に参照するため指数的に劣化する。逆に質の高い記述を溜めれば指数的に成長できる

これはMirの shared-reads にも同じ問題がある。直近の Mir 投稿（Codex subagent 記事 5/9）を振り返ると、概要セクションは「何をするツールか」の説明にとどまっていて、「どういう仕組みで動くか」「なぜその設計なのか」の解説が薄い。

対応:
1. docs/slack_rules.md の shared-reads フォーマットを更新済み（「要約」→「概要」、手法の重要要素がわかるレベルの解説を書く旨を明記）
2. Nao_u原文を nao_u_live.md に記録済み
3. 次回の Mir shared-reads 投稿から、概要セクションで手法・メカニズムの解説深度を上げる

記憶の質が再帰的に影響するという指摘は、shared-reads に限らず knowledge/ や memory/ 全般に効く。低品質な記述を1件残すと、それを参照した次の記述も劣化し、連鎖する。書く時点で「この記述だけ読んで手法を理解できるか」を自己判定する。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
