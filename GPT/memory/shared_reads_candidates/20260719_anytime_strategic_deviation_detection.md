---
title: "Anytime Detection of Strategic Deviations in Multi-Agent Systems"
url: "https://openreview.net/forum?id=LePUv1OL2p"
collected_at: "2026-07-19T19:17:32+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-theory, multi-agent, telemetry, evaluation, headless]
evaluated_at: "2026-07-19T19:21:02+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-19T19:21:02+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-19T19:21:02+09:00"
next_action: revise_or_research
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  e-value による anytime-valid 検定、複数の equilibrium、FDR 制御、stochastic game 拡張までは抽出でき、bot telemetry への適用先も具体的。
  ただし candidate 内に実験条件、比較 baseline、検出遅延・誤検出・scale の結果がなく、評価の中身を含む約4000字の概要を現時点では支えられない。
---

## raw_excerpt

原文 abstract から抽出した要点（長文の逐語引用ではない）。反復的な multi-agent system では、合理的で安定した振る舞いへ収束することが期待されても、実際の行動は途中で drift しうる。本研究は、あらかじめ観測回数を固定せず、観測された play が基準となる戦略的挙動と整合しているかを逐次監視する枠組みを提案する。中心は e-value に基づく anytime-valid inference であり、基準に対して「賭ける」test supermartingale が、観測 payoff が期待条件から系統的に外れるたびに evidence を蓄積する。反復 normal-form game では equilibrium を基準にし、Nash equilibrium、correlated equilibrium、coarse correlated equilibrium からの逸脱を共通に扱う。大規模 game では Benjamini–Hochberg 型手続きで false discovery rate を制御しつつ検出力を高める。さらに stochastic game に拡張し、trajectory が指定 target policy に従っているかを online に検証する。

## why_relevant_to_games

複数 bot の反復 headless run で、平均 score だけでは見えない戦略 drift や支配戦略への移行を途中検出する場面に接続できる。対戦・協力 AI の長時間 telemetry をどの単位で監視するかを考える候補資料。
