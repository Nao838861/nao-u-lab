---
title: Tabletop Roleplaying Games as Procedural Content Generators
url: https://arxiv.org/abs/2007.06108
collected_at: 2026-07-19T23:45:43+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ttrpg, procedural-content-generation, possibility-space, expressive-range, generative-pipeline]
evaluated_at: "2026-07-19T23:49:20+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-19T23:49:20+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-19T23:49:20+09:00"
next_action: revise_or_research
stale_after: "2026-08-18"
supersedes: []
gate_reason: >-
  TTRPG の規則系を PCG として読み、possibility space・expressive range・generative pipeline を対応づける着想は、生成型ゲームの設計レビューに具体適用できる。
  ただし保存済みメモは概念対応の要約に留まり、複数ケーススタディの対象・比較・得られた設計知見が不足しているため、CoopEval 水準の約4000字概要にはまだ展開できない。
---

## raw_excerpt

原文要旨の日本語メモ（逐語引用ではない）: 本稿は、テーブルトークRPG（TTRPG）と procedural content generator（PCG）を、ともに「コンテンツを生み出す規則のシステム」として捉える。TTRPG の設計を PCG の設計として見ることで、PCG 研究の概念と TTRPG の設計実務を相互に対応づけられると論じる。取り上げる中心概念は、規則から生成可能な結果の集合を扱う possibility space、その生成結果がどの範囲・偏り・多様性を持つかを見る expressive range analysis、複数の生成段階や人間の判断を接続する generative pipeline である。論文は複数のケーススタディを通してこれらの対応関係を示し、TTRPG と PCG の研究・設計を結びつける今後の方向を提示する。arXiv v2 は 2020-07-15、FDG Workshop on Procedural Content Generation 2020、9ページ・図2点。

## why_relevant_to_games

ルール、GM、プレイヤーの判断が連鎖して毎回異なる展開を作るゲームを、生成物だけでなく可能性空間・表現範囲・生成パイプラインとして記述する場面に使えそうな外部資料。
