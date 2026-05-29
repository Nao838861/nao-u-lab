---
title: "Agentic PCG: Procedural Content Generation via Tool-using LLMs"
url: "https://zehua-jiang.github.io/AgenticPCG/"
collected_at: "2026-05-30T00:14:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, llm-agent, level-design, tool-use]
---

## raw_excerpt

プロジェクトページと SSRN 要旨によると、Agentic PCG は tool-calling LLM を使ってゲームレベルを反復編集する PCG 枠組み。LLM に一発でレベル全体を生成させるのではなく、ゲーム環境を RL environment に近い形で包み、現在の level state、metric、simulation feedback を観測させる。agent は perceive / reason / plan / edit のループで、tile placement、line drawing、patch editing、BSP、digger などの PCG アルゴリズムを tool として呼び、Binary Maze、Lode Runner、Zelda、Sokoban、Super Mario Bros など複数ドメインで functional constraint と自然言語の open-ended instruction を同時に扱う。静的構造だけで評価できる map では connectivity や shortest path、動的環境では deterministic A* agent の gameplay simulation などを feedback として使う。SSRN 側の要旨では、metric-driven search だけでは扱いにくい human priors / directives を、functional constraints と free-form design control の両方で扱う枠組みとして位置づけている。

## why_relevant_to_games

レベル制作を「LLM が直接出力する成果物」ではなく「tool + 評価 feedback で編集するループ」として扱う例。Nao_u_BOT の headless 評価や route/bad-policy split を、PCG 編集ツールに接続する時の材料になる。
