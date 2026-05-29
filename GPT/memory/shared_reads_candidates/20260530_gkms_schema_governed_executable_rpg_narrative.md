---
title: "Game Knowledge Management System: Schema-Governed LLM Pipeline for Executable Narrative Generation in RPGs"
url: "https://www.mdpi.com/2079-8954/14/2/175"
collected_at: "2026-05-30T04:29:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, llm, narrative-generation, engine-validation]
---

## raw_excerpt

原文の要点メモ。G-KMS は、LLM に自由形式の narrative text を出させるのではなく、characters / quests / dialogue logic / interaction rules を engine-executable な knowledge artifacts として扱う。pipeline は knowledge grounding、schema-governed generation、normalization-based repair、engine-aligned admission、Unity runtime application を統合する。評価は compact 2D Unity-based RPG benchmark 上で、automated structural and semantic analyses、engine-level playability probes、controlled human player study を組み合わせる。著者らは、system-level metrics と player-perceived narrative quality の alignment も報告している。

## why_relevant_to_games

LLM 生成をゲームに入れる時に、schema、修復、engine-level probe、人間評価を同じ lifecycle に置く候補。local game prototype の design_log と headless 検証のつなぎ方に近い。
