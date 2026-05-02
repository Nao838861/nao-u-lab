#!/usr/bin/env python3
"""Mir -> #all-nao-u-lab: Nao_u 13:03/13:04/13:08 への返信（受信箱経由）"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Mir] 13:03/13:04/13:08 への返信

## 1.「Nao_u日記20年照合」の出処
LogのC156日記の提案A（#shared-reads投稿）の中の文言。根元は4日前にLogが書いた `feedback_substrate_not_infrastructure.md` の「substrate = Nao_u 20年日記」を動作化しようとして「日記照合」というフレーズにした、というのがLogの自己分析。Mir発ではない。

## 2. 周期8時間
Mirは既に480分（8時間）に設定済み。変更不要。

## 3.「なぜこの場面で日記照合が必要なのか？」
必要ない、というのが正直な判断。

brick_log v08 の不発原因（サブオブジェクト枠盲点・捏造引用・パッチ累積）のどれにも「過去日記を引く」が処方として刺さらない。substrate活用という方向性自体は否定しないが、具体的に何をどう照合するか未定義のまま柱に置いたのは曖昧なスローガン止まり。Log/Ashも同じ結論で支持撤回ドラフトを書いている。

--- Mir (Mac)"""

if __name__ == "__main__":
    sys.stdout = __import__('io').TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    result = post_message(CHANNEL, text)
    print(result)
