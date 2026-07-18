---
title: "Beyond the Current Observation: Evaluating Multimodal Large Language Models in Controllable Non-Markov Games"
url: "https://arxiv.org/abs/2606.19338"
collected_at: "2026-06-20T21:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, benchmark, memory, multimodal-agent, non-markov-games, evaluation]
evaluated_at: "2026-06-20T21:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T05:58:56+09:00"
last_decision: fail_duplicate_posted
evidence: "same source completed and posted by memory/shared_reads_candidates/20260719_rng_bench_non_markov_games.md; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784408323132209"
next_action: keep_for_reference
stale_after: "2026-07-20"
supersedes: []
superseded_by: "memory/shared_reads_candidates/20260719_rng_bench_non_markov_games.md"
gate_reason: |-
  「現在画面への反応」と「過去観測の再構成」を分ける着想はゲーム評価に有用だが、Phase 3 投稿には Memory Gap の定義と duel protocol の詳細確認が必要。
  適用先はカード・迷路・探索ゲームに寄るため、汎用の制作サイクルへ持ち込むには具体的な小型 probe まで落とす必要がある。
---

## raw_excerpt
arXiv:2606.19338。RNG-Bench は、Multimodal Foundation Models を closed-loop policy として使う時、現在見えていない過去観測に基づいて行動できるかを分離して測る benchmark。既存 benchmark は full state を見せる、hidden-state reconstruction と他能力を混ぜる、episode 終了後の recall だけを見る、という問題があると整理する。RNG-Bench は Reconstructive Non-Markov Games として、Matching Pairs と 3D Maze の 2 ゲームを用意する。Matching Pairs は一度だけ見えたカード identity を位置と結びつけて後で使う課題、3D Maze は egocentric view を統合して spatial map として保持する課題。grid size、visual pattern、observation modality の 3 軸で難易度制御し、head-to-head duel protocol で instance variance を抑える。Memory Gap metric により、忘却と action selection の悪さを切り分ける。最難構成では約 128K tokens と 350 image inputs が必要で、frontier MLLM でも未飽和。残存 error の多くは行動選択ではなく earlier observations の forgetting に由来するとされる。

## why_relevant_to_games
小型ゲームの評価で「今見えている画面への反応」と「過去に見た情報を使った行動」を分離する候補。迷路、カード、探索ゲームの自動評価で Memory Gap 的な指標を借りられる。
