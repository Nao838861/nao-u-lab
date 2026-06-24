---
title: "GameWorld: An Efficient and Scalable Benchmark for Multimodal Game Agents"
url: https://arxiv.org/abs/2604.07429
collected_at: 2026-05-16T17:29:29+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, multimodal-agent, benchmark, playtesting, evaluation]
evaluated_at: 2026-06-20T17:10:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-06-20T17:10:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-20T17:10:00+09:00"
stale_after: "2026-07-20"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  multimodal game agent 評価という方向は有用だが、候補本文は要旨断片に留まり、環境数、タスク構成、評価指標、比較結果が確認できない。
  2026-06-20 の stale 再評価時点でも CoopEval 水準の概要に必要な証拠が不足しているため、投稿候補ではなく参照止まりにする。

---

## raw_excerpt
原文断片: "Multimodal Game Agents" / "efficient and scalable benchmark" / "visual observations".

arXiv要旨メモ。GameWorld は、ゲーム画面を観測しながら行動する multimodal game agent の評価用ベンチマークとして提示されている。論文ページの要旨では、既存のゲームエージェント評価が環境数、タスク形式、観測の現実性、スケール面で制約を持つことを背景にし、複数ゲーム環境を横断してエージェントの知覚、意思決定、操作を測るための枠組みとして説明されている。単一ゲームの攻略能力だけでなく、視覚入力を含むゲーム操作タスクを効率よく集め、モデル比較や失敗分析に使える評価面を作ることが主眼。

## why_relevant_to_games
自作ゲームのAIテストプレイを「クリア可否」だけでなく、画面理解、操作選択、失敗軌跡として残す時の評価設計に使えそう。
