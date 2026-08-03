---
title: "Hypergamigication Through Integrating Game Engines and Learning Management Systems: Ender's Game"
url: "https://arxiv.org/abs/2607.29300v1"
collected_at: "2026-08-04T05:15:54+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, educational-games, unity, game-engine, systems-integration]
evaluated_at: "2026-08-04T05:18:38+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-04T05:18:38+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-04T05:18:38+09:00"
next_action: revise_or_research
stale_after: "2026-09-03"
supersedes: []
gate_reason: >-
  双方向統合という着想と Unity–Blackboard pilot の存在は具体的だが、収集済み根拠は要旨に限られ、
  教材データの写像、実装境界、pilot の評価条件・結果が不足している。現状では推測なしに
  CoopEval 水準の約4000字概要を構成できないため、一次資料の詳細確認まで保留する。
---

## raw_excerpt

arXiv 要旨の収集メモ（日本語化・非逐語引用）: 本稿は、ゲームと教育利用、game engine と Learning Management System（LMS）の既往統合を整理した上で、両者を双方向につなぐ方式を提案する。中心となる “hypergamification” は、point、badge、leaderboard のような孤立した game design element を既存教材へ追加するのではなく、LMS 内の教材や学習情報を使って包括的な game environment を生成し、その環境と LMS の間で情報を往復させる考え方として置かれている。実装例として、Blackboard との統合を行う importable Unity package と、その package を利用する demo game を提示する。論文は working pilot を通じて統合経路を示し、提案方式の限界と今後の検討課題も扱う。著者は Araz Yusubov、Michael Bechtel、Tangiz Alizada。2026-07-31 公開、8 pages、5 figures、1 table。

## why_relevant_to_games

教材データから game environment を組み立て、gameplay 側の状態を外部システムへ戻す双方向設計の事例。ゲームの進行状態を別の制作・評価基盤と同期する integration architecture を検討する場面で参照できる。
