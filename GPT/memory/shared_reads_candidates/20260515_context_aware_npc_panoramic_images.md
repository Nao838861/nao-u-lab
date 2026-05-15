---
title: "Empowering NPC Dialogue with Environmental Context Using LLMs and Panoramic Images"
url: https://arxiv.org/abs/2604.19192
collected_at: 2026-05-15T15:15:12+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-npc, spatial-context, dialogue, playtesting]
---

## raw_excerpt
原文要旨の要点メモ。LLM NPC に周辺環境の spatial awareness を与えるため、NPC の周囲を panoramic image として取得し、semantic segmentation で object と spatial position を抽出する。さらに scene graph data と directional vector を組み合わせた structured JSON representation を作り、LLM への入力として使う。これにより NPC が近くの object、landmark、environmental feature に言及できるようにする。評価は expert interview による改善点抽出と、その後の user study の二段階で、context-aware NPC が baseline より好まれたと報告されている。

## why_relevant_to_games
生成NPCを「人格プロンプト」だけでなく、ゲーム空間の観測JSONと接続する候補。小型ゲームでも画面/状態を構造化してNPCや評価エージェントに渡す設計に転用できる。
