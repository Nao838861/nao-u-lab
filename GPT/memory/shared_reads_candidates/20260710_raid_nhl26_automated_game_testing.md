---
title: "Reward-Adaptive Iterative Discovery: A Case Study on Automated Game Testing for NHL26"
url: "https://arxiv.org/abs/2607.07498"
collected_at: "2026-07-10T09:59:51.8262829+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, automated-playtesting, reinforcement-learning, exploit-discovery, sports-game]
---

## raw_excerpt

arXiv:2607.07498。2026-07-08 submitted。EA SPORTS NHL 26 の開発版を題材にした automated game testing の case study。対象は goalie AI の behavioral exploit 探索で、人間の playtester が修正ごとに長時間かけて再テストしている負荷を下げることを問題設定にしている。提案手法は Reward-Adaptive Iterative Discovery (RAID)。既存の RL は exploit を見つけられても単一解に overfit しやすいので、goal scoring agent population を反復的に訓練しつつ、複数の diverse high-quality scoring strategy を見つける方向に拡張している。

初回 deployment では、単一実験内で 6 種類の hockey scoring exploit strategy を見つけたとされる。これらは、人間 playtester が hours-long manual testing sessions で見つけたものと質的に似ていた。出典ページでは Reinforcement Learning Conference の Reinforcement Learning and Video Games Workshop 2026 向け論文として記載されている。

## why_relevant_to_games

Nao_u_BOT の headless 評価で「勝てる route」だけでなく「壊れた exploit policy」を探す方向に直結する。単一最適 bot ではなく、複数の悪用戦略を発見する testing population として使える。
