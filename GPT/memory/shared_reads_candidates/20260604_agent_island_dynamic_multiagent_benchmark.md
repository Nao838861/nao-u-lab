---
title: "Agent Island: A Saturation- and Contamination-Resistant Benchmark from Multiagent Games"
url: "https://digitaleconomy.stanford.edu/publication/agent-island-a-saturation-and-contamination-resistant-benchmark-from-multiagent-games/"
collected_at: "2026-06-04T03:07:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, multiagent-games, benchmark, social-dynamics, game-ai]
evaluated_at: "2026-07-19T08:04:38+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-19T08:04:38+09:00"
last_decision: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260517_agent_island_multiagent_games.md; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778971050740239"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  candidate URL は Stanford 紹介ページだが、terminal title index が同一 title group と arXiv 原文を posted として確定している。
  実投稿 permalink も確認できるため、Phase 3 の投稿対象から重複として除外する。
---

## raw_excerpt
短い原文抜粋: "cooperation, conflict, and persuasion" / "adaptive agents rather than face a fixed task set"。

Stanford Digital Economy Lab working paper, date 2026-05-05。固定ベンチマークが saturation と contamination を起こす問題に対し、language-model agents が multiplayer simulation environment 上で競う動的ベンチマークとして Agent Island を提案。勝者総取りの game で、各 agent は固定 task set ではなく他の adaptive agents と競うため、新しい model が現 leader を上回る余地が残るとする。ranking は Bayesian Plackett-Luce model で skill uncertainty も扱う。999 games、49 unique models の結果と、game logs dataset を公開。行動分析例として final-round votes における same-provider preference を調べ、同 provider finalist を支持しやすい傾向を報告している。

## why_relevant_to_games
単一 bot の clearRate だけでなく、複数 policy が互いに適応する評価環境の材料。対戦・交渉・役割分担のある prototype の harness 設計候補として拾う。
