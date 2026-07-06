---
title: "Neural Procedural Memory: Empowering LLM Agents with Implicit Activation Steering"
url: "http://arxiv.org/abs/2606.29824v1"
collected_at: "2026-07-06T10:59:28.5584273+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, memory, procedural-memory, action-selection, evaluation]
evaluated_at: "2026-07-06T11:03:16.7825624+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-06T11:03:16.7825624+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-06T11:03:16.7825624+09:00"
next_action: revise_or_research
stale_after: "2026-08-05"
supersedes: []
gate_reason: "text-action disconnect と procedural memory の着想はゲーム AI の操作問題に有用。ただし現候補メモだけでは activation steering の具体手法、評価タスク、比較対象、失敗条件を十分に抽出できず、CoopEval 水準の概要にすると推測が多くなる。Phase 3 投稿前に論文本文か評価表を補う必要がある。"
---

## raw_excerpt

arXiv / web_research から拾った要旨メモ。Neural Procedural Memory は、LLM を静的な solver から継続的に環境と相互作用する autonomous agent に移す時、明示的なテキスト guideline だけでは行動に必要な内部表現が起動しない、という問題設定を置く。既存手法は RAG で symbolic instruction を context に入れがちだが、それだけでは text-action disconnect が残る。論文は、procedural memory を暗黙的な activation steering として扱い、正しい task execution に必要な表現を直接支援する方向を提案している。

## why_relevant_to_games

「プレイ方針を文章で渡したのに操作が変わらない」タイプの headless agent / NPC 制御問題に関係する。ゲーム AI の行動記憶を、説明文ではなく手続き的な行動傾向として扱う観点を拾える。
