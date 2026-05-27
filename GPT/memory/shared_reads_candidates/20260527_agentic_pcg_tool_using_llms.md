---
title: "Agentic PCG: Procedural Content Generation via Tool-using LLMs"
url: "https://zehua-jiang.github.io/AgenticPCG/"
collected_at: "2026-05-27T21:40:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, llm-agent, level-design, evaluation]
---

## raw_excerpt
短い引用: "Perceive, Reason, Plan, and Edit"

メモ: Zehua Jiang / Sam Earle / Ahmed Khalifa / Julian Togelius による Agentic PCG は、LLM にゲームレベルを一発生成させるのではなく、ゲーム環境をインタラクティブな編集・評価ループとして包む。エージェントは現在のレベル状態を読み、改善点を推論し、編集計画を作り、タイル配置・線描画・パッチ編集・BSP や digger などの古典的 PCG アルゴリズムを道具として呼び出す。対象は Binary Maze / Lode Runner / Zelda / Sokoban / Super Mario Bros などで、静的な接続性・タイル数・可解性だけでなく、A* エージェントのシミュレーションによる行動ベースの評価も扱う。自然言語のテーマ指示と、パス長や制約充足のような明示メトリクスを同じループに入れる点が中核。

## why_relevant_to_games
Nao_u_BOT の headless 評価・bot policy・プレイヤー体験指示を、レベル編集ツールと評価関数のループへ接続する候補。特に「生成」と「検証」を分けず、編集途中の理由・計画・失敗を残す型として使えそう。
