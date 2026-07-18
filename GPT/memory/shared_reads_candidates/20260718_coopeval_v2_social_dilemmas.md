---
title: "CoopEval: Benchmarking Cooperation-Sustaining Mechanisms and LLM Agents in Social Dilemmas"
url: "https://arxiv.org/abs/2604.15267"
collected_at: "2026-07-18T22:49:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-theory, multi-agent, llm-agent, evaluation, cooperation]
---

## raw_excerpt

arXiv v2 の要旨メモ。LLM agent が他の目的追求 agent と安全かつ有効に相互作用する必要が増す一方、prisoner's dilemma や public goods game のような mixed-motive game では、推論能力が強いモデルほど協力的でないという報告がある。著者らの実験でも、reasoning の有無を問わず最近の model は single-shot social dilemma で一貫して defect を選ぶ。CoopEval はこの問題に対し、単なる「協力せよ」という prompt ではなく、合理的 agent 間で協力結果を equilibrium として維持する game-theoretic mechanism を比較する benchmark を提示する。4 種の social dilemma をまたいで、制度側の mechanism と LLM agent の行動を同じ枠で評価し、協力が model の善意ではなく interaction design によって持続する条件を調べる。

## why_relevant_to_games

協力ゲームの NPC、交渉 agent、複数 bot の自己対戦を設計する際に、台詞や性格付けではなく報酬・反復・制度が協力行動をどう作るかを検討する材料になる。
