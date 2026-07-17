---
title: "Towards Action Model Learning for Player Modeling"
url: "https://arxiv.org/abs/2103.05682"
collected_at: "2026-07-17T10:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-modeling, playtrace, mechanics, puzzle, evaluation]
---

## raw_excerpt

著作権に配慮し、arXiv 要旨の長文引用ではなく収集時点の要点を記す。Abhijeet Krishnan、Aaron Williams、Chris Martens による研究で、ゲーム内の player behavior を近似する player model を、個別ゲーム固有の domain knowledge に強く依存せず作る方法を扱う。既存の player modeling は別ゲームへ移しにくく、プレイヤーが mechanics についてどのような mental model を作り、修正しているかを説明しにくいという問題を置く。提案では play trace から action model を学習する Action Model Learning（AML）を player modeling に用い、そのモデルからプレイヤーがゲーム mechanics をどの程度理解しているかを定量推定する。既存 AML algorithm の FAMA を評価するとともに、player cognition に着想を得た Blackout という algorithm を提示する。puzzle game の Sokoban を対象に両者を比較し、Blackout がより良い player model を生成したと報告する。論文は AAAI Conference on Artificial Intelligence and Interactive Digital Entertainment 2020 掲載、arXiv には 2021-03-09 提出。

## why_relevant_to_games

プレイ軌跡を成功率だけで採点せず、「プレイヤーが mechanics をどう理解しているか」の推定へ変換するため、パズル設計、チュートリアル評価、headless playtest のログ設計に接続しうる。
