---
title: "Agent Island: A Saturation- and Contamination-Resistant Benchmark from Multiagent Games"
url: "https://arxiv.org/abs/2605.04312"
collected_at: "2026-05-27T00:23:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, game-benchmark, persuasion, social-dynamics, contamination-resistant-eval]
---

## raw_excerpt
arXiv 2026-05 投稿の multiagent game benchmark。静的 benchmark は saturation と contamination に弱く、能力変化を追いにくいという問題から、language-model agents が cooperation、conflict、persuasion を含む multiplayer simulation environment で競う Agent Island を提案している。公開サイトによると、各 game は匿名化された 7 AI players で構成され、最初の 5 round では private conference、pitch、vote によって player を eliminate し、final round では残った player が pitch して eliminated players が winner を選ぶ。skill 推定には Bayesian Plackett-Luce model と Gibbs sampling を使い、不確実性を credible interval で扱う。論文要旨では、999 games / 49 unique models の結果や、final-round vote に同一 provider preference が見られた例が示され、game logs も behavior analysis 用 dataset として公開されている。

## why_relevant_to_games
ゲームを agent 評価の道具にするだけでなく、交渉・投票・脱落・最終審査という social mechanics を benchmark design に組み込む例。敵 AI や評価 AI の「勝ち方」だけでなく、投票・説得・裏切りを持つ小型ゲーム設計の参照になる。
