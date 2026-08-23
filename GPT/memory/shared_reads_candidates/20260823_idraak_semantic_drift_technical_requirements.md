---
title: "IDRAAK: From Multi-Agent NLP to Few-Shot Prompting for Semantic Drift Detection in Technical Requirements"
url: "https://arxiv.org/abs/2608.08801v1"
collected_at: "2026-08-23T16:15:20+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm, semantic-drift, requirements, evaluation, multi-agent, game-development]
evaluated_at: "2026-08-23T16:37:14+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-23T16:37:14+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-23T16:37:14+09:00"
next_action: revise_or_research
stale_after: "2026-09-22"
supersedes: []
gate_reason: >-
  問題設定、複数 dataset、主要 metric、単純な few-shot が agentic workflow を上回る結論は強く、
  ゲーム仕様の数値・否定・義務条件の受け渡し検査へ具体的に接続できる。
  ただし現 candidate は要旨依存で、SRR の生成・比較規則と6 workflow の差を説明できないため、一次資料読解まで保留する。
---

## raw_excerpt

一次資料の要旨からの抽出メモ（日本語）: 技術要件を言語間で翻訳すると、数値制約、肯定・否定の極性、義務・許可などのモダリティ、その他の仕様上重要な意味が変化する semantic drift が起こり得る。IDRAAK は、言語に依存しない Semantic Requirement Representation（SRR）を用いてこのずれを検出する解釈可能な枠組みで、決定論的比較、multi-agent verification、few-shot prompting まで6種類のworkflowを比較する。10の工学分野から集めた300要件へ890件の合成摂動を加えた評価では、6件のfew-shot例を与える単一LLM callが MCC 0.888、F1 0.983を記録した。追加評価は PAWS-X 805組・5言語とXNLI 700組・7言語で行われ、決定論的SRR比較は技術要件ではF1 0.898だった一方、一般文ではF1 0.012だった。構造化された証拠は敵対的paraphraseで補完的に働き、post-hoc Platt scalingはconfidence calibrationを改善した。要旨の結論は “increased agentic complexity does not necessarily improve semantic-drift detection” で、単純なfew-shot promptingが強く効率的な代替になり得るとする。

## why_relevant_to_games

ゲーム仕様、難度条件、headless合格条件を日本語・英語や複数AIの間で受け渡す際に、数値・否定・必須条件が変質していないかを検査する方法の候補になる。仕様書から実装・テスト条件へ変換する工程で参照できる。
