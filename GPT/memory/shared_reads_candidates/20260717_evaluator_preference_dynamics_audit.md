---
title: A Diagnostic Framework and Multi-Evaluator Audit of Evaluator-Driven Preference Dynamics in Self-Adapting LLM Agents
url: https://arxiv.org/abs/2606.29719v1
collected_at: 2026-07-17T01:05:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, evaluation, adaptive-agents, game-testing]
---

## raw_excerpt

自己適応する LLM agent を evaluator の選好信号で更新するとき、その測定結果が evaluator のモデルや版に強く依存し、短期間で妥当性を失う場合があるという報告。著者は Evaluator Preference Coupling（EPC）という診断枠組みを提示し、Multimodal Preference Collapse Index（MPCI）、evaluator ごとの coupling matrix、Jensen–Shannon divergence を組み合わせて、agent の変化と evaluator 固有の偏りが結び付いていないかを測る。8 条件、主実験 112 回と ablation 10 回の計 122 repetition を扱い、条件平均の coupling coefficient は 0.00 から 1.18 まで大きく変動した。4 条件では強い coupling が見られ、別の4条件ではほぼ消失したとされる。外部研究ログに保存された abstract は、proprietary evaluator の測定が数週間単位で無効化し得る事例と、その検出方法を主題としている。

## why_relevant_to_games

LLM にゲームの面白さ、プレイ品質、改修案を反復評価させる場合、評価器の版やモデル変更が「ゲームが改善した」という観測そのものを動かす可能性を検査する材料になる。
