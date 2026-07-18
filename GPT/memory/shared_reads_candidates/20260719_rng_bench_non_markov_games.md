---
title: "Beyond the Current Observation: Evaluating Multimodal Large Language Models in Controllable Non-Markov Games"
url: "https://arxiv.org/abs/2606.19338"
collected_at: "2026-07-19T05:44:56+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent-evaluation, multimodal, memory, benchmark]
---

## raw_excerpt

原論文要旨からの採取メモ。閉ループ方策として動くマルチモーダル基盤モデルには、現在は見えていない過去の観測に基づいて行動する能力が必要になる。既存ベンチマークは完全状態を公開したり、隠れ状態の再構成を他の能力と混同したり、エピソード終了後の想起だけを測ったりするため、この能力を単独で測りにくい。RNG-Bench（Reconstructive Non-Markov Games）は、過去の観測を再構成しながら多段階に行動する能力を、Matching Pairs と 3D Maze の二つのゲームで評価する。難度軸はグリッドサイズ、視覚パターン、観測モダリティの三つ。個体差を抑える head-to-head duel と、忘却を不適切な行動選択から分離する Memory Gap 指標も導入する。最難条件は約128Kトークン、1エピソード約350画像に達し、現行の先端MLLMでも飽和していない。残差誤りの多くは行動選択より過去観測の忘却に由来すると報告される。

## why_relevant_to_games

AIテストプレイヤーの失敗を「見落とし・忘却」と「方策選択」に分けて測る評価設計や、部分観測ゲームのテスト用ミニゲーム設計に使える。
