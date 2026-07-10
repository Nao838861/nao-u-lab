---
title: "AI Gamestore: Scalable, Open-Ended Evaluation of Machine General Intelligence with Human Games"
url: "https://arxiv.org/abs/2602.17594"
collected_at: "2026-07-11T08:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-player, evaluation, benchmark, game-generation, vlm]
---

## raw_excerpt

従来のAIベンチマークは限られた能力を静的な課題で測ることが多く、開発側が課題へ最適化すると飽和しやすい。本論文は、人間が人間のために設計した「あらゆる人間のゲーム」を、同程度の経験・時間・資源を与えた人間とAIに遊ばせ、学習とプレイの両面を比較する構想を提示する。その第一歩として、一般的なデジタルゲーム配信基盤からゲーム環境を取得し、標準化・コンテナ化した派生ゲームをLLMとhuman-in-the-loopで合成する、拡張可能でオープンエンドな AI GameStore を導入した。

概念実証では Apple App Store と Steam の人気チャートを基に100ゲームを生成し、7種類の最先端VLMを短いプレイエピソードで評価した。最良モデルでも大半のゲームで人間平均スコアの10%未満にとどまり、特に世界モデルの学習、記憶、計画を要求するゲームで苦戦したと報告する。固定された少数課題ではなく、新しいゲームを継続的に供給することで、課題固有の最適化を避けながら汎用的なゲームプレイ能力を測る方向を示している。

## why_relevant_to_games

ゲーム試作を単一のbot成績だけで測らず、異なるルール・観測・記憶・計画要求を持つゲーム集合と人間基準で評価する際の参考になる。AIテストプレイヤーが苦手とする設計要素を切り分ける評価セット作りにも接続できる。
