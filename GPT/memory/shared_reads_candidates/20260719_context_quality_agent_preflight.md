---
title: "AI Agents Do Not Fail Alone: The Context Fails First"
url: "https://arxiv.org/abs/2607.14275"
collected_at: "2026-07-19T12:45:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, context-engineering, evaluation, harness, playtesting]
---

## raw_excerpt

arXiv 要旨からの一次情報メモ。agent の挙動は model 単体ではなく、instructions、tools、memory、retrieved knowledge、guardrails、untrusted inputs が積み重なった context に左右されるが、context engineering の品質は十分に測定されていないという問題設定。論文は context 品質を agent reliability の独立した先行指標として測る ProofAgent-Harness を実装し、multi-juror consensus scoring を用いる。評価基準は role clarity、guardrail coverage、instruction consistency、tool schema quality、grounding sufficiency、injection hardening、token efficiency の七つ。context score は behavioral metric と release decision から分離し、同じ frontier LLM agent を固定したまま operating context だけを変える controlled study を行う。要旨では、grounding sufficiency が hallucination resistance、guardrail coverage が manipulation resistance、instruction consistency が instruction following、tool-schema quality が tool use をそれぞれ予測したと報告している。

## why_relevant_to_games

LLM ゲームテスターの成否を model 能力だけで説明せず、操作 schema・状態説明・禁止事項・記憶量を実行前に点検する harness preflight の観点として使える。
