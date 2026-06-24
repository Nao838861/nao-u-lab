---
title: "Orak: A Foundational Benchmark for Training and Evaluating LLM Agents on Diverse Video Games"
url: "https://arxiv.org/abs/2506.03610"
collected_at: "2026-06-18T07:58:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agents, game-agent, benchmark, mcp, gameplay-trajectories]
evaluated_at: "2026-06-18T08:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781736824.965179"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781736824965179"
  char_count: 4373
  posted_at: "2026-06-18T07:53:55+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-18T07:53:55+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781736824965179"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: |-
  12 本の実ゲーム、MCP interface、gameplay trajectories、leaderboard / battle arena / visual state など、手法要素が抽出できる。
  自作ゲームの AI playtester を「単一スコア」ではなく genre 差・入力モダリティ・strategy module・trajectory dataset で評価する材料になる。
  ただし GameCraft-Bench より投稿優先度は一段低く、Phase 3 では同時投稿より在庫化も検討する。
suggested_post_outline:
  overview_angle: "LLM game agent 評価を、多様な実ゲームと trajectory dataset に広げる benchmark として読む。"
  analysis_axis: "MCP 接続、agentic modules、visual input state、fine-tuning effects、genre 横断評価の分解。"
  application_target: "Nao_u_BOT 製ゲームの AI playtester harness、ジャンル別の観察ログ、trajectory ベースの regression 評価。"
  pros_cons: "メリットは評価対象の多様性と MCP 接続の実装連想。デメリットは benchmark が大きく、短期制作へは縮小適用が必要。"
  verdict_pre: "部分採用。MCP 風 interface と trajectory 保存を小さく試す。"
---

## raw_excerpt
arXiv 2506.03610。Orak は、LLM agent を 12 本の real-world video games / 主要ジャンル横断で訓練・評価する benchmark。既存 game benchmark の不足として、多様なジャンルでの LLM capability 評価、complex gameplay に必要な agentic modules の分析、pre-trained LLM を gaming agent に合わせる fine-tuning dataset が足りないことを挙げる。Orak は Model Context Protocol (MCP) ベースの plug-and-play interface を用意し、LLM が games と接続し、agentic modules を操作できるようにする。さらに diverse game genres にまたがる LLM gameplay trajectories の fine-tuning dataset を出し、general game score leaderboards、LLM battle arenas、visual input state、agentic strategies、fine-tuning effects の分析を含む evaluation framework として設計されている。

## why_relevant_to_games
自作ゲームの AI playtester を考える時、単一ゲームの攻略成功率だけでなく、入力モダリティ、戦略モジュール、trajectory dataset、genre 差をどう切り分けるかの参照になる。MCP interface も Nao_u_BOT のゲーム実行 harness と接続可能性がある。
