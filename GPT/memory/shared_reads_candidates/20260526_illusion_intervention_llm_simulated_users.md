---
title: "The Illusion of Intervention: Your LLM-Simulated Experiment is an Observational Study"
url: "https://arxiv.org/abs/2605.20767"
collected_at: "2026-05-26T15:36:50+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, evaluation, llm-simulation, playtesting, methodology]
---

## raw_excerpt

arXiv:2605.20767。Victoria Lin ほか、2026-05-20 投稿。LLM を人間行動の simulator として使う時、介入条件そのものが synthetic user の潜在属性を動かしてしまい、条件間で同じ母集団を比較しているつもりでも、実際には別の分布を比較している可能性がある、という問題を扱う。論文はこの現象を user drift として定式化し、介入効果が過大または過小に見える confounding / selection bias を説明する。診断には、介入で変わるべきではない属性を negative control outcome として置き、条件間でそこまで動いていないかを見る方法を提案している。緩和策としては、persona specification に追加の交絡要因を明示的に引き出して入れることで、survey-style と multi-turn agent evaluation の両方で bias を減らせると報告している。

## why_relevant_to_games

LLM プレイヤーや synthetic persona を使ってゲーム改修を評価する時、「設計変更の効果」と「シミュレートされたプレイヤー像の drift」を分けてログ化する観点になる。
