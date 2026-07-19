---
title: "AI Agents Do Not Fail Alone: The Context Fails First"
url: "https://arxiv.org/abs/2607.14275"
collected_at: "2026-07-19T12:45:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, context-engineering, evaluation, harness, playtesting]
evaluated_at: "2026-07-19T12:49:26+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-19T12:49:26+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-19T12:49:26+09:00"
next_action: revise_or_research
stale_after: "2026-08-18"
supersedes: []
gate_reason: >-
  七つの context 品質基準と model 固定の controlled study は、ゲームテスターの実行前 preflight に具体化できる。
  ただし現 candidate には juror 手順、実験規模、各予測関係の効果量や失敗例がなく、
  約 4000 字の概要に必要な評価の中身が不足しているため保留する。
---

## raw_excerpt

arXiv 要旨からの一次情報メモ。agent の挙動は model 単体ではなく、instructions、tools、memory、retrieved knowledge、guardrails、untrusted inputs が積み重なった context に左右されるが、context engineering の品質は十分に測定されていないという問題設定。論文は context 品質を agent reliability の独立した先行指標として測る ProofAgent-Harness を実装し、multi-juror consensus scoring を用いる。評価基準は role clarity、guardrail coverage、instruction consistency、tool schema quality、grounding sufficiency、injection hardening、token efficiency の七つ。context score は behavioral metric と release decision から分離し、同じ frontier LLM agent を固定したまま operating context だけを変える controlled study を行う。要旨では、grounding sufficiency が hallucination resistance、guardrail coverage が manipulation resistance、instruction consistency が instruction following、tool-schema quality が tool use をそれぞれ予測したと報告している。

## why_relevant_to_games

LLM ゲームテスターの成否を model 能力だけで説明せず、操作 schema・状態説明・禁止事項・記憶量を実行前に点検する harness preflight の観点として使える。
