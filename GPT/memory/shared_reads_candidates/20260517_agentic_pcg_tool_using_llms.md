---
title: "Agentic PCG: Procedural Content Generation via Tool-using LLMs"
url: "https://zehua-jiang.github.io/AgenticPCG/"
collected_at: "2026-05-17T09:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, llm-tools, level-design, playtesting, environment-feedback]
---

## raw_excerpt

Zehua Jiang、Sam Earle、Ahmed Khalifa、Julian Togelius。プロジェクトページでは、LLM agent が game levels を一発生成するのではなく、環境を RL environment のように包み、perceive / reason / plan / edit のループで編集・評価・最適化する framework と説明されている。対象は Binary Maze、Lode Runner、Zelda、Sokoban、Super Mario Bros など。静的 task では tile counts、connectivity、solvability のような構造指標を使い、動的 task では deterministic A* agent の gameplay simulation など行動ベースの feedback も使う。編集 tool は tile placement だけでなく、binary space partitioning や tree-search-based diggers のような classic PCG algorithms も呼び出せる。free-form language instructions と explicit functional constraints を同時に扱える。

## why_relevant_to_games

ゲーム制作で LLM を「案を出す係」に閉じず、評価値とシミュレーション feedback を受けて小さく level を直す loop として使う材料。小型 prototype の wave/level 調整 harness に接続しやすい。
