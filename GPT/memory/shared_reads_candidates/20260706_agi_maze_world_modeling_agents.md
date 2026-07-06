---
title: "AGI Maze as a Benchmark Framework for World-Modeling Agents"
url: "https://arxiv.org/abs/2607.00627"
collected_at: "2026-07-06T15:59:43.2997928+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, world-model, maze, memory, benchmark]
evaluated_at: "2026-07-06T16:05:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783322184.028869"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783322184028869"
  char_count: 4440
  posted_at: "2026-07-06T16:16:35.4275374+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-06T16:16:35.4275374+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783322184028869"
next_action: none
stale_after: "2026-08-05"
supersedes: []
gate_reason: >-
  部分観測 maze で、LLM agent が観測履歴から外界状態を保持・更新できるかを問う問題設定が明確。
  grid-based task、clean API、difficulty regimes、vanilla LLM と working-memory baseline の初期評価まであり、手法と限界を概要化できる。
  ゲーム制作では、探索ゲームや NPC path reasoning の headless probe として、内部地図・記憶表現の評価軸に直結する。
suggested_post_outline:
  overview_angle: "LLM agent の強さを会話文脈ではなく、部分観測 maze における操作可能な world state representation と working memory の保持で測る benchmark として紹介する。"
  analysis_axis: "next-token prediction 的な局所推論と、隠れた地図・位置・状態を継続更新する world modeling の差を、task design と baseline failure から読む。"
  application_target: "迷路探索、戦術移動、NPC path reasoning、headless playtest における agent 評価 probe。観測ログから地図を構築できるか、step budget 内で安定解決できるかを見る小型テストに使う。"
  pros_cons: "メリットは軽量で game loop に近く、記憶表現の破綻を見つけやすいこと。デメリットは maze に閉じた抽象環境なので、視覚入力・物理・社会的意思決定への一般化は別途検証が必要なこと。"
  verdict_pre: "部分採用。#shared-reads では、ゲーム制作向け agent probe の小さな型として扱い、汎用 AGI benchmark として過大評価しない。"
---

## raw_excerpt

arXiv 2607.00627。Alexey Potapov による、world-modeling agent 評価用の軽量 maze benchmark。問題設定は、LLM が静的 context 上の next-token prediction では強く見えても、部分観測、状態保持、隠れた world state への仮説更新が必要な環境では、持続的で操作可能な外界表現を作れるとは限らないという点。AGI Maze は高次元 sensory input を使わず、grid-based maze tasks、clean API、複数 difficulty regimes を提供し、local rule の推論ではなく world state representation を学習して使う必要がある環境を作る。初期評価では、vanilla LLM は小さな maze でも inference time に内部表現を安定して保持できず、message history を working memory として観測記述を構築できる baseline agent でも、人間には十分な step budget 内で小 maze を安定解決するには不足するとされる。

## why_relevant_to_games

迷路・探索・戦術移動ゲームで、agent を「解けたか」だけでなく、見た情報から地図や隠れ状態を更新できているかで見る入口になる。headless 評価や NPC path reasoning の probe に接続しやすい。
