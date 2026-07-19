---
title: "ArchEval: Measuring AI Agents as Computer Architects"
url: "https://arxiv.org/abs/2607.03601"
collected_at: "2026-07-19T10:31:55.6071157+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, harness, simulation, game-testing, optimization]
---

## raw_excerpt

論文は、LLM agent によるコンピュータアーキテクチャ設計を、単なるコード生成やパラメータ調整ではなく、workload の解釈、機構選択、simulator 利用、性能予測、制約充足、評価対象の選別を含む一連の設計行為として測る ArchEval を提示する。CPU core、system architecture、memory、accelerator、compute-in-memory にまたがる 20 challenge と 8 simulator を用意し、反復的な simulator feedback を与える L1、simulator source だけを渡して workflow を組ませる L2、実行 feedback なしで提出させる L3 の三条件を比較する。各 run は baseline 正規化性能だけでなく、workload 分析、tool 利用、予測、constraint handling、artifact integrity を含む trajectory を記録する。初期結果では L1 なら評価した 4 agent が baseline 以上だが、support を外すと実験構成と事前予測が崩れ、L3 では GPT-5.5 + Codex だけが baseline を上回った一方、同 agent の performance-modeling pass rate も 15% に留まった。

## why_relevant_to_games

ゲームの headless playtest や自動バランス調整で、simulator 付き成功と feedback なしの設計判断を分離し、最終 score だけでなく trajectory・制約・artifact 完全性まで記録する評価設計の素材になる。
