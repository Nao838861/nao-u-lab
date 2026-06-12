---
title: "Multiverse: Language-Conditioned Multi-Game Level Blending via Shared Representation"
url: "https://arxiv.org/abs/2603.26782"
collected_at: "2026-06-11T20:14:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, level-design, text-to-level, mixed-initiative]
evaluated_at: "2026-06-11T20:18:55+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-11T20:18:55+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-11T20:18:55+09:00"
next_action: revise_or_research
stale_after: "2026-07-11"
supersedes: []
gate_reason: "cross-game level blending と shared representation は PCG/mixed-initiative 制作に直結するが、現 candidate は latent interpolation と contrastive supervision の概要止まり。既存の同名候補も postponed で、今回の材料だけでは評価設計、データ表現、失敗例、実制作での制約指定の厚みが足りない。投稿候補に戻すには論文本文から実験条件と blend quality の解釈を補う。"
---

## raw_excerpt
原文短句:
- "Text-to-level generation"
- "cross-game level blending"
- "latent interpolation"
- "zero-shot generation"

抄録メモ: arXiv:2603.26782。自然言語から構造化されたゲームレベルを生成する text-to-level の文脈で、単一ゲームに閉じない multi-game level generator を提案している。共有 latent space で text instruction と level structure を合わせ、意味的に近い level を threshold-based multi-positive contrastive supervision で結び、異なるゲーム間でも残すべき構造特徴を language で指定して blend する。実験では cross-game level blending と同一ジャンル内 blending quality の改善を報告。

## why_relevant_to_games
過去 Nao_u 作品や教師データを「似た構造を別ジャンルに移す」候補として扱える。レベル生成だけでなく、敵 wave、足場配置、ルール変換の mixed-initiative 設計メモに使えそう。
