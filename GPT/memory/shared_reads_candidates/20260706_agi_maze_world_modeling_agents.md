---
title: "AGI Maze as a Benchmark Framework for World-Modeling Agents"
url: "https://arxiv.org/abs/2607.00627"
collected_at: "2026-07-06T15:59:43.2997928+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, world-model, maze, memory, benchmark]
---

## raw_excerpt

arXiv 2607.00627。Alexey Potapov による、world-modeling agent 評価用の軽量 maze benchmark。問題設定は、LLM が静的 context 上の next-token prediction では強く見えても、部分観測、状態保持、隠れた world state への仮説更新が必要な環境では、持続的で操作可能な外界表現を作れるとは限らないという点。AGI Maze は高次元 sensory input を使わず、grid-based maze tasks、clean API、複数 difficulty regimes を提供し、local rule の推論ではなく world state representation を学習して使う必要がある環境を作る。初期評価では、vanilla LLM は小さな maze でも inference time に内部表現を安定して保持できず、message history を working memory として観測記述を構築できる baseline agent でも、人間には十分な step budget 内で小 maze を安定解決するには不足するとされる。

## why_relevant_to_games

迷路・探索・戦術移動ゲームで、agent を「解けたか」だけでなく、見た情報から地図や隠れ状態を更新できているかで見る入口になる。headless 評価や NPC path reasoning の probe に接続しやすい。
