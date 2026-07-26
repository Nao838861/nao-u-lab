---
title: "Balanced Game Design"
url: "https://ssrn.com/abstract=7001878"
collected_at: "2026-07-27T00:17:37.3285429+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-balance, asymmetric-games, optimization, mixed-integer-programming]
---

## raw_excerpt

SSRN に 2026-07-17 掲載された Xinyi Guan / Xiao Lei の 55 ページの working paper。非対称な character・role・ability を持つ二人零和ゲームで、designer が pairwise win rate を決める attribute を調整し、その結果として生じる Nash equilibrium の option 選択確率を均等に近づける問題を扱う。短い原文断片では、選択肢数が偶数の時は “Perfect balance is impossible” とし、奇数の場合は一定条件下で near-balanced design が高確率に存在する条件を示す。また balanced design problem は NP-hard で、counter relationship を持たない制限クラスでも fully polynomial-time approximation scheme が存在しないと述べる。

元の定式化は logistic constraint と bilinear term を含む mixed-integer nonlinear program になるため、実行可能な win-rate matrix と perfectly balanced matrix 集合との距離を最小化する近似 mixed-integer programming（MIP）へ置き換え、探索を補助する solver augmentation を加える。枠組みは大規模 instance、別の win-rate model、複数 scenario にも拡張される。計算実験には AI-simulated data を用いた実ゲームの case study が含まれ、標準的手法より均衡に近い design を生成したと要旨は報告している。ここで balance は各 matchup の勝率を一律 50% にすることではなく、戦略選択の equilibrium distribution が特定 option に偏りすぎない状態として定義されている。

## why_relevant_to_games

非対称 option の balance を個別勝率の横並びではなく、counter 関係を含む選択分布として扱うため、対戦 prototype の parameter 調整と AI self-play 結果の読み方に接続できる。
