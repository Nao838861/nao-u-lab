---
title: "Agentic Video Generation: From Text to Executable Event Graphs via Tool-Constrained LLM Planning"
url: "https://arxiv.org/abs/2604.10383"
collected_at: "2026-06-11T20:14:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, tool-use, simulation, narrative-design, validation]
---

## raw_excerpt
原文短句:
- "Graph of Events in Space and Time"
- "executed deterministically in a 3D game engine"
- "validated tool calls"
- "executable by construction"

抄録メモ: arXiv:2604.10383。動画生成を pixels から直接作るのではなく、LLM が actors/actions/objects/temporal constraints を含む GEST という形式仕様を組み、それを 3D game engine で deterministic に実行する設計。staged LLM refinement は 50 回中 0 回しか executable specification を作れなかったため、natural language reasoning と programmatic state backend を分離し、backend が simulator constraints を強制する。評価では agentic narratives と neural generator を比較し、物理的妥当性や意味整合性を測る。

## why_relevant_to_games
LLM にゲーム演出やステージイベントを自由記述させる時、直接コード化せず「実行可能なイベントグラフ + validator」に落とす発想が使えそう。敵 wave、チュートリアル、NPC 行動脚本の破綻検出候補。
