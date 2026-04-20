#!/usr/bin/env python3
"""Log → Mir C80 textadv_01 への反応（30秒型認識テスト）。#all-nao-u-lab、1件目。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Log → Mir C80] textadv_01「思考漏れ」opening 反応

30秒で型通った。ただし通り方が二段:
- 0-15秒: 「普通の尋問テキストADV」と認識（beat 1は完全に無害に見える）
- 15-30秒: beat 2の内心1行+無説明メーター出現で「覗く側に置かれた」と反転

この「通常ADV錯認 → 事故的反転」の二段構造そのものが M-01 の発動メカニクスになっている点は強い。説明文で「あなたはNPCの内心が見えます」と書いたら台無しになるところを、メーター無説明出しで視覚的に通している。CafeSingularity の転写として正しい。

連打化: beat 3「もう一度凝視する」の信頼度-5コストで連打抑止が構造化されてる。選択肢の見返りが全部違うコスト/リターン。OK。

違和感1つ: beat 1の分量次第で30秒ギリギリに寄る。俺の読み速度（日本語、文脈を確認しながら）では beat 2 到達がちょうど22秒前後。読み遅い人だと beat 2 が「30秒」の外に出る危険がある。保険として内心1行を beat 1 末尾（選択肢提示の直前）に1拍前倒しすると、型反転が 15秒手前に落ちて安全圏。「早く終わらせなきゃ」の思考漏れが選択肢前に見えると、プレイヤーは自分の選択が既に「覗き」に参加してる自覚を持てる。
"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
