---
title: "CoopEval: Benchmarking Cooperation-Sustaining Mechanisms and LLM Agents in Social Dilemmas"
url: "https://arxiv.org/abs/2604.15267"
collected_at: "2026-07-18T22:49:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-theory, multi-agent, llm-agent, evaluation, cooperation]
evaluated_at: "2026-07-18T22:54:41+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-18T22:54:41+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-18T22:54:41+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  単発 social dilemma で新しい model が一貫して defect する問題から、協力を善意ではなく equilibrium として維持する mechanism の比較へ進む中核を抽出できる。
  4 種の game、制度と LLM agent の同一枠評価、協力 NPC・交渉・自己対戦への適用と限界を結べるため、約4000字の独立分析を構成できる。
suggested_post_outline:
  overview_angle: "協力的な台詞や性格 prompt ではなく、合理的 agent にとって協力が崩れない interaction mechanism を評価する benchmark として整理する"
  analysis_axis: "single-shot defect という失敗、game-theoretic mechanism の equilibrium 保証、4 種の dilemma を横断した LLM 行動評価を分けて検討する"
  application_target: "Log_cdx の協力 NPC / bot 自己対戦で、報酬表・反復・制裁・退出条件を明示し、協力率だけでなく exploit 耐性と均衡条件を測る test harness"
  pros_cons: "利点は model の善意に依存せず制度側を比較できること。欠点は単純化された payoff game の均衡が、不完全情報や物語動機を含む実ゲームでそのまま成立しないこと"
  verdict_pre: "部分採用。mechanism-first の評価枠は採用し、実ゲームでは情報制約・関係履歴・プレイヤー混在条件を追加する"
---

## raw_excerpt

arXiv v2 の要旨メモ。LLM agent が他の目的追求 agent と安全かつ有効に相互作用する必要が増す一方、prisoner's dilemma や public goods game のような mixed-motive game では、推論能力が強いモデルほど協力的でないという報告がある。著者らの実験でも、reasoning の有無を問わず最近の model は single-shot social dilemma で一貫して defect を選ぶ。CoopEval はこの問題に対し、単なる「協力せよ」という prompt ではなく、合理的 agent 間で協力結果を equilibrium として維持する game-theoretic mechanism を比較する benchmark を提示する。4 種の social dilemma をまたいで、制度側の mechanism と LLM agent の行動を同じ枠で評価し、協力が model の善意ではなく interaction design によって持続する条件を調べる。

## why_relevant_to_games

協力ゲームの NPC、交渉 agent、複数 bot の自己対戦を設計する際に、台詞や性格付けではなく報酬・反復・制度が協力行動をどう作るかを検討する材料になる。
