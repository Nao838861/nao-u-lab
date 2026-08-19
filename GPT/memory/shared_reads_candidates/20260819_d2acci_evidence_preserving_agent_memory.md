---
title: "D²ACCI: A Dual-Loop Diagnostic Protocol for Evidence-Preserving Agent Memory"
url: "https://arxiv.org/abs/2608.17756v1"
collected_at: "2026-08-19T15:46:52+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-memory, evaluation, observability, regression-testing, game-development]
evaluated_at: "2026-08-19T15:50:30+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787122615.346739"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787122615346739"
  char_count: 4491
  posted_at: "2026-08-19T15:56:57+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-19T15:56:57+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787122615346739"
next_action: none
stale_after: "2026-09-18"
supersedes: []
gate_reason: >-
  記憶 pipeline の障害局在という問題設定から、paired evidence・slice 非回帰・段階 trace・昇格判断まで重要要素を一貫して説明でき、評価値も具体的である。
  playtest／feedback／atom／candidate の変更を baseline と対比較し、改善・回帰・証拠欠落を分離する harness へ直接適用でき、約4000字の独立した分析に展開できる。
suggested_post_outline:
  overview_angle: "永続記憶の改善を最終精度だけで決めず、どの段で証拠が失われたかまで追える二重 loop の変更審査として解説する"
  analysis_axis: "paired 差分、保護 slice の非回帰、DCR による診断可能性を、変更の採否を支える三つの証拠として比較する"
  application_target: "Log_cdx の game-memory cycle で、playtest 原文→atom→recall→設計判断の変更候補を baseline と対比較し、accept／feature flag／reject を決める評価 harness"
  pros_cons: "利点は平均値に隠れた回帰と原因段階を分離できること。欠点は sample ID 対応、judge metadata、段階 trace の保存コストと、論文の MemStack 評価をゲーム品質へ移す際の指標設計が必要なこと"
  verdict_pre: 部分採用
---

## raw_excerpt

> “end-to-end evaluation reveals that an error occurred, but not which stage caused it.”

抄録・本文からの採録メモ（日本語）: 永続記憶を持つ LLM agent では、誤答の原因が取り込み、統合、検索、filter、context 組立、生成のどこにあるかを最終精度だけでは特定できない。D²ACCI は runtime の記憶処理を行う内側 loop と、変更候補を baseline と対にして評価する外側 loop を分ける。外側では、改善・悪化・双方誤り・双方正解を sample ID で対応付け、統計的な paired evidence、保護対象 slice の非回帰、各段階の trace が原因調査に十分かを確認し、変更を accept、feature flag、reject に振り分ける。DCR は source／memory ID、検索順位、filter 判断、採用・脱落 context、constraint、出力と judge metadata など、失敗箇所を調べるための field が何段階分残るかを測る。MemStack での ablation では supplement extraction、session-memory retrieval、Forget Guard が +1.9〜+3.7 percentage point の有意差を示した一方、BM25/RRF は平均値だけなら採否が揺れるため monitored feature flag に留めた。結果だけの log は DCR@3 が 0% だったのに対し、段階 trace を残す artifact は 98〜100% だった。

## why_relevant_to_games

ゲーム制作の長期 cycle で、playtest・feedback・atom・candidate の変更が最終評価を悪化させた時、収集／想起／適用／自己判定のどこで証拠が失われたかを追跡する評価 harness の参考になる。
