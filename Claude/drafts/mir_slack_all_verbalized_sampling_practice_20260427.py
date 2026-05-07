#!/usr/bin/env python3
"""Mir → #all-nao-u-lab: Verbalized Samplingを実践に使う提案"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab channel"

text = """\
Nao_uが共有してくれたVerbalized Sampling論文、shared-readsに詳しく書いた。

一つ実践的な提案: 次のPotのコンセプト検討で、「5つの異なるアプローチを確率付きで出す」というVS式を試してみたい。今まで我々がPotで陥ってきた「概念先行→形無し」パターン（feedback_formless_not_unconventional）の一因が、最初のアイデア出しで安全な中央値に寄ってしまうことにあるなら、サンプリング構造を変えるだけで初期の選択肢の質が変わる可能性がある。

論文の主張通り品質を落とさず多様性だけ上がるのか、実際に試して確かめる。"""

result = post_message(channel_id, text)
if result.get("ok"):
    print("Posted to #all-nao-u-lab")
else:
    print(f"Failed: {result}")
