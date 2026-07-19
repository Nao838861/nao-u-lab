---
title: "ArchEval: Measuring AI Agents as Computer Architects"
url: "https://arxiv.org/abs/2607.03601"
collected_at: "2026-07-19T10:31:55.6071157+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, harness, simulation, game-testing, optimization]
evaluated_at: "2026-07-19T10:36:51+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1784425463.441119"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784425463441119"
  char_count: 4500
  posted_at: "2026-07-19T10:44:44.3818292+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-19T10:44:44.3818292+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784425463441119"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: >
  設計 agent の能力を、20 challenge・8 simulator・三段階の feedback 条件と trajectory 指標で分解しており、問題設定から実験結果まで具体的に説明できる。
  headless playtest や自動バランス調整で「simulator がある時だけ成功する agent」を見分ける評価へ直接適用でき、CoopEval 水準の概要と独自分析を組み立てられる。
suggested_post_outline:
  overview_angle: "AI agent の最終 score ではなく、設計過程・simulator feedback 依存・提出 artifact の完全性まで測る benchmark として説明する"
  analysis_axis: "L1/L2/L3 の支援条件、20 challenge と 8 simulator、baseline 正規化性能と trajectory 指標、feedback を外した時の崩れ方を対応づける"
  application_target: "ゲームの headless playtest、自動バランス調整、生成 prototype 評価で、実行 feedback あり／なしの性能差と制約違反・artifact 欠損を記録する harness"
  pros_cons: "メリットは成功値と設計能力を分離できる点。デメリットは computer architecture 用 simulator の構造をゲームへ移植する設計コストと、challenge 固有 baseline への依存。"
  verdict_pre: "部分採用"
---

## raw_excerpt

論文は、LLM agent によるコンピュータアーキテクチャ設計を、単なるコード生成やパラメータ調整ではなく、workload の解釈、機構選択、simulator 利用、性能予測、制約充足、評価対象の選別を含む一連の設計行為として測る ArchEval を提示する。CPU core、system architecture、memory、accelerator、compute-in-memory にまたがる 20 challenge と 8 simulator を用意し、反復的な simulator feedback を与える L1、simulator source だけを渡して workflow を組ませる L2、実行 feedback なしで提出させる L3 の三条件を比較する。各 run は baseline 正規化性能だけでなく、workload 分析、tool 利用、予測、constraint handling、artifact integrity を含む trajectory を記録する。初期結果では L1 なら評価した 4 agent が baseline 以上だが、support を外すと実験構成と事前予測が崩れ、L3 では GPT-5.5 + Codex だけが baseline を上回った一方、同 agent の performance-modeling pass rate も 15% に留まった。

## why_relevant_to_games

ゲームの headless playtest や自動バランス調整で、simulator 付き成功と feedback なしの設計判断を分離し、最終 score だけでなく trajectory・制約・artifact 完全性まで記録する評価設計の素材になる。
