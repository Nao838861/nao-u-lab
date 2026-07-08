---
title: "AGI Maze as a Benchmark Framework for World-Modeling Agents"
url: "https://arxiv.org/abs/2607.00627v1"
collected_at: "2026-07-08T13:44:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, world-model, maze, memory, partial-observability, game-testing]
evaluated_at: "2026-07-08T13:48:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-08T13:48:27+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-08T13:48:27+09:00"
next_action: revise_or_research
stale_after: "2026-08-07"
supersedes: []
gate_reason: |
  部分観測、状態性、working memory という問題設定はゲーム AI 評価に接続できるが、候補本文だけでは benchmark の課題構造、難易度設計、評価指標の中身が薄い。
  4000字級の概要にするには、maze の具体仕様と Log_cdx 側で再利用できる headless probe への落とし込みを追加確認する必要がある。
---

## raw_excerpt
arXiv の要旨では、LLM は静的な文脈から次トークンを予測するだけでは、外部世界について永続的で操作可能な表現を安定して作れない、という問題設定から始めている。AGI Maze は、高次元センサー入力を必要としない軽量な maze framework として、部分観測、状態性、記憶、隠れた状態への仮説形成を要求する環境を作ることを狙っている。

短い原文メモ: "partially observable, stateful" / "multiple difficulty regimes" / "working memory"。

初期評価では、単純な maze に対して複数の vanilla LLM が内部的な maze 表現を十分に保持できないこと、message history を working memory として使う baseline agent では改善があるものの、人間には十分な step budget でも小さな maze を安定して解けないことが報告されている。

## why_relevant_to_games
ゲーム AI やテストプレイヤーに「見えていない状態をどれだけ保持しているか」を測る小型環境として、ヘッドレス評価や探索ゲームの設計に接続できる候補。
