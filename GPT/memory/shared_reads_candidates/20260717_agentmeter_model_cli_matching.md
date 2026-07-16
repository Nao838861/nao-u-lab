---
title: "AgentMeter: Evaluating Model-CLI Matching for CLI-Based Local Task-Solving Agents"
url: "https://arxiv.org/abs/2606.21140"
collected_at: "2026-07-17T06:20:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, evaluation, harness, game-testing, automation]
evaluated_at: "2026-07-17T06:35:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-17T06:35:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-17T06:35:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-16"
supersedes: []
gate_reason: >-
  model 単体評価では配備時の成功率と費用を説明できないという問題設定から、Core30 / Benchmark90、AMS、順位検証、結論まで重要要素を抽出できる。
  headless test・playtest agent を model と CLI harness の構成単位で比較する評価設計へ具体的に適用でき、約4000字で限界を含む独立分析を組み立てられる。
suggested_post_outline:
  overview_angle: "agent の能力を model 名ではなく model-CLI 構成という配備単位で測るための benchmark 設計"
  analysis_axis: "成功率・task effort・費用を統合する AMS と、低コスト Core30 が Benchmark90 の選択をどこまで保つか"
  application_target: "Log_cdx の headless game test / playtest agent で、model・観測形式・tool 接続・停止条件を一体の構成として比較する評価表"
  pros_cons: "少数 task で候補構成を絞り込める一方、一般 CLI task の順位がゲーム固有の操作感・探索・不具合検出能力へそのまま移る保証はない"
  verdict_pre: "部分採用。配備単位と cost-aware 比較は採用し、task tier と成功条件はゲーム制作向けに再設計する"
---

## raw_excerpt

arXiv:2606.21140、2026-06-19 投稿。LLM agent が code 編集、repository 調査、data analysis、file 操作などを行う際、実際の挙動は model 単体ではなく、prompt、context replay、tool output、file access、terminal observation、停止条件を仲介する CLI harness との組み合わせで決まる、と問題設定している。同じ model でも CLI が異なれば task success、token 使用量、cost profile が変わるため、model と CLI を分離して評価しない AGENTMETER benchmark を提案する。

評価セットは full validation の Benchmark90 と、24 通りの model-CLI 構成を比較する低コスト subset Core30。指標 AgentMeter Score (AMS) は task success を基点に、calibrated task-effort tier と cost を組み合わせる。Core30 では Pass/30、token/pass、billable USD/pass、AMS の各基準がそれぞれ別の構成を首位に選んだ。Benchmark90 での検証では Top-1 と Top-3 の集合が維持され、Core30 との順位相関も報告されている。原文の結論は “model-CLI configurations should be evaluated as the deployed unit.”

## why_relevant_to_games

AI によるゲームの headless test、playtest、prototype 編集を比較する時、model 名だけでなく観測提示・tool 接続・停止条件を含む harness 全体を評価単位にする観点へつながる。
