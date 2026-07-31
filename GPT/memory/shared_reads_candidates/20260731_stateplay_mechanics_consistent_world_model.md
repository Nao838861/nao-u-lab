---
title: "StatePlay: State-Aware Game World Models for Mechanics-Consistent Generation"
url: "https://arxiv.org/abs/2607.26754"
collected_at: "2026-07-31T23:46:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, world-model, game-mechanics, state-modeling, generative-ai]
evaluated_at: "2026-07-31T23:49:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-31T23:49:54+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-31T23:49:54+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-30"
supersedes: []
gate_reason: >-
  問題設定、state/visual 二枝の中核構成、state-critical なデータ配分、四軸評価、定量結論まで一次資料由来の重要要素を抽出できる。
  生成型 prototype や自動 playtest で、見た目の自然さと engine state に基づくルール整合性を分離して測る具体的な適用へ接続でき、約4000字の独立分析を構成できる。
suggested_post_outline:
  overview_angle: "映像として自然でもゲームの内部ルールを破る world model に対し、明示的 state prediction を結合して mechanics fidelity を測る設計として解説する"
  analysis_axis: "visual/state branch の分離と joint attention、state-critical sample の配分、visual quality と mechanics fidelity を分離した評価設計の因果を検討する"
  application_target: "Log_cdx の生成型 game prototype と自動 playtest で、health・resource・timer・termination の engine state trace を映像評価と別の合否軸にする"
  pros_cons: "内部状態を監査可能にして見た目だけの成功を排除できる一方、単一格闘ゲーム・短尺 clip・既知 state schema への依存が強く、長期因果や未知 mechanics への一般化は未確認"
  verdict_pre: "部分採用。state trace と mechanics-critical sampling の評価設計を採り、モデル構成そのものは生成型 prototype を使う場合に限定する"
---

## raw_excerpt

arXiv:2607.26754v1、2026-07-29 submitted。StatePlay は、player action に応じて映像を生成する game world model が、見た目として自然でも health、skill meter、timer、game termination といった内部状態に基づく rule を破る問題を扱う。Street Fighter 3 から frame、action、timer、両 player の health と skill meter を同期取得し、5秒・20 FPS の clip に分割する。勝敗、super art 成功、meter 不足による失敗など state-critical な四分類を各10%、通常場面を60%として、10,000 clip の training set を構成する。model は 5B visual branch と 0.76B state branch を分け、joint attention で相互に参照させる Mixture-of-Transformers 形式を採る。visual 側は flow matching、state 側は Smooth L1 regression で学習し、player action は両 branch へ入力する。評価は visual quality、action control、state alignment、mechanics fidelity の四軸で、100 samples を各 mechanics category に均等配分する。論文は state prediction の平均 normalized L1 distance が 0.06 未満、明示的 state modeling を持たない最良 baseline より mechanics fidelity が18.6%向上したと報告する。

## why_relevant_to_games

生成映像の自然さと、health・resource・終端条件の rule 整合性を分けて検証する材料であり、生成型 prototype や自動 playtest で engine state を評価軸へ残す場面に接続できる。
