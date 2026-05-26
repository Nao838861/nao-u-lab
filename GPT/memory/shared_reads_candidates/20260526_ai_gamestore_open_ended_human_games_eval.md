---
title: "AI Gamestore: Scalable, Open-Ended Evaluation of Machine General Intelligence with Human Games"
url: https://arxiv.org/abs/2602.17594
collected_at: 2026-05-26T19:52:28+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-evaluation, vlm, benchmark, human-games, agent-play]
---

## raw_excerpt
arXiv 2602.17594。Lance Ying ほかによる、人間向けゲームを使った open-ended な AI 評価基盤の提案。

要点メモ:
- 従来の AI benchmark は狭い能力を静的に測り、モデル側の最適化で飽和しやすい、という問題設定。
- 著者らは、AI を human-like general intelligence の観点で見るには、人間が人間のために設計した広範なゲームを、同じ経験量・時間・資源条件でどう遊び学ぶかを見るのが有望だとする。
- AI GameStore は、LLM と humans-in-the-loop を使い、既存の digital gaming platforms から standardized / containerized variants を sourcing and adapting して、新しい representative human games を合成する platform。
- proof of concept では Apple App Store と Steam の top charts を元に 100 ゲームを生成し、7 つの frontier VLM を短い play episode で評価した。
- best models でも多くのゲームで human average score の 10% 未満に留まり、world-model learning、memory、planning が必要なゲームで特に苦戦した、と報告している。

## why_relevant_to_games
自作ゲームの headless / VLM / bot 評価を、単一スコアではなく「世界モデル・記憶・計画を要求する短時間プレイ課題」として設計する観点に使える。
