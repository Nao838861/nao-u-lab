---
title: "Agent-Native Immune System: Architecture, Taxonomy, and Engineering"
url: "https://arxiv.org/abs/2606.28270"
collected_at: "2026-07-09T11:44:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-security, harness, multi-agent, runtime-safety, game-ai]
evaluated_at: "2026-07-09T11:46:54+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-09T11:46:54+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-09T11:46:54+09:00"
next_action: revise_or_research
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  persistent memory/tool-use/multi-agent agent の runtime hijacking と memory poisoning を扱う問題設定はゲーム agent に近い。
  ただし candidate 本文は Immune Tower、virus/vaccine taxonomy、Harness Triad などの概念整理が中心で、実証評価の中身や限界が薄い。
  #shared-reads の概要水準にするには、評価設定・比較対象・失敗例を追加確認してから再判定する。
---

## raw_excerpt
arXiv:2606.28270。論文は、persistent memory、tool-use protocols、multi-agent collaboration を持つ autonomous agent では、従来の perimeter security や training-time alignment だけでは不十分になる、という問題設定を置く。完全に aligned された agent でも、runtime hijacking、memory poisoning、tool-chain manipulation、multi-agent protocol attacks には脆弱になりうる、としている。

提案は Agent-Native Immune System (ANIS)。agent の cognitive loop 内に組み込む endogenous defense architecture として、L0-L5 の six-layer Immune Tower を設計し、その中で Barrier Immunity を non-cognitive な physical-and-logical isolation layer として明示する。さらに Agent Viruses / Agent Vaccines の taxonomy、non-parametric defenses と parametric vaccines の区別、Meta / Self / Auto からなる Harness Triad、Continual Immune Learning を論じる。alignment は training 時の静的な価値基盤、agent immunity は runtime の動的な law enforcement と分けている点も記録対象。

## why_relevant_to_games
LLM NPC、multi-agent simulation、外部 tool を触る game QA agent を作る時、prompt injection や memory poisoning をゲーム内状態と混ぜてしまう危険を整理する材料。ゲーム制作では「安全装置を gameplay loop / test harness のどこに入れるか」の設計語彙になりそう。
