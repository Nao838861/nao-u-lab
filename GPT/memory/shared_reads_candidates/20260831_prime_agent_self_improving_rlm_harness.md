---
title: "Prime Agent: A Self-Improving RLM Harness"
url: "https://arxiv.org/abs/2608.23552"
collected_at: "2026-08-31T21:08:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, harness, long-horizon, coding-agent, game-playing, evaluation]
evaluated_at: "2026-08-31T21:15:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-31T21:38:35.664289+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788179915664289"
next_action: none
stale_after: "2026-09-30"
supersedes: []
posted:
  ts: "1788179915.664289"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788179915664289"
  char_count: 4496
  posted_at: "2026-08-31T21:38:35.664289+09:00"
gate_reason: |-
  persistent REPL、trajectory 間で持続する memory／skill、recursive subagent、recovery・verification・resource accounting を統合し、model 能力と harness 失敗を分離する問題設定と実装の中核が明確である。
  ARC-AGI-3、coding、emulator、Factorio の継続進行という複数評価があり、長時間の自動プレイ・ゲーム制作 agent の実行基盤へ具体的に適用できるため pass とする。
suggested_post_outline:
  overview_angle: "長期 agent の失敗を model の戦略能力だけに帰さず、持続状態・復旧・検証・資源管理を担う harness の問題として切り出す"
  analysis_axis: "persistent REPL、continual memory、recursive subagent、標準化された execution／recovery／verification が各 benchmark と Factorio の継続進行にどう寄与するかを分けて読む"
  application_target: "長時間の自動プレイ、反復的なゲーム実装、途中失敗から再開する評価 run で、session checkpoint・検証証拠・resource budget を明示する agent harness"
  pros_cons: "利点は実行基盤の故障を戦略能力の不足と混同せず、再開可能な長期作業を設計できること。弱点は harness と model／subagent の寄与分離、運用コスト、ゲーム固有評価の再現性を追加検証する必要があること"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文を基にした日本語抜粋メモ（長文の直接引用ではなく要約）。language model は逐次処理器だが、long-horizon agency には model weights と active context の外側にある情報・計算・持続状態が必要になる。Prime Agent は long-horizon evaluation と coding-agent workflow のための open-source harness で、Recursive Language Model の考え方に沿う persistent IPython REPL を使い、長い context を programmatic に処理しながら test-time compute を実行する。Continual Harness は trajectory をまたいで history、memory、skill、prompt、subagent specification を保持する。recursive subagent は agent 間の直接通信で協調し、人間は Agents View から daemon-backed session を観察・管理できる。

harness は execution、recovery、verification、resource accounting を標準化する一方、戦略構築自体は model に残す。著者らは、実行基盤の失敗を model 能力の失敗として数えないための境界としてこの構成を位置づける。ARC-AGI-3 RHAE Best@1 は30%から95.5%へ上がり、long-context coding、GPU kernel generation、emulator construction、autonomous nanoGPT speedrun でも native／popular harness と同等以上と報告する。Factorio 環境では refinement により technology progression が継続し、専任 subagent によって作業を並列化できたとしている。code は GitHub で公開されている。

## why_relevant_to_games

長時間の自動プレイやゲーム制作 agent で、戦略の弱さと session・復旧・検証基盤の失敗を分離し、Factorio のような継続進行を測る harness 設計の収集材料になる。
