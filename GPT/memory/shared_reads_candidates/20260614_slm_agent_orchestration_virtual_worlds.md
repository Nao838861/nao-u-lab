---
title: "From Prompt to Service: An SLM-Based Agent Orchestration Gateway for AI-Driven Virtual Worlds"
url: "https://arxiv.org/abs/2606.03557"
collected_at: "2026-06-14T22:08:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [virtual-worlds, agent-orchestration, slm, runtime-architecture, game-ai]
evaluated_at: "2026-06-14T22:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-14T22:10:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-14T22:10:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-14"
supersedes: []
gate_reason: |-
  ゲーム内 AI backend を router と service registry で分ける着想は有用だが、現状メモでは評価設定、比較対象、失敗条件、導入コストが薄い。
  小規模ゲームへの適用は可能でも、4000字級の概要では一般的な architecture 推奨に寄りやすいため、一次情報を読んでから再判定する。
---

## raw_excerpt

arXiv 検索結果と要旨メモ。2026-06-02 投稿。著者は Louis Nisiotis, Aimilios Hadjiliasi。AI-driven virtual worlds では、ユーザーが in-world interface から multimodal に依頼する一方で、実際に必要な backend は会話、翻訳、知識検索、3D asset generation などで分かれ、計算資源も edge / cloud に散る。論文は、これらを virtual world client に直接埋め込むと、拡張性、保守性、分散サービス連携が悪化すると置く。提案は SLM-based Agent Orchestration Gateway。edge に置いた SLM が user prompt の semantic intent を分類し、configurable service registry が routing decision を検証・解決し、選ばれた backend を透過的に呼ぶ。InterwovenXR virtual museum testbed で実装・評価され、sub-billion-parameter model の fine-tuning が低遅延 router として実用的で、router と response generator を分ける layered configuration が中級 edge hardware でも動くと報告されている。

## why_relevant_to_games

LLM/SLM をゲーム内 NPC やワールド操作に入れる時、全部を単一モデルに投げず、意図分類と backend 選択を runtime architecture として分ける候補になる。小規模ゲームでも会話、生成、検索、検証を分離する設計の参考になる。
