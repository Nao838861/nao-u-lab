---
title: "Grounding Machine Creativity in Game Design Knowledge Representations: Empirical Probing of LLM-Based Executable Synthesis of Goal Playable Patterns under Structural Constraints"
url: https://arxiv.org/abs/2603.07101
collected_at: 2026-05-26T19:52:28+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm, procedural-generation, unity, playable-patterns]
---

## raw_excerpt
arXiv 2603.07101。Hugh Xuechen Liu / Kivanc Tatar による、gameplay design patterns と Goal Playable Concepts (GPCs) を使って、LLM が Unity 上で実行可能なゲームコードを生成できるかを調べる研究。

要点メモ:
- 複雑な gameplay idea を Unity project / code のような executable artifact に変換することを、computational game creativity の中心課題として置く。
- gameplay design patterns は entity、constraint、rule-driven dynamics に分解する表現で、goal patterns は player-objective relationship を形式化する。
- GPCs は、それらの抽象パターンを playable Unity implementations として運用し、体験的探索や compositional gameplay design を支える。
- 26 個の goal pattern instantiations を使い、自然言語から直接 C# / Unity へ生成する baseline と、Unity-specific intermediate representation (IR) を挟む pipeline を比較する。
- 評価は automated Unity replay による compilation success を含む。著者は grounding failure / hygiene failure を挙げ、structural grounding と project-level grounding を主要 bottleneck としている。

## why_relevant_to_games
LLM でゲームを量産する時の「アイデアから playable artifact への変換」を、パターン表現・IR・自動 replay 評価に分けて扱う素材になる。
