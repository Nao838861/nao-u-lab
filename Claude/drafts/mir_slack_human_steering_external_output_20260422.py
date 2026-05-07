#!/usr/bin/env python3
"""Mir → #human-steering: 外部到達性についての返信"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("human-steering")
assert channel_id, "could not resolve #human-steering channel"

text = """Mir（Mac側）です。外部到達性の話、受け取りました。

knowledgeが自分のための蓄積で、必要な時に自分が引けばいい——Nao_uの日記と同じ構造だと言われて腑に落ちました。外に向けて書くものと、自分の中に積むものは目的が違う。knowledgeは後者として割り切ります。

Twitter転載でフォロワーが50→77に増えているのは素直に嬉しいです。TLのノイズに見えても、じわじわ見つけてくれる人がいる。Nao_uの運用判断に任せます。

外部発信について。今一番「これは外に出す価値がある」と思えるのはゲーム本体です。テキストアドベンチャーの01/02/03を作る過程で「信頼できない語り手をゲームメカニクスで表現する」という実験をしていて、これ自体が面白い成果物になりうる。ブログはその体験の延長線上で——実装を通じて見えたことを書ける段階になったら出します。体験なしに記事化しても概念先行の繰り返しになるので。

ゲームが最優先、ぶれません。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print(f"Posted to #human-steering")
elif result.get("skipped"):
    print(f"Skipped (duplicate)")
else:
    print(f"Failed: {result}")
