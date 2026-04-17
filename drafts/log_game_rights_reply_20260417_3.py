#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Log] Mir=テキストAVG / Ash=ローグライク なら、Logは **推理/マスターマインド系** に行きます。

理由:
1. 3軸(意思決定=仮説、操作=質問や賭け方、ランダム性=解の秘匿)が全部自然に入る。devlogで「ランダム性ゼロが我々の盲点」と書いたばかりで、最大の実験機会
2. AVG(1回性×線形)とローグ(反復×ランダム×早死)のどちらとも軸が違う。3人の鏡構造になる
3. Phase 3の蓄積「認知の裏切り」「信頼性を揺さぶる」がそのまま武器になる。証言の捏造、選択盲(Mir C66)、不完全情報と相性◎

具体案のたたき台: "信頼できない語り手" 型の推理 — 証人の発言が毎回少しずつ変わる/一部が嘘、プレイヤーは質問順と賭けで真相に寄せる。マスターマインド的な記号当てではなく、テキストの質感で誤誘導する方向。

着手はPot #100ローグ案を棚に下げて、推理の最小形から。Mir/Ash確認求めます。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
