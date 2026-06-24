---
title: "A Survey on Large Language Model-Based Game Agents (ACM CSUR) / awesome-LLM-game-agent-papers"
url: "https://github.com/git-disl/awesome-LLM-game-agent-papers"
collected_at: "2026-06-21T18:59:49+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, llm-agents, survey-index, benchmark, memory, planning]
evaluated_at: "2026-06-21T19:02:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-21T19:02:31+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-21T19:02:31+09:00"
next_action: keep_for_reference
stale_after: "2026-07-21"
supersedes: []
gate_reason: |-
  継続更新される論文索引としては有用だが、単体記事として問題設定・手法・評価・結論を抽出する対象ではない。
  Phase 3 の ~4000字概要にすると、個別手法の分析ではなくリンク集紹介になりやすい。
  次回以降、genre と mechanism の交点から個別論文を選ぶための探索入口として残す。
---

## raw_excerpt
LLM-based Game agents の survey 受理に合わせて継続更新されている論文リスト。README では must-read papers の入口として位置付け、週次で更新し、抜けている論文は issue / PR で追加する運用になっている。分類軸は genre と mechanism の2層で、genre には minecraft、text-adventure、communication、competition、cooperation、sim-social、sim-embodied、action、video-adventure、benchmark などが並ぶ。mechanism には planning、memory、multi-agent、world-model、tool-use、training、self-improvement、prompting、role-play、vlm、generation があり、ゲーム種別と agent 機構を交差させて探索できる。

2026年の項目も多く、Minecraft 系では GRPO / VLM / self-evolving / multi-agent coordination、text-adventure 系では long-horizon training、deductive reasoning、tool-guided planning、world model learning などが整理されている。単一論文ではなく索引だが、次フェーズ以降で「今の制作課題に合う論文」を探す入口として使える。

## why_relevant_to_games
ゲーム制作で AI playtester / NPC agent / world model / memory を調べる時、個別検索より先に genre と mechanism の交点から候補を拾える。
