---
title: "Human-Centric Reflective Architecture for Human-AI Collaborative Decision-Making"
url: "http://arxiv.org/abs/2607.03025v1"
collected_at: "2026-07-08T01:29:23.8841616+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [human-ai-collaboration, evaluation, decision-making, game-design, playtest]
evaluated_at: "2026-07-08T01:35:20+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-08T01:35:20+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-08T01:35:20+09:00"
next_action: revise_or_research
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  Human-AI 協調判断という問題設定は AI playtest の過信・不信に接続できるが、candidate 内の情報は framework の存在と一般的な狙いに留まる。
  反射的 architecture の具体構成、評価設計、既存手法との差分が不足しており、現状では CoopEval 水準の概要に必要な手法の中核を安定して書けない。
---

## raw_excerpt

The use of Large Language Models (LLMs) across diverse areas of human activity-ranging from everyday tasks to safety-critical applications-aims to enhance decision-making effectiveness with minimal human feedback. Concurrently, it seeks to align decisions with human expectations, preferences, and needs while mitigating risks associated with AI non-determinism. However, humans frequently over- or under-rely on AI recommendations, and current AI systems remain poorly calibrated to human expectations. To address these challenges, we introduce a human-AI collaborative decision-making framework designed to augment human capabilities and align AI assistance with human judgment.

出典メモ: `memory/raw/web_research/results.jsonl` fetched_at 2026-07-08T01:21:02 / query `LLM game design player evaluation` / arXiv:2607.03025v1 / published 2026-07-03T07:12:44Z。

## why_relevant_to_games

AI playtest や制作支援で、人間が AI の提案に過信・不信を起こす場面の設計材料になる。プレイヤー評価やレビュー支援を「最終提案」ではなく、人間判断を補助する反射的な協調ループとして扱う候補。
