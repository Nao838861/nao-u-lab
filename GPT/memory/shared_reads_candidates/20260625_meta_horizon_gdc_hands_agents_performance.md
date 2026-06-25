---
title: "Highlights from Day 1 at GDC 2026: Hands, Agents, Performance & More"
url: "https://developers.meta.com/horizon/blog/gdc-2026-day-1-hands-agents-performance/"
collected_at: "2026-06-25T17:30:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [vr, input-design, hand-tracking, agent-workflow, performance, telemetry, playtesting]
evaluated_at: "2026-06-25T17:32:56+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-25T17:32:56+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-25T17:32:56+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-25"
supersedes: []
gate_reason: "hands-first 入力、agent workflow、VR performance、retention analytics が、体験品質を主観でなく trace と cohort へ接続する候補として強い。数値や具体ツール名があり、ゲーム制作サイクルへの適用も telemetry / playtest loop として明確。"
suggested_post_outline:
  overview_angle: "入力設計、AI 支援実装、性能計測、retention 分析を一つの制作ループとして読む"
  analysis_axis: "hand tracking の適用境界、agentic Unity workflow、Perfetto MCP と frame budget、初回体験 telemetry"
  application_target: "アクション/VR に限らず、操作不快感、performance hitch、初回離脱を計測可能な制作ゲートへ落とす"
  pros_cons: "メリットは主観的な気持ち悪さを計測と修正対象へ変換できる点。デメリットは Meta Horizon / Quest 前提の数値をそのまま一般化できない点。"
  verdict_pre: "採用"
---

## raw_excerpt
Meta Horizon OS Developers の GDC 2026 Day 1 recap。主な項目は、hands-first interaction design、Unity 内の agentic AI workflows、VR performance fundamentals、Contractors VR の custom analytics による retention 改善。

入力設計では、hand tracking は onboarding、accessibility、presence に効く一方で、precision、complex inputs、camera tracking range 外の操作では controllers が向く、という実務的な切り分けが示されている。Maestro の例では、指や手の高速な姿勢検出を無理に要求せず、静止 pose など tracking が安定しやすい gesture に寄せている。

agent workflow では、iterative prompts で hand tracking mechanic を作り、shader の片目描画不具合を single-pass instanced stereo issue として直す例、さらに headset 内で runtime state を見ながら voice-driven assistance で調整する Immersive Debugger が紹介されている。AI-ready documentation として Markdown docs、llms.txt、llms-full.txt、MCP server installation も挙げられている。

performance では、72 FPS minimum、hitches below 3%、13.9ms frame budget、Quest 3 の CPU/GPU/memory headroom、Perfetto MCP server による trace と AI assistant の接続、Shader Binary Cache、Dynamic Resolution、phased release が扱われる。Contractors VR の分析例では、new player experience の死因を分解し、bot accuracy と starter map selection を直して first-match extraction rate を 15% から 50% 超に上げたとされる。

## why_relevant_to_games
入力方式、AI 支援実装、性能計測、game-specific telemetry を一つの制作ループとして見られる。アクション/VR で「体感の悪さ」を主観だけでなく trace、bot、cohort、初回体験の数値に接続する候補。
