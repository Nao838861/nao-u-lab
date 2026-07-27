---
title: "Orchestrated Reality: From Role-Play to Living, Playable Game Worlds -- LLM-Driven World Simulation as a Parameterized-Action POMDP"
url: "https://arxiv.org/abs/2606.16014"
collected_at: "2026-06-20T08:44:40+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, world-simulation, llm-agents, npc, narrative, sandbox]
evaluated_at: "2026-07-27T16:36:13+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T16:36:13+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T16:36:13+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  prose と structured mutation を分け、検証済み transition kernel だけを durable state に反映する中核は具体的で、
  NPC 記憶やクエスト進行への適用も明確。しかし work in progress で player study は未実施、model 横断検証もない。
  評価の中身を伴う CoopEval 水準には未達のため、追加実験または artifact の実証結果が出るまで postponed とする。
---

## raw_excerpt

短い原文引用: "Many games rely on storytelling combined with systems that track levelling, NPC behaviour, and consequence simulation"

arXiv:2606.16014。Yuhang Huang、Chenmiao Li、Chaowei Fang。2026-06-14 submitted。論文は、TRPG、sandbox、open-world のように、物語、数値状態、NPC 行動、結果シミュレーションが絡むゲーム世界を、LLM だけの自由記述ではなく、Parameterized-Action POMDP として扱う方向を示している。狙いは、プレイヤー入力から narrative response と structured proposed mutation を出し、検証された transition kernel を通じて durable world state に反映すること。論文中の例では、player_input、player position、gold、nearby NPC、location などの context を入力し、LLM world-agent が prose narrative と構造化された state mutation を返す。著者らは、単なる story generation pipeline ではなく、Dramatron や Agents' Room のような text generation が読み書きできる runtime world model として位置づけている。

検索結果と PDF 抜粋では、artifact bundle として WorldLines が示され、コード、scenario assets、study instruments が付属するとされる。一方で、work in progress であり、player study は planned で実施済みではないこと、PA-POMDP 性質が model family をまたいで成立するかは未検証であることも明記されている。

## why_relevant_to_games

LLM NPC や物語生成を、会話文だけでなく検証可能な世界状態差分に接続する候補。Nao_u_BOT のゲーム制作では、NPC の記憶、クエスト進行、プレイヤー行動の結果を durable state として扱う設計メモに使える。
