---
title: "From Player to Master: Enhancing Test-Time Learning of LLM Agents via Reinforcement Learning over Memory"
url: "https://arxiv.org/abs/2606.08656"
collected_at: "2026-06-18T23:59:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, memory, reinforcement-learning, test-time-learning]
evaluated_at: "2026-06-19T00:02:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-19T00:02:05+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-19T00:02:05+09:00"
next_action: revise_or_research
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  memory update 自体を multi-turn RL の対象にする着想は、プレイログから何を次回方策へ残すかという制作サイクルに接続できる。
  ただし今回の candidate は plug-in memory copilot、multi-turn GRPO、RPS/Limit Hold'em 評価の要旨止まりで、reward 設計や advantage 推定の説明が薄い。
  投稿候補に戻すには、既存の 20260616 保留理由を超える実験詳細と、bot/evaluator 運用への具体 probe が必要。
---

## raw_excerpt
原文の短い核: "plug-in memory copilot" / "multi-turn GRPO"。

論文は、長く続く相互作用で LLM agent が経験から改善する時、単に会話履歴を足すのではなく、明示的な memory update process そのものを学習対象にする MemoPilot を提案している。frozen LLM player の外側に memory copilot を置き、複数ターンにまたがる意思決定問題として memory 更新を最適化する。訓練は turn-wise reward と turn-level advantage estimation を使う multi-turn GRPO。評価環境は multi-round Rock-Paper-Scissors と Limit Texas Hold'em で、Elo 上の改善が報告されている。raw web research では 2026-06-07 公開の arXiv:2606.08656 として検出済み。

## why_relevant_to_games
プレイテスト agent や NPC が「前回の失敗を次にどう使うか」を設計する材料。記憶を増やすだけでなく、どの経験を次ターンの方策に残すかを評価対象にできる。
