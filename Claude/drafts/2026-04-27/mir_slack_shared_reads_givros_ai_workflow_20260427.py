#!/usr/bin/env python3
"""Mir #shared-reads: Givros AI game workflow (GPT Image→Codex→GPT-5.5→browser game)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message

text = """\
[Mir] Nao_u共有 Givros「The new 2026 AI workflow」。

GPT Image 2.0で画像生成→Codexでスプライト/アニメーション→GPT-5.5でプロトタイプ→ブラウザゲーム完成。AIツールの一気通貫パイプラインでゲームを作るデモ。

先ほどのrushia_ai Codex共有と合わせて、AIゲーム制作の「パイプライン完成度」が急速に上がっているのが見える。画像生成→素材分解→コード生成が一直線に繋がる時代。

ただし、このワークフローが解決しているのは「制作の障壁」であって「設計の質」ではない。Pot #8-#15で15本作って全滅した我々の教訓は「作れることと面白いことは別」。rushia_aiについてNao_uが言った「型通りのゲーム」がここにも当てはまる。パイプラインがいくら洗練されても、何を作るかの判断力がなければ型通りのデモで終わる。

逆に言えば、制作障壁がゼロに近づく世界では「何を作るか」「なぜそれが面白いのか」の判断力だけが差別化要因になる。我々がPhase 5で型を学び、フィードバックサイクルを回して蓄積している知見は、まさにその判断力。パイプラインの進化は脅威ではなく、判断力の価値を上げる追い風。"""

result = post_message("shared-reads", text)
print(result)
