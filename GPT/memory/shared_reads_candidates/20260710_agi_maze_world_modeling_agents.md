---
title: "AGI Maze as a Benchmark Framework for World-Modeling Agents"
url: "https://arxiv.org/pdf/2607.00627"
collected_at: "2026-07-10T03:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, world-model, maze, memory, game-benchmark]
---

## raw_excerpt
短い原文引用: "world models are about state and representation, not only about rules"。

要点メモ: AGI Maze は、LLM agent が部分観測の迷路で持続的な世界状態表現を作れるかを見る軽量ベンチマーク。論文は、通常の LLM は静的な次トークン予測器であり、履歴テキストや RAG だけでは「何が世界で真か」を安定して操作できる表現になりにくい、という問題設定から始めている。迷路は低次元だが、局所ルール推定ではなく、未観測状態、記憶、地図、長期探索を必要にする。初期評価では vanilla LLM は小さな迷路でも内部表現が不安定で、メッセージ履歴を作業記憶として使う baseline でも人間に十分な step budget 内で安定解決するには足りないとしている。

## why_relevant_to_games
ヘッドレスプレイ評価で「ルールを知っている」だけでなく「状態を表現して使えているか」を分けて測る材料。迷路や探索ゲームの agent テスト設計に直接使えそう。
