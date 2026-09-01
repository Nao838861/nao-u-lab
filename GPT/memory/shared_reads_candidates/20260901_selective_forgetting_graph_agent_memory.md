---
title: "Selective Forgetting: A Graph-Based Memory Framework for Long-Term LLM Agents"
url: "https://arxiv.org/abs/2608.28978"
collected_at: "2026-09-01T20:18:23+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, memory, evaluation, playtesting]
---

## raw_excerpt

長期稼働する LLM agent の memory について、会話を entity と relation に分解した knowledge graph が flat な vector retrieval より recall を改善するという仮定を直接検証した研究。各 conversation turn を typed node と attributed edge に変換し、質問には two-hop subgraph から回答する。さらに recency、access frequency、degree centrality、age の重み付き score が低い node を定期的に pruning する selective forgetting module を組み込む。

LongMemEval では retrieval root を 5 件に揃えた条件で、graph の token F1 は 0.417、flat vector baseline は 0.468。500 問の paired bootstrap による差は -0.050、95% CI は [-0.085, -0.016] だった。特定の過去 assistant turn を思い出す質問では judged correctness が 0.911 から 0.607 に下がり、turn を entity に分解したことで質問が必要とする surface form が失われた可能性が示される。一方、27,021 node の persistent graph に forgetting を一度適用すると node の 9.8%、保存 byte の 9.5%を削減し、token F1 の変化は +0.001、judged correctness は 1.6 point 低下した。著者らは、単一の小型 extractor と一つの benchmark を用いた結果であり、graph memory 一般ではなくこの extraction pipeline の評価だと範囲を限定している。

## why_relevant_to_games

長期の自動プレイテストや反復型 game agent が episode・失敗・発見を蓄積する際、構造化だけで原文を失う危険と、性能を大きく変えずに古い記録を間引く設計の両方を検討する材料になる。
