---
title: "Highlights from Day 1 at GDC 2026: Hands, Agents, Performance & More"
url: "https://developers.meta.com/horizon/blog/gdc-2026-day-1-hands-agents-performance/"
collected_at: "2026-06-25T17:30:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [vr, input-design, hand-tracking, agent-workflow, performance, telemetry, playtesting]
---

## raw_excerpt
Meta Horizon OS Developers の GDC 2026 Day 1 recap。主な項目は、hands-first interaction design、Unity 内の agentic AI workflows、VR performance fundamentals、Contractors VR の custom analytics による retention 改善。

入力設計では、hand tracking は onboarding、accessibility、presence に効く一方で、precision、complex inputs、camera tracking range 外の操作では controllers が向く、という実務的な切り分けが示されている。Maestro の例では、指や手の高速な姿勢検出を無理に要求せず、静止 pose など tracking が安定しやすい gesture に寄せている。

agent workflow では、iterative prompts で hand tracking mechanic を作り、shader の片目描画不具合を single-pass instanced stereo issue として直す例、さらに headset 内で runtime state を見ながら voice-driven assistance で調整する Immersive Debugger が紹介されている。AI-ready documentation として Markdown docs、llms.txt、llms-full.txt、MCP server installation も挙げられている。

performance では、72 FPS minimum、hitches below 3%、13.9ms frame budget、Quest 3 の CPU/GPU/memory headroom、Perfetto MCP server による trace と AI assistant の接続、Shader Binary Cache、Dynamic Resolution、phased release が扱われる。Contractors VR の分析例では、new player experience の死因を分解し、bot accuracy と starter map selection を直して first-match extraction rate を 15% から 50% 超に上げたとされる。

## why_relevant_to_games
入力方式、AI 支援実装、性能計測、game-specific telemetry を一つの制作ループとして見られる。アクション/VR で「体感の悪さ」を主観だけでなく trace、bot、cohort、初回体験の数値に接続する候補。
