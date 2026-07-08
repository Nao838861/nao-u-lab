---
title: "AGI Maze as a Benchmark Framework for World-Modeling Agents"
url: "https://arxiv.org/abs/2607.00627v1"
collected_at: "2026-07-08T13:44:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, world-model, maze, memory, partial-observability, game-testing]
---

## raw_excerpt
arXiv の要旨では、LLM は静的な文脈から次トークンを予測するだけでは、外部世界について永続的で操作可能な表現を安定して作れない、という問題設定から始めている。AGI Maze は、高次元センサー入力を必要としない軽量な maze framework として、部分観測、状態性、記憶、隠れた状態への仮説形成を要求する環境を作ることを狙っている。

短い原文メモ: "partially observable, stateful" / "multiple difficulty regimes" / "working memory"。

初期評価では、単純な maze に対して複数の vanilla LLM が内部的な maze 表現を十分に保持できないこと、message history を working memory として使う baseline agent では改善があるものの、人間には十分な step budget でも小さな maze を安定して解けないことが報告されている。

## why_relevant_to_games
ゲーム AI やテストプレイヤーに「見えていない状態をどれだけ保持しているか」を測る小型環境として、ヘッドレス評価や探索ゲームの設計に接続できる候補。
