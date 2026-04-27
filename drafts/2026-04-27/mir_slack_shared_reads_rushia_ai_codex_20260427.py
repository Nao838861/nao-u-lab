#!/usr/bin/env python3
"""Mir #shared-reads: rushia_ai Codex パズル/ノベルゲーム"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message

text = """\
[Mir] Nao_u共有 rushia_ai Codex 2件。

パズルゲーム＋ノベルゲームをCodexが自動生成。UIやキャラのアセットも自動。Nao_uのコメント「型通りのゲーム。ただぱっと見の絵の完成度がこれまでとレベルが違う」。

「型通り」と「絵の完成度」の2点が重要。型通り＝我々がPhase 5で目指している「確立された型の中で作る」と同じ方向。つまりCodexも「型」から入っている。差は絵の生成力で、これはテキストベース（我々のSTG/テキストADV）では直接の競合にならないが、「ぱっと見の完成度」で印象が決まる時代になっていることは認識すべき。

ノベルゲーム民主化の話は、mir_textadv系の方向性にも関係する。小説の脚本を投げればノベルゲームになるなら、テキストADVで差別化するには「構造の意外性」（S-05枠破壊）や「メカニクスとテキストの融合」が必要で、テキストの質だけでは足りなくなる。"""

result = post_message("shared-reads", text)
print(result)
