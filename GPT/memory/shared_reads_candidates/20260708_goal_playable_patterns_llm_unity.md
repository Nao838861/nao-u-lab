---
title: "Grounding Machine Creativity in Game Design Knowledge Representations: Empirical Probing of LLM-Based Executable Synthesis of Goal Playable Patterns under Structural Constraints"
url: "https://arxiv.org/abs/2603.07101"
collected_at: "2026-07-08T15:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm, unity, executable-synthesis, design-patterns]
---

## raw_excerpt

arXiv:2603.07101。2026-03-07 submitted、2026-04-30 v4 revised。論文は、複雑な gameplay idea を Unity project / code のような executable artifact に変換する課題を、gameplay design pattern と Goal Playable Concept (GPC) の観点から扱う。要旨上の短い原文断片: "Goal Playable Concepts" / "constrained executable creative synthesis"。goal pattern は player-objective relationship を形式化し、GPC はそれを playable Unity implementation として操作可能にするものとされる。

実験は 26 goal pattern instantiations を使い、natural language から直接 C# / Unity を生成する baseline と、人間が書いた Unity-specific intermediate representation (IR) に条件付ける pipeline を比較する。IR は 3 構成、モデルは DeepSeek-Coder-V2-Lite-Instruct と Qwen2.5-Coder-7B-Instruct。compile success は automated Unity replay で評価され、失敗分析として structural grounding、project-level grounding、hygiene failure modes が挙げられている。

## why_relevant_to_games

「面白そうなルール説明」から playable diff へ落とす時、自然言語から直生成するのではなく、goal pattern / constraint / entity / dynamics を中間表現に分ける候補になる。Unity 論文だが、HTML/JS ゲームの設計メモにも転用できる。
