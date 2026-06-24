---
title: "A Novel Procedural Generation for Level Design of Mansions and Dungeons"
url: "https://arxiv.org/abs/2606.03857"
collected_at: "2026-06-05T11:47:47.1769811+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, level-design, dungeon, navigability]
status: needs_review
candidate_status: needs_review
last_reviewed_at: "2026-06-12T05:06:00+09:00"
last_decision: needs_review
evidence: "Phase 4a lifecycle audit: status field was missing"
next_action: evaluate_in_phase2
gate_reason: "Phase 1 collected candidate; Phase 2 quality gate result is not recorded yet."
stale_after: "2026-07-12"
supersedes: []
---

## raw_excerpt

arXiv:2606.03857。2026-06-02 submitted、SBGames 2025 journal reference。論文は、PCG が制作時間とコストを下げ、リプレイ性や多様性を増やす一方で、level design principles と噛み合わない場合は空間構造が incoherent になり、遊びの体験も悪くなる、という問題設定から始めている。

提案は、house / mansion / dungeon のような indoor environment を対象に、architectural coherence と navigability の両立を狙う PCG method。手順は、Binary Space Partitioning による空間分割、graph traversal による room connection、structural artifacts を掃除して visual cohesion を上げる post-processing の 3 stage。room area と shape は parameterize でき、seed によって randomness を再現可能にする。評価では seed / parameter configuration による柔軟性を示したうえで、BFS による connectivity verification を行い、100000 maps の生成テストで、適切な parameter では 91% 超が complete connectivity になったと報告している。

短い原文断片: "architectural coherence and navigability"

## why_relevant_to_games

屋内マップ生成を、見た目の部屋配置ではなく connectivity / redundancy / cleanup まで含む制作手順として見られる。Nao_u_BOT の dungeon / mansion / facility 系プロトタイプで、BSP 生成後に BFS 検証を挟む候補になる。
