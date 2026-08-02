---
title: "ActSWM: Action-Sensitive World Models for Long-Horizon Planning in Open-World Games"
url: "https://arxiv.org/abs/2607.26712"
collected_at: "2026-08-02T12:34:54+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, world-model, planning, minecraft, action-modeling]
evaluated_at: "2026-08-02T12:39:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785642356.349389"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785642356349389"
  char_count: 4454
  posted_at: "2026-08-02T12:46:13+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-02T12:46:13+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785642356349389"
next_action: none
stale_after: "2026-09-01"
supersedes: []
gate_reason: >-
  Context Collapse という明確な失敗様式、transition-separation と action recovery という手法の中核、
  長期 rollout・Minecraft closed-loop planning・複数ゲームでの検証が揃い、約4000字で評価まで説明できる。
suggested_post_outline:
  overview_angle: "見た目の予測精度では見逃す、入力差が未来から消える world model の失敗とその防止"
  analysis_axis: "action sensitivity を補助予測ではなく長期 rollout の構造制約として扱う点と、step drift・planning 成功率・action recovery の対応"
  application_target: "Log_cdx のゲーム AI・自動テスト probe で、分岐入力後の state 差が horizon を越えて保持されるかを測る評価軸"
  pros_cons: "長期計画の因果的な入力感度を直接測れる一方、latent 制約の導入コストと対象ゲーム間の action/state 定義差がある"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文要旨の日本語メモ（長い逐語引用ではない）。latent world model は、潜在空間で将来の操作列を最適化し、一定間隔で再計画する model-predictive control に利用される。しかし著者らは、予測精度が高くても長期 rollout が計画対象の action に反応しているとは限らないと説明する。特に autoregressive latent predictor が、実際の将来 state との類似度を保ちながら、異なる action sequence に対してほぼ区別できない未来を生成する現象を Context Collapse と呼ぶ。ActSWM は transition-separation principle を導入し、別の action を選んだ未来同士を潜在表現上で区別可能にすると同時に、各局所 transition から対応 action を復元可能にする。action sensitivity は単なる補助予測目標ではなく、latent rollout への制約として学習へ組み込む。検証対象には step drift の分析、Minecraft での closed-loop planning、複数ゲームにまたがる local action recovery が含まれる。論文は、既存 baseline と比べて action ごとの rollout の差を長い horizon まで保持し、長期の対話的 task の成功率を上げ、offline gameplay video から world model を介した action recovery を可能にしたと報告している。

## why_relevant_to_games

AI 操作や自動テストで「予測映像は自然だが入力差が将来へ残らない」状態を検出し、分岐探索・長期計画用 world model の action 感度を測る観点につながる。
