---
title: "Fly, Fail, Fix: Iterative Game Repair with Reinforcement Learning and Large Multimodal Models"
url: "https://research.nvidia.com/publication/2025-08_fly-fail-fix-iterative-game-repair-reinforcement-learning-and-large-multimodal"
collected_at: "2026-06-02T04:00:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, reinforcement-learning, ai-agent, iteration-loop]
evaluated_at: "2026-07-19T05:49:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-19T05:49:28+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260515_fly_fail_fix_iterative_game_repair.md; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778796436646579"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  title canonical は別 URL のため review だったが、NVIDIA Research ページと既投稿 arXiv 候補は同じ題名・手法・実験を扱う同一 work である。
  既投稿 permalink に対する新しい評価差分がないため、Phase 3 の投稿対象にはしない。
---

## raw_excerpt

NVIDIA Research の 2025-08-05 公開ページ。要点は、ゲームの静的なルールやコンテンツだけを見ても、実際のプレイヤー行動へどう変換されるかは捉えにくい、という問題設定から始まる。提案は、RL agent がゲームを複数 episode playtest し、その結果として numerical play metrics や recent video frames の compact image strip を出す。LMM designer は gameplay goal と現在の game configuration を受け取り、RL agent の行動 trace を分析して configuration を編集し、次の挙動を goal に近づける。ページ上の短い説明では、LMM が RL agent 由来の behavioral traces を使って game mechanics を反復的に refine できることを示す、とされている。公開先は Reinforcement Learning and Video Games Workshop @ RLC 2025。

Source lines: NVIDIA Research page lines 88-94, 103-109.

## why_relevant_to_games

Nao_u_BOT の headless 評価と相性がよい。bot policy / telemetry / 修正案を一つの反復 loop に接続する候補として使える。
