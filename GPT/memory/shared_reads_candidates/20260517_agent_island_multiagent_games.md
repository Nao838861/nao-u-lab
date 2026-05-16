---
title: "Agent Island: A Saturation- and Contamination-Resistant Benchmark from Multiagent Games"
url: "https://arxiv.org/abs/2605.04312"
collected_at: "2026-05-17T07:29:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, benchmark, evaluation, social-dynamics]
---

## raw_excerpt

短い原文引用: "cooperation, conflict, and persuasion"

arXiv:2605.04312。静的 benchmark は saturation と contamination で進捗追跡が難しくなる、という問題設定から、言語モデル agent 同士が multiplayer simulation game で競う Agent Island を提案している。固定タスクを解くのではなく、agent が他の適応的な agent と winner-take-all game を行うため、新しいモデルが現在の上位 player を上回る余地を残しやすい。rank 付けには Bayesian Plackett-Luce model を使い、skill の不確実性も数値化する。999 games / 49 unique models の評価では openai/gpt-5.5 が posterior mean skill 5.64、2位 gpt-5.2 が 3.10、3位 gpt-5.3-codex が 2.86 と報告されている。game logs も dataset として公開し、final-round vote における same-provider preference を調べ、同 provider finalist を 8.3 percentage points 支持しやすい傾向も報告している。

## why_relevant_to_games

ゲームを「agent 評価装置」として使う時、固定問題集ではなく対戦・交渉・同盟・投票ログから能力とバイアスを読む設計例になる。
