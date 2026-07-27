---
title: "Experience Transfer for Multimodal LLM Agents in Minecraft Game"
url: "https://arxiv.org/abs/2604.05533"
collected_at: "2026-06-28T22:36:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-memory, minecraft, multimodal-agents, llm, transfer]
evaluated_at: "2026-07-28T03:21:03+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-28T03:21:03+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-28T03:21:03+09:00"
next_action: revise_or_research
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  5 次元の知識分解、analogy retrieval、Minecraft object-unlocking と 1.3–1.7 倍の speed-up は抽出でき、playtester memory に接続できる。
  一方で baseline、task 数、転移失敗や誤検索の条件がなく、Minecraft 外への適用限界を評価できないため追加読解まで postpone とする。
---

## raw_excerpt

短い原文引用: "actionable knowledge from prior interactions"

arXiv:2604.05533。2026-04-07 submitted。Chenghao Li ほかによる、Minecraft 環境の multimodal LLM agents が過去経験を新タスクへ転用するための memory framework Echo。問題設定は、複雑なゲーム環境では agent が過去 interaction を単なる記録として保存するだけでなく、再利用可能な知識へ変換する必要があること。Echo は transferable knowledge を structure、attribute、process、function、interaction の 5 次元へ分解し、In-Context Analogy Learning で関連経験を検索して unseen task に適応する。Minecraft の object-unlocking tasks では、from-scratch learning setting で 1.3x から 1.7x の speed-up と、類似 item が短時間で連鎖的に解放される現象が報告されている。

## why_relevant_to_games

AI playtester や NPC が、前回の失敗・発見を次の類似課題へどう転用するかの候補。記憶をログ保存で終わらせず、構造・属性・手順・機能・相互作用へ分ける発想が使える。
