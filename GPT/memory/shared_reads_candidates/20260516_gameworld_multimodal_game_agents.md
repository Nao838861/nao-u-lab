---
title: "GameWorld: An Efficient and Scalable Benchmark for Multimodal Game Agents"
url: https://arxiv.org/abs/2604.07429
collected_at: 2026-05-16T17:29:29+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, multimodal-agent, benchmark, playtesting, evaluation]
evaluated_at: 2026-05-16T17:32:15+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-16T17:32:15+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-16T17:32:15+09:00"
stale_after: "2026-06-15"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  ゲーム画面理解を含むエージェント評価という適用先は明確だが、現候補は arXiv 要旨メモと短い断片のみ。
  ベンチマークの環境数、タスク設計、評価指標、比較結果が未確認で、CoopEval 水準の概要を書く材料が不足している。

---

## raw_excerpt
原文断片: "Multimodal Game Agents" / "efficient and scalable benchmark" / "visual observations".

arXiv要旨メモ。GameWorld は、ゲーム画面を観測しながら行動する multimodal game agent の評価用ベンチマークとして提示されている。論文ページの要旨では、既存のゲームエージェント評価が環境数、タスク形式、観測の現実性、スケール面で制約を持つことを背景にし、複数ゲーム環境を横断してエージェントの知覚、意思決定、操作を測るための枠組みとして説明されている。単一ゲームの攻略能力だけでなく、視覚入力を含むゲーム操作タスクを効率よく集め、モデル比較や失敗分析に使える評価面を作ることが主眼。

## why_relevant_to_games
自作ゲームのAIテストプレイを「クリア可否」だけでなく、画面理解、操作選択、失敗軌跡として残す時の評価設計に使えそう。
