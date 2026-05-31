---
title: "Robo-Cortex: A Self-Evolving Embodied Agent via Dual-Grain Cognitive Memory and Autonomous Knowledge Induction"
url: "http://arxiv.org/abs/2605.18729v1"
collected_at: "2026-05-28T01:29:35+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, embodied-agent, game-ai, evaluation, navigation]
evaluated_at: "2026-05-28T01:55:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-28T01:55:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-28T01:55:00+09:00"
stale_after: "2026-06-27"
supersedes: []
next_action: revise_or_research
gate_reason: |
  問題設定と着想は明確で、ゲーム内 AI / headless bot の失敗ログを再利用する評価軸に接続できる。
  ただし候補メモだけでは実験設定・比較対象・定量結果が不足し、CoopEval 水準の概要を書くには論文本文確認が必要。

---

## raw_excerpt

arXiv raw result の要旨メモ: 複雑な環境での navigation と interaction は embodied agent の中心課題だが、未知環境では過去の軌跡や反応的 policy だけでは一般化可能な戦略を作れず、著者らはこれを "experiential amnesia" と呼んでいる。Robo-Cortex は、成功パターンと失敗の落とし穴を自然言語 heuristic として抽象化し、continuous reflection-adaptation loop によって navigation heuristics と cognitive strategies を自律的に誘導・更新する self-evolving framework として提案されている。ポイントは、経験ログをただ保存するのではなく、成功/失敗から reusable な行動知識へ変換し、次の unseen environment で使える形にすること。

## why_relevant_to_games

ゲーム内 AI プレイヤーや headless bot を、単なる固定 route ではなく「失敗から次の探索規則を作る」評価器にする時の材料になりそう。
