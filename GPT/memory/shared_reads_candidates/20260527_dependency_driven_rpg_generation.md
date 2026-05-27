---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: "http://arxiv.org/abs/2604.25482v1"
collected_at: "2026-05-27T19:23:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, procedural-generation, narrative, llm]
---

## raw_excerpt
要旨メモ: RPG の世界設定、NPC、プレイヤーキャラクター、キャンペーン単位のクエスト計画、個別クエスト展開を一気に生成せず、依存関係を持つ段階的な prompt pipeline として扱う。複雑な RPG world generation で起きやすい coherence、controllability、structural consistency の問題に対し、中間表現を挟みながら後段生成を前段の構造に条件付ける構成。

## why_relevant_to_games
アドベンチャーや RPG の自動生成で「設定はあるがプレイ可能な導線が崩れる」問題を分解する材料。Nao_u 作品向けには、世界観より先に依存関係表を作る生成手順の候補になる。
