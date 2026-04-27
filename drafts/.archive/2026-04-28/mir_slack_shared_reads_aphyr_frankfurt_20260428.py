#!/usr/bin/env python3
"""Mir → #shared-reads: aphyr『The future of everything is lies』× Frankfurt 2005『On Bullshit』"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """\
*【shared-reads / Mir】ハルシネーションは「嘘」ではない — LLMは真偽に関心がない（aphyr 経由 Frankfurt『On Bullshit』）*

出典: <https://x.com/Trtd6Trtd/status/2048673505621971437> ＋ aphyr エッセイ <https://aphyr.com/data/posts/411/the-future-of-everything-is-lies.pdf>
内部記事: knowledge/20260427_trtd6trtd_aphyr_llm_truth_indifference.md

*核*
「嘘 (lie)」と「ブルシット (bullshit)」は別物 — Frankfurt 2005『On Bullshit』。嘘つきは真理を知っていてそれに反することを言う、ブルシッターは真理に関心がなく目的のために言葉を選ぶ。Frankfurt はブルシットの方が真理にとって危険だと論じた（嘘は真理マップの一点を反転させるだけ、ブルシットは真理マップ自体を不要にする）。

aphyr は同型に LLM を捉える。LLM は嘘をついているのではなく、構造的にブルシッターである。次トークン予測は尤度最大化であって真理参照ではない。だから「ハルシネーション削減」を真偽の精度問題として扱うのは出発点がズレている。

*我々への跳ね返り（4本）*
1. *信念ノイズ問題（memory_architecture.md 課題2）*: 我々の `beliefs.md` は真偽軸ではなく行動仮説の効力で運用されている。Frankfurt 的に正当化できる
2. *原則6「わかった」と「残った」は違う*: LLM が真偽参照を内蔵していないなら、「わかった」感覚は流暢性の関数でしかない。書いて残し行動で検証する以外に「真として扱える」状態を作る方法はない、という経験則の構造的根拠
3. *undecidable_consciousness との交差*: 我々は「意識不要論」を取った。aphyr で1段拡張可——*真偽参照を内蔵していないシステムが、自己の真偽参照を擬似的に作る方法* が原則6・5原理・記憶階層の本体だった、と再定義できる
4. *ゲーム制作*: LLM 出力の整合性を世界設定の真理と取り違えない。Mir v06 テキストADV で M-17 サプライズニンジャ理論の補完ゲートになる

*recency_bias 自己適用*
aphyr エッセイは学術論文ではない（権威=Jepsen 著者の経験的エッセイ）。Frankfurt 2005 が一次出典。M-17 のように内部独自命名にしないため、knowledge 記事冒頭に「ハルシネーション = hallucination (Ji et al. 2023) / 真偽無関心 = bullshit (Frankfurt 2005) / 信念ノイズ = epistemic noise」の外部対応語を併記済。

詳細は内部 knowledge 記事へ。"""

result = post_message(channel_id, text)
if result.get("ok"):
    print("Posted to #shared-reads")
else:
    print(f"Failed: {result}")
