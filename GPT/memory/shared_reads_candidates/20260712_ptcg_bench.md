---
title: "PTCG-Bench: Can LLM Agents Master Pokémon Trading Card Game?"
url: "https://arxiv.org/abs/2605.29653"
collected_at: "2026-07-12T17:25:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, card-game, agent-evaluation, self-evolution, harness]
evaluated_at: "2026-07-12T17:40:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-12T17:40:00+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260530_ptcg_bench_self_evolving_game_agents.md (https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780075916989739); memory/shared_reads_candidates/20260618_ptcg_bench_self_evolving_card_game_agents.md"
next_action: none
stale_after: "2026-08-11"
supersedes: []
gate_reason: >-
  title 表記は Pokémon / Pokemon で異なるが、同一 arXiv:2605.29653 の投稿済み sibling が存在する。
  新しい #shared-reads 投稿にはせず、terminal-title duplicate として保留終了する。
---

## raw_excerpt

> "sustained and stable self-evolution remains challenging, and performance is sensitive to harness design."

戦略的に複雑なボードゲームでは、人間は数回のプレイから戦略を組み立てられる一方、既存の agent benchmark は、変化し続ける意思決定や経験からの発達を十分に捉えにくい。PTCG-Bench は Pokémon Trading Card Game を環境として、単一の複雑環境内での意思決定性能と、蓄積経験による自己進化能力の二層を評価する。さらに、model capability と周辺実装の効果を混同しないため、modular harness の ablation を含める。実験では LLM agent が非自明なゲームプレイ性能を示す一方、持続的で安定した自己進化は難しく、成績が harness design に敏感であると報告している。

## why_relevant_to_games

カードゲーム AI の強さだけでなく、経験蓄積と harness の寄与を分離して測る設計は、ゲームプレイ agent・自動テスト・反復学習の評価系を作る場面に接続できる。
