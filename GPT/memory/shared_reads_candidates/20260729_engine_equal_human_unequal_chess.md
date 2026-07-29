---
title: "Engine-Equal, Human-Unequal: A Reproducible Outcome Skew in Engine-Assessed Equal Chess Positions"
url: "https://arxiv.org/abs/2607.25655"
collected_at: "2026-07-29T19:32:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-modeling, difficulty, evaluation, chess, telemetry]
evaluated_at: "2026-07-29T19:38:48+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-29T19:45:59+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785321935890519"
posted:
  ts: "1785321935.890519"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785321935890519"
  char_count: 4320
  posted_at: "2026-07-29T19:45:59+09:00"
next_action: none
stale_after: "2026-08-28"
supersedes: []
gate_reason: |-
  1,661 position・1,610万出現を用いた問題設定、rating 補正、account・時期・rating 帯での再現、replication slope、考慮時間、robustness check、観察研究としての限界まで抽出できる。
  agent 評価と人間 telemetry の乖離を level / encounter の実戦難度校正へ直接写像でき、効果の小ささも含めて約4000字で具体的に分析できる。
suggested_post_outline:
  overview_angle: "engine が互角とする状態にも、人間には再現可能な結果偏差と認知負荷差が残ることを、大規模 telemetry と複数の replication で示した構成を軸にする"
  analysis_axis: "平均的には約2 percentage points と小さい skew を、position 固有の再現可能な測定対象として扱う意義と、観察研究から因果を言い過ぎない境界を分析する"
  application_target: "Log_cdx の level / encounter 自動評価で、agent 勝率だけで合格にせず、人間の成功率・所要時間・入力停滞・再試行を状態単位で照合する校正手順"
  pros_cons: "大量 telemetry と分割再現で微小な系統差を拾える一方、chess 固有の rating 基盤、観察データ、統計的有意差と体感上の重要差の混同が制約"
  verdict_pre: "部分採用。headless evaluator の代替ではなく、人間 telemetry との不一致を探索する二層評価として採用"
---

## raw_excerpt

arXiv 抄録・書誌情報からの抽出メモ。Stockfish 18 が評価値 0 付近（±10 centipawn 以内、探索 depth を変えても安定）と判定し、かつ実際に人間が到達した chess opening position 1,661 件、Lichess 2025年10月の計1,610万回の出現を対象にする。各 position について、対局者 rating から予測される結果と実際の結果との差を outcome skew として測定した。engine 上は互角でも、White または Black のどちらかに人間の結果が安定して偏る position があり、その方向は player account を分割した集合、時期、rating 帯の三方式で再現し、8か月後の別月にも再現した。account 分割で一方の測定が他方を予測する replication slope は全体で 0.69、出現数が多く測定精度の高い position では 0.94。skew の中央値は White score 約2 percentage points 相当と小さいが、position ごとに再現し、不利側は考慮時間も長かった。engine evaluation の閾値、探索深度、calibration、出現頻度を厳しくしても現象は残る。研究は観察的分析であり、因果関係は事前登録済みの無作為化 companion study に委ねる。

## why_relevant_to_games

自動 agent の勝率・評価値だけでは人間にとっての実戦難度や認知負荷を表せない例であり、level / encounter の headless 評価と人間 telemetry を照合する場面に使える。
