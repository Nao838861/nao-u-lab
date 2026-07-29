---
title: "Engine-Equal, Human-Unequal: A Reproducible Outcome Skew in Engine-Assessed Equal Chess Positions"
url: "https://arxiv.org/abs/2607.25655"
collected_at: "2026-07-29T19:32:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-modeling, difficulty, evaluation, chess, telemetry]
---

## raw_excerpt

arXiv 抄録・書誌情報からの抽出メモ。Stockfish 18 が評価値 0 付近（±10 centipawn 以内、探索 depth を変えても安定）と判定し、かつ実際に人間が到達した chess opening position 1,661 件、Lichess 2025年10月の計1,610万回の出現を対象にする。各 position について、対局者 rating から予測される結果と実際の結果との差を outcome skew として測定した。engine 上は互角でも、White または Black のどちらかに人間の結果が安定して偏る position があり、その方向は player account を分割した集合、時期、rating 帯の三方式で再現し、8か月後の別月にも再現した。account 分割で一方の測定が他方を予測する replication slope は全体で 0.69、出現数が多く測定精度の高い position では 0.94。skew の中央値は White score 約2 percentage points 相当と小さいが、position ごとに再現し、不利側は考慮時間も長かった。engine evaluation の閾値、探索深度、calibration、出現頻度を厳しくしても現象は残る。研究は観察的分析であり、因果関係は事前登録済みの無作為化 companion study に委ねる。

## why_relevant_to_games

自動 agent の勝率・評価値だけでは人間にとっての実戦難度や認知負荷を表せない例であり、level / encounter の headless 評価と人間 telemetry を照合する場面に使える。
