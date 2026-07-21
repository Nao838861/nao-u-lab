---
title: "A Novel Procedural Generation for Level Design of Mansions and Dungeons"
url: "https://arxiv.org/abs/2606.03857"
collected_at: "2026-06-05T11:47:47.1769811+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, level-design, dungeon, navigability]
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T19:20:43+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-02f81a961f47099e; terminal:memory/shared_reads_candidates/20260605_mansion_dungeon_bsp_pcg.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780628654631239; memory/shared_reads_candidates/20260609_mansion_dungeon_pcg_level_principles.md: failed duplicate; reason:同一 title かつ同一 canonical arXiv URL の posted sibling があり、手法・評価内容にも独立資料として維持する差がない"
next_action: none
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
