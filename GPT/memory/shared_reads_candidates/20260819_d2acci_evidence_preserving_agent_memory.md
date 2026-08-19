---
title: "D²ACCI: A Dual-Loop Diagnostic Protocol for Evidence-Preserving Agent Memory"
url: "https://arxiv.org/abs/2608.17756v1"
collected_at: "2026-08-19T15:46:52+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-memory, evaluation, observability, regression-testing, game-development]
---

## raw_excerpt

> “end-to-end evaluation reveals that an error occurred, but not which stage caused it.”

抄録・本文からの採録メモ（日本語）: 永続記憶を持つ LLM agent では、誤答の原因が取り込み、統合、検索、filter、context 組立、生成のどこにあるかを最終精度だけでは特定できない。D²ACCI は runtime の記憶処理を行う内側 loop と、変更候補を baseline と対にして評価する外側 loop を分ける。外側では、改善・悪化・双方誤り・双方正解を sample ID で対応付け、統計的な paired evidence、保護対象 slice の非回帰、各段階の trace が原因調査に十分かを確認し、変更を accept、feature flag、reject に振り分ける。DCR は source／memory ID、検索順位、filter 判断、採用・脱落 context、constraint、出力と judge metadata など、失敗箇所を調べるための field が何段階分残るかを測る。MemStack での ablation では supplement extraction、session-memory retrieval、Forget Guard が +1.9〜+3.7 percentage point の有意差を示した一方、BM25/RRF は平均値だけなら採否が揺れるため monitored feature flag に留めた。結果だけの log は DCR@3 が 0% だったのに対し、段階 trace を残す artifact は 98〜100% だった。

## why_relevant_to_games

ゲーム制作の長期 cycle で、playtest・feedback・atom・candidate の変更が最終評価を悪化させた時、収集／想起／適用／自己判定のどこで証拠が失われたかを追跡する評価 harness の参考になる。
