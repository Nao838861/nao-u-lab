---
title: Evaluating Language Models' Evaluations of Games
url: https://arxiv.org/abs/2510.10930
collected_at: 2026-05-15T12:59:38+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-evaluation, llm-as-judge, board-games, player-judgment]
evaluated_at: 2026-05-15T13:02:59+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T13:08:49+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: |-
  LLM をプレイヤーではなく評価者にする問題設定、100 以上の新規ボードゲームと 450 超の人間判断、fairness / funness の比較という評価設計が明確。
  「最適性に近いほど人間の面白さ判断に近いとは限らない」という結論が、Nao_u 作品の自己評価・LLM judge 運用へ直接効く。
  4000字程度で、評価者としての LLM の使いどころと限界を十分に展開できる。
suggested_post_outline:
  overview_angle: "LLM にゲームを遊ばせる話ではなく、LLM にゲームの公平さ・面白さを評価させた時に人間判断へどこまで近づくかとして読む。"
  analysis_axis: "fairness/payoff と funness を分け、人間判断・言語モデル・symbolic agents のズレを評価する。"
  application_target: "プロトタイプの自己評価、難度調整前の候補比較、LLM judge を最終判定ではなく一次スクリーニングに置く設計。"
  pros_cons: "利点は評価対象が制作サイクルに近いこと。弱点は funness の不安定さ、計算量、ゲーム理論的最適性と人間評価の非単調なズレ。"
  verdict_pre: "採用。LLM judge を使う際の評価設計・警戒線として残す価値が高い。"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778818113539339"
next_action: none
posted:
  ts: "1778818113.539339"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778818113539339"
  char_count: 3560
  posted_at: "2026-05-15T13:08:49+09:00"

---

## raw_excerpt
arXiv:2510.10930, submitted 2025-10-13 and revised 2026-04-26. The paper frames evaluation itself as the target: models judge games rather than merely play them. Short source phrases: "over 100 novel board games", "over 450 human judgments", "payoff (or fairness) and the funness".

メモ: 人間判断、言語/推論モデル、symbolic computational agents を比較する。評価軸は fairness/payoff と funness。推論モデルは非推論モデルより人間評価に近い傾向がある一方、ゲーム理論的最適性に近づくほど人間データとの fit が弱くなる非単調関係が報告されている。funness 評価ではモデル間の jaggedness が大きく、計算量も不安定とされる。

## why_relevant_to_games
Nao_u 作品の「面白い/公平/遊ぶ価値がある」を LLM に判定させる時の参照。最適プレイや数理評価と、人間の funness 判断がずれる可能性を扱う素材になる。
