---
title: "ClassicLogic: A Knowledge-Driven Benchmark of Classic Puzzle Games for Evaluating Compositional Generalization"
url: "https://arxiv.org/abs/2607.05185"
collected_at: "2026-07-08T17:45:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [puzzle, benchmark, compositional-generalization, agent-evaluation, game-ai]
---

## raw_excerpt
ClassicLogic は、Sudoku、KenKen、Kakuro、Futoshiki の4種類の classic logic puzzle を使い、agent が基本ルールを覚えるだけでなく、明示的な strategy knowledge base から複合手順を学び、組み合わせ、転移できるかを測る benchmark。各 game base には hierarchical knowledge base があり、複雑な solving strategy はより単純な strategy の composition として定義される。論文は、Entity Composition、Relational Composition、Procedural Composition の3種を分けて評価できる点を主張している。設計原則として、初期盤面を symbolic matrix ではなく MNIST digit image で提示する Perceptual Grounding、特定の最小 strategy set を必要とする instance を作る Strategy-Driven Generation、strategy の compositional depth に連動する Validated Difficulty Scaling、すべての puzzle instance に unique solution を保証する Guaranteed Uniqueness を挙げる。通常の CSP solver のように最終解だけを高速に出すのではなく、agent が人間に理解可能な戦略を学び、どこで失敗したかを診断することを狙う。

## why_relevant_to_games
パズルゲームの難易度設計や tutorial / hint 設計で、単なる正解率ではなく「どの戦略階層で詰まったか」を測る候補になる。
