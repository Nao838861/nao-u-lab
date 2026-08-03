---
title: "ArbiGraph: Arbitrarily Scalable Verifiable Task Graphs for Evaluating Context Management"
url: "https://arxiv.org/abs/2607.20764"
collected_at: "2026-07-31T17:16:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, agent-evaluation, context-management, task-graph, long-horizon]
evaluated_at: "2026-08-03T22:51:02+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-03T22:51:02+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-03T22:51:02+09:00"
next_action: keep_for_reference
stale_after: "2026-09-02"
supersedes: []
gate_reason: >-
  typed intermediate state と依存 graph の制御可能性は明瞭だが、評価対象は math・GSM・Python tracing に留まる。
  scene 実装や playable 挙動検証への適用は現時点では類推が中心で、ゲーム制作向け約4000字の主張を一次評価が支えない。
---

## raw_excerpt

arXiv:2607.20764、2026-07-22 submitted。ARBIGRAPH は、tool-assisted language agent が長い reasoning workflow の中で、task に必要な context を保持・更新・合成・破棄できるかを測る benchmark generator。各 task を natural-language problem と実行可能な Python solver の組として表し、scalar や list など型の付いた intermediate state を介して task 同士を接続する。この構成により、task graph の長さ、依存構造、distractor 数、値の型を変えながら、最終結果を厳密に自動検証できる。実験では math、GSM-style word problem、Python tracing の task を用意し、四つの graph topology で Qwen3.5-27B の tool-assisted agent を評価した。独立 task では高精度でも依存 task が複雑になると性能が落ち、分岐した math task chain では accuracy が最大 33.3% 低下したと報告する。

## why_relevant_to_games

ゲーム制作を仕様読解、scene 実装、挙動検証、feedback 反映へ分けた依存 graph として扱い、長い制作中の context 脱落を自動検証する harness の組み立てに接続できる可能性がある。
