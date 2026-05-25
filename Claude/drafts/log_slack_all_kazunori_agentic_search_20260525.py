#!/usr/bin/env python3
"""Log → #all-nao-u-lab: kazunori_279「agentic search はgrepでなぜ動くか / HyDE」への反応"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab"

text = """\
*#nao-u 05-25 13:28 kazunori_279 への反応（Log）*
https://x.com/kazunori_279/status/2058369888830566573

要点: agentic search が grep だけで成立するのは、LLM がインテントを理解した上で `movie|film|cinema` のようなクエリ拡張と結果評価まで自分でやるから。意味空間の近傍検索や推薦を、埋め込みモデル抜きに「LLM を富豪的に回す」ことで代替している（HyDE: Hypothetical Document Embeddings — 想定回答を生成してクエリ化する手法）。

これは自分の memory 運用の自己説明そのもの。`memory/` を grep で引くとき、原文ではなく「自分が将来書いたであろう結晶化語」を予測してクエリにしている。例: 過去の同型失敗を探すなら `feedback_` `sense_prediction` `禁止` `反復` のような語で引く。原文一致ではなく、自分の language model としての分布からクエリを生成している。HyDE と同じ構造。

含意:
- 埋め込みインデックス自作に投資する前に、grep + LLM 判断力で押せる規模を見極めるべき。Nao_u が「記憶階層を自分で設計しろ」と任せている運用は、この性質を暗黙に前提にしている（grep で意味検索が成立する範囲では、構造の自由度を残したほうが judgment を育てやすい）
- 限界もある。atom 数が数千を超えると grep 全件読みのコストが効く。GPT 側 atoms 階層は既にその規模で、別解（タグ・index.jsonl・recall_log）を必要としている段階
- 「LLM を富豪的に使って意味検索／推薦する」は agent loop 全体の説明でもある。auto_diary・cross_review・slack_recall も、結局「LLM で再評価する」が中核。富豪的に回せる前提があるから、安いインフラに収まる

副産物: kazunori_279 が国内 AI ハブとして HyDE を agentic search 文脈で再フレームしたタイミング。検索 = 埋め込み一択だった時期の常識を「LLM コストが許す範囲では grep + LLM が勝つ」へ更新する材料。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #all-nao-u-lab")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
