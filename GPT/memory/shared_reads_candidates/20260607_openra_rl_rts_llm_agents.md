---
title: "OpenRA-RL: An Open Platform for AI Agents in Real-Time Strategy Games"
url: "https://huggingface.co/blog/jadetan/openra-rl"
collected_at: "2026-06-07T11:59:49+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, rts, headless-eval, mcp, replay, benchmark]
evaluated_at: "2026-06-07T12:03:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780801693.265039"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780801693265039"
  char_count: 4223
  posted_at: "2026-06-07T12:08:13.265039+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-07T12:08:13.265039+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780801693265039"
next_action: none
stale_after: "2026-07-07"
supersedes: []
gate_reason: >-
  modified OpenRA engine、gRPC bridge、Python wrapper、MCP server、5 Hz loop、spatial observation、action/MCP tool 群、deterministic replay まで実装要素が具体的。
  LLM latency と 40 ms tick の非同期接続、DropOldest channel、multi-dimensional reward で win/loss だけでは見えない失敗を出す点が、Nao_u_BOT の headless harness 設計へ直接転用できる。
suggested_post_outline:
  overview_angle: "RTS 環境を LLM/RL/scripted bot 共通の headless 実験基盤にする実装記事として、同期しない知能とリアルタイムゲームをどう接続するかを中心に書く。"
  analysis_axis: "engine 改造、bridge/wrapper/MCP の層、観測・行動空間、非同期 tick 処理、deterministic replay、多次元 reward による評価の分解。"
  application_target: "Nao_u_BOT の自動 playtest で、遅い agent 判断をゲーム loop へ接続する設計、replay 保存、win/loss 以外の局所 failure vector 設計に効く。"
  pros_cons: "メリットは実装構成が具体的で移植可能な設計判断が多いこと。デメリットは RTS 特化で、小規模 prototype に使うには観測・行動空間を軽量化する必要があること。"
  verdict_pre: "採用。headless harness の非同期 agent 接続と reward vector 設計の参照候補。"
---

## raw_excerpt

Hugging Face community article、2026-04-27 公開。OpenRA-RL は、Red Alert ベースの RTS 環境を LLM agent / scripted bot / RL trainer が同じ基盤で動かせるようにした open platform。記事では、modified OpenRA engine、gRPC bridge、Python wrapper、MCP server の層で構成し、25 Hz game loop、9-channel spatial observation、21 action types、50 MCP tools を提供すると説明している。重要な実装点は、LLM の 2 秒級 latency とゲーム側の 40 ms tick を同期させず、bounded channel の DropOldest で常に最新観測を読ませる非同期設計。64 concurrent sessions を 1 つの .NET process に集約し、reset latency と RAM 使用量を大きく下げている。評価例では Qwen3 32B が Beginner AI 相手に 5 episode すべて draw、economy は 0.58-0.80 だが combat は 0.0 で、win/loss scalar だけでは見えない失敗様式が multi-dimensional reward で露出している。

## why_relevant_to_games

Nao_u_BOT の headless harness で、リアルタイム進行と遅い agent 判断を切り離す設計、deterministic replay、勝敗以外の reward vector を使った失敗局所化に直結する。
