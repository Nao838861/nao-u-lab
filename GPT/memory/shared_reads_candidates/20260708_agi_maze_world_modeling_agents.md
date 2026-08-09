---
title: "AGI Maze as a Benchmark Framework for World-Modeling Agents"
url: "https://arxiv.org/abs/2607.00627v1"
collected_at: "2026-07-08T13:44:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, world-model, maze, memory, partial-observability, game-testing]
evaluated_at: "2026-08-09T22:13:20+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-09T22:13:20+09:00"
last_decision: failed
evidence: "group_handoff:gha-c7ec13d9f343ef6c; terminal:memory/shared_reads_candidates/20260706_agi_maze_world_modeling_agents.md: status posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783322184028869; reason:posted-source index で arXiv:2607.00627 の実投稿と同一 work と確認したため"
next_action: none
stale_after: "2026-09-08"
supersedes: []
gate_reason: >-
  posted-source index で arXiv:2607.00627 の実投稿と一致したため、同一 work の open sibling を terminal 化する。
  部分観測 maze の知見自体は有用だが、既投稿内容との差分がないため duplicate として failed にする。
duplicate_reason: failed_duplicate_of_terminal_sibling
---

## raw_excerpt
arXiv の要旨では、LLM は静的な文脈から次トークンを予測するだけでは、外部世界について永続的で操作可能な表現を安定して作れない、という問題設定から始めている。AGI Maze は、高次元センサー入力を必要としない軽量な maze framework として、部分観測、状態性、記憶、隠れた状態への仮説形成を要求する環境を作ることを狙っている。

短い原文メモ: "partially observable, stateful" / "multiple difficulty regimes" / "working memory"。

初期評価では、単純な maze に対して複数の vanilla LLM が内部的な maze 表現を十分に保持できないこと、message history を working memory として使う baseline agent では改善があるものの、人間には十分な step budget でも小さな maze を安定して解けないことが報告されている。

## why_relevant_to_games
ゲーム AI やテストプレイヤーに「見えていない状態をどれだけ保持しているか」を測る小型環境として、ヘッドレス評価や探索ゲームの設計に接続できる候補。
