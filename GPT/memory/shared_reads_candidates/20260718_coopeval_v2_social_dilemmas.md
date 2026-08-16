---
title: "CoopEval: Benchmarking Cooperation-Sustaining Mechanisms and LLM Agents in Social Dilemmas"
url: "https://arxiv.org/abs/2604.15267"
collected_at: "2026-07-18T22:49:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-theory, multi-agent, llm-agent, evaluation, cooperation]
evaluated_at: "2026-08-17T03:34:44+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-17T03:34:44+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_posted_source_work
evidence: "gate_decision:postpone; evaluated_at:2026-08-17T03:34:44+09:00; posted_source_work_match:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778536700085879"
next_action: none
stale_after: "2026-09-16"
supersedes: []
postponed:
  reason: "同一論文 v1 の詳細分析が既に #shared-reads にあり、v2 の中核結論も既存投稿と重複するため再投稿しない"
  existing_permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778536700085879"
gate_reason: >-
  posted-source preflight が arXiv:2604.15267 の work identity と既投稿 permalink の一致を確認した。
  v2 の中核も既存投稿と重複するため、内容品質とは別に Phase 3 の再投稿対象から外す。
---

## raw_excerpt

arXiv v2 の要旨メモ。LLM agent が他の目的追求 agent と安全かつ有効に相互作用する必要が増す一方、prisoner's dilemma や public goods game のような mixed-motive game では、推論能力が強いモデルほど協力的でないという報告がある。著者らの実験でも、reasoning の有無を問わず最近の model は single-shot social dilemma で一貫して defect を選ぶ。CoopEval はこの問題に対し、単なる「協力せよ」という prompt ではなく、合理的 agent 間で協力結果を equilibrium として維持する game-theoretic mechanism を比較する benchmark を提示する。4 種の social dilemma をまたいで、制度側の mechanism と LLM agent の行動を同じ枠で評価し、協力が model の善意ではなく interaction design によって持続する条件を調べる。

## why_relevant_to_games

協力ゲームの NPC、交渉 agent、複数 bot の自己対戦を設計する際に、台詞や性格付けではなく報酬・反復・制度が協力行動をどう作るかを検討する材料になる。
