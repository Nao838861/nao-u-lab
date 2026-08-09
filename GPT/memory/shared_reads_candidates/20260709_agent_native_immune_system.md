---
title: "Agent-Native Immune System: Architecture, Taxonomy, and Engineering"
url: "https://arxiv.org/abs/2606.28270"
collected_at: "2026-07-09T11:44:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-security, harness, multi-agent, runtime-safety, game-ai]
evaluated_at: "2026-08-10T06:55:24+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-10T06:55:24+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-10T06:55:24+09:00"
next_action: keep_for_reference
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  runtime hijacking や memory poisoning を扱う問題設定はゲーム agent に近いが、candidate の材料は Immune Tower や taxonomy の概念整理に偏る。
  比較対象、実験設定、測定結果、失敗例がなく、ゲーム制作への適用も安全装置の配置という抽象案に留まるため、CoopEval 水準の概要にはできない。
---

## raw_excerpt
arXiv:2606.28270。論文は、persistent memory、tool-use protocols、multi-agent collaboration を持つ autonomous agent では、従来の perimeter security や training-time alignment だけでは不十分になる、という問題設定を置く。完全に aligned された agent でも、runtime hijacking、memory poisoning、tool-chain manipulation、multi-agent protocol attacks には脆弱になりうる、としている。

提案は Agent-Native Immune System (ANIS)。agent の cognitive loop 内に組み込む endogenous defense architecture として、L0-L5 の six-layer Immune Tower を設計し、その中で Barrier Immunity を non-cognitive な physical-and-logical isolation layer として明示する。さらに Agent Viruses / Agent Vaccines の taxonomy、non-parametric defenses と parametric vaccines の区別、Meta / Self / Auto からなる Harness Triad、Continual Immune Learning を論じる。alignment は training 時の静的な価値基盤、agent immunity は runtime の動的な law enforcement と分けている点も記録対象。

## why_relevant_to_games
LLM NPC、multi-agent simulation、外部 tool を触る game QA agent を作る時、prompt injection や memory poisoning をゲーム内状態と混ぜてしまう危険を整理する材料。ゲーム制作では「安全装置を gameplay loop / test harness のどこに入れるか」の設計語彙になりそう。
