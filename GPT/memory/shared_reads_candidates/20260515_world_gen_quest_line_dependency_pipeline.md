---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: https://arxiv.org/abs/2604.25482
collected_at: 2026-05-15T17:14:18+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [narrative-design, rpg, llm-pipeline, procedural-content-generation, structured-output]
---

## raw_excerpt
短い原文句: "dependency-aware" / "structured JSON outputs" / "narrative coherence"。

メモ: 2026-04-28 投稿の arXiv 論文。RPG の world building、NPC 作成、player character 作成、campaign-level quest planning、quest expansion を段階分解し、各段階が前段の structured JSON output に依存する prompt pipeline を試す。狙いは、単発生成で崩れやすい一貫性・制御性・構造的整合性を、明示的な data flow と schema で支えること。評価は複数 independent run への qualitative / human-centered analysis で、structural completeness、internal consistency、diversity、actionability などを見る。

## why_relevant_to_games
物語生成そのものだけでなく、ゲーム仕様を「前段出力に依存する小さな中間表現」に分ける材料になる。NPC、目的、ステージ条件、報酬を一気に生成せず、破綻確認点を挟む設計に使えそう。
