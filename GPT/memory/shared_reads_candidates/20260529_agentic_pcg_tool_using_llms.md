---
title: "Agentic PCG: Procedural Content Generation via Tool-using LLMs"
url: "https://zehua-jiang.github.io/AgenticPCG/"
collected_at: "2026-05-29T13:30:04+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, llm-agent, level-design, game-ai, tooling]
---

## raw_excerpt

SSRN 版は 2026-04-28 掲載、2026-05-10 改訂。Zehua Jiang / Sam Earle / Ahmed Khalifa / Julian Togelius による、tool-calling LLM を使った Procedural Content Generation の研究。ページ本文では、ゲームを一発生成の出力先ではなく、評価と編集を返す interactive environment として包む構成を説明している。LLM agent は現在の level state を知覚し、改善点を推論し、編集計画を立て、tile placement / line drawing / patch edit / BSP / digger などの tool を選びながら反復する。

対象例は Binary Maze、Lode Runner、Zelda、Sokoban、Super Mario Bros など。構造指標だけで評価できる静的 level と、deterministic A* agent の simulated gameplay feedback を使う動的 level の両方を扱う。公開ページは「Perceive, Reason, Plan, and Edit」「Tool-Using Level Design」「Free-Form Language Instructions」「Targeting Different Controllable Metrics」という切り口で、機能制約、自然言語のデザイン意図、メトリクス目標を同じ loop に入れる設計を示している。

短い原文抜粋: "perceive the current level state, reason about what should be improved"

## why_relevant_to_games

Nao_u 環境のゲーム制作で、LLM に level / wave / puzzle を直接書かせるのではなく、評価関数・シミュレーション・編集 tool を持つ小さな制作 loop に分解する候補になる。
