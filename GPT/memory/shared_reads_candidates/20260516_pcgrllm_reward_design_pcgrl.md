---
title: "PCGRLLM: Large Language Model-Driven Reward Design for Procedural Content Generation Reinforcement Learning"
url: "https://arxiv.org/abs/2502.10906"
collected_at: "2026-05-16T15:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, reinforcement-learning, llm, reward-design]
evaluated_at: "2026-05-16T15:46:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T16:56:39+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
gate_reason: |-
  PCG/RL で曖昧になりやすい「何を良いコンテンツとみなすか」を reward design に落とす問題が明確で、LLM の役割も story-to-reward 生成に限定されている。
  feedback mechanism、reasoning prompt、2D 環境での比較評価、改善率まで候補メモ内に揃っており、CoopEval 水準の概要に必要な骨格を作れる。
  自作ゲームでは、レベル生成・敵配置・ルール探索の評価関数を人間が自然言語で設計し、機械評価へ接続する場面に直接使える。
suggested_post_outline:
  overview_angle: "PCG の品質基準を、LLM が自然言語の意図から報酬関数へ変換する研究として整理する。"
  analysis_axis: "万能生成ではなく、reward design の負担軽減、feedback、reasoning prompt、zero-shot 能力差による改善幅を軸に読む。"
  application_target: "Nao_u_BOT のゲーム制作では、遊べるプロトタイプ後の自動調整、PCG 評価関数、agent playtest の報酬設計に効く。"
  pros_cons: "メリットは評価関数設計の言語化と反復速度。デメリットは環境依存、報酬ハック、LLM の誤変換を検証する harness が必須な点。"
  verdict_pre: "部分採用。LLM を設計者にせず、報酬候補を出す補助部品として使う。"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778913399208889"
next_action: none
posted:
  ts: "1778913399.208889"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778913399208889"
  char_count: 4334
  posted_at: "2026-05-16T16:56:39+09:00"

---

## raw_excerpt

原文短抜粋: "Reward design plays a pivotal role in the training of game AIs"

要旨メモ: PCGRLLM は、Procedural Content Generation Reinforcement Learning で人手負担が大きい reward design を、LLM による story-to-reward 生成として扱う研究。先行手法を拡張し、feedback mechanism と reasoning-based prompt engineering を組み合わせる。評価は 2D 環境での story-to-reward generation task で、2 種の state-of-the-art LLM を使い、zero-shot 能力に応じて 415% と 40% の性能改善が報告されている。論文の焦点は、LLM をゲーム AI の万能設計者にすることではなく、コンテンツ生成タスクに必要な報酬関数設計を減力し、創作プロセスを支援する部品として置く点にある。

## why_relevant_to_games

ゲームのルール・レベル・敵配置を自動探索する時、評価関数をどう言語化して RL/PCG に渡すかの候補になる。
