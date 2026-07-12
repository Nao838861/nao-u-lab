---
title: "OpenLife: Toward Open-World Artificial Life with Autonomous LLM Agents"
url: "https://arxiv.org/abs/2606.31046"
collected_at: "2026-07-13T00:13:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [artificial-life, llm-agent, persistent-memory, agent-society, npc-simulation]
evaluated_at: "2026-07-13T00:15:28+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-13T00:15:28+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-13T00:15:28+09:00"
next_action: revise_or_research
stale_after: "2026-08-12"
supersedes: []
gate_reason: >-
  memory・perception・evaluation・budget metabolism を非同期プロセスとして分離する着想は、長期稼働 NPC の設計へ具体的に接続できる。一方、現 candidate には約2週間の実験について比較条件、指標、定量結果、失敗例がなく、CoopEval 水準の概要で「評価の中身」を根拠付きで説明するには不足するため、本文または補足資料の再調査まで保留する。
---

## raw_excerpt

人工生命研究は多様な計算基盤上で生命らしい振る舞いを扱ってきたが、その多くは研究者が設計した閉じた世界に限られていた。著者らは、永続記憶、ツール利用、ネットワークアクセス、支払い能力を持つ LLM agent により、社会・技術・経済に開かれた「open-world Artificial Life」を実験できると論じる。proof-of-concept の OpenLife は、単一の smart agent を作るのではなく、stateless LLM の周囲に memory、perception、evaluation、budget-based metabolism という非同期プロセスの社会を配置する。固定目的がないため、経験は scalar reward ではなく open-vocabulary の LLM judgment で評価され、memory は出現頻度ではなく意味によって再配線される。6 agent を約12週間 open world で稼働させ、反応的活動から自発的活動への移行、agent ごとの個体化、社会構造の創発、外部収入の獲得を報告する。著者らは人工生命の実現を主張せず、open-world ALIFE を実験可能な paradigm と platform として提示している。

## why_relevant_to_games

長期 NPC や agent society を、一枚岩の agent ではなく記憶・知覚・評価・資源制約の非同期プロセスとして構成し、固定スコア外の変化を観察するゲーム内生態系設計の参照候補になる。
