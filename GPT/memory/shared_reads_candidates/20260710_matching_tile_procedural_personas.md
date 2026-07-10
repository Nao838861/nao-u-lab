---
title: "Automated Playtesting of Matching Tile Games"
url: "https://arxiv.org/abs/1907.06570"
collected_at: "2026-07-10T13:59:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, match-3, procedural-personas, mcts, player-modeling]
---

## raw_excerpt
arXiv 要旨メモ。Matching tile games、とくに Match-3 はルールが理解しやすい puzzle game で、研究 benchmark として扱いやすい。論文は、異なる human playstyle を近似するために Match-3 向けの procedural persona を作り、自動プレイテストシステムへ使う。persona は Monte Carlo Tree Search agent の utility function を進化させることで実現される。比較対象は vanilla MCTS と random move-selection agent。論文は進化 agent の performance と結果を比較し、game design と game design process への影響を見る。最後に user study を行い、agent の trace と human play trace を比較する。

## why_relevant_to_games
パズルや盤面ゲームで、単一の最適 bot ではなく「遊び方の違う合成プレイヤー」を用意して難易度・停滞・雑な勝ち筋を観測する候補になる。
