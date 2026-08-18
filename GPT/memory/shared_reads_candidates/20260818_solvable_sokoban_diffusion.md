---
title: "Solvable Sokoban Without a Solver via Diffusion"
url: "https://arxiv.org/abs/2608.15958"
collected_at: "2026-08-18T17:02:12+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, puzzle, procedural-content-generation, diffusion-model, level-design]
---

## raw_excerpt

> "Solvability is also a fragile property, since even a single misplaced wall can silently render an entire puzzle unsolvable."

arXiv abstract からの取得時要点（逐語引用は上記1文のみ）: Sokoban の可解性判定は PSPACE-complete で、解が指数的に長くなり得るうえ、壁を1枚ずらすだけでも盤面全体が解けなくなる。研究は solver、reward、可解性 label を与えず、tile completion だけで学習した transformer-based discrete diffusion model を用いる。生成盤面の 77.4% が可解で、残る失敗の 94.5% も壁を1枚除くと可解になったと報告する。自己回帰生成が固定順序の prefix に条件付けるのに対し、masked diffusion は任意位置の既配置 tile 集合を条件に cell を埋められるため、盤面の離れた位置同士が制約し合う puzzle 構造と対応する、という説明が置かれている。学習 pipeline は MD4 を基にし、dataset は DeepMind の Boxoban を使う。model と生成手順も公開されている。

## why_relevant_to_games

パズル level の「見た目の局所妥当性」と「実際に解けるという大域制約」をどう両立するかを扱っており、PCG の生成順序・検証器・失敗盤面の最小修復を検討する場面に接続できる。
