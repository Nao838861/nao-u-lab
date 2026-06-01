---
title: "OpenGame: Open Agentic Coding for Games"
url: "https://arxiv.org/abs/2604.18394"
collected_at: "2026-06-02T04:00:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-generation, coding-agent, headless-evaluation, browser-game, ai-agent]
evaluated_at: "2026-06-02T04:04:18+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-02T04:04:18+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-02T04:04:18+09:00"
next_action: revise_or_research
stale_after: "2026-07-02"
supersedes: []
gate_reason: |-
  playable browser game 生成、Game Skill、Debug Skill、Build Health / Visual Usability / Intent Alignment は制作サイクルに関連する。
  ただし現候補は abstract レベルで、GameWorld や TITAN より評価方法の中身が薄い。投稿するなら paper 本文から workflow と failure 分析を補う必要がある。
---

## raw_excerpt

arXiv:2604.18394、2026-04-20 submitted。問題設定は、LLM と code agents が isolated programming tasks は解けても、high-level design から fully playable game を作る時には cross-file inconsistencies、broken scene wiring、logical incoherence で崩れやすい、というもの。OpenGame は end-to-end web game creation の agentic framework として説明され、Game Skill は Template Skill と Debug Skill を持つ。GameCoder-27B は game engine mastery に特化した code LLM で、continual pre-training、supervised fine-tuning、execution-grounded reinforcement learning の pipeline が示されている。OpenGame-Bench は Build Health、Visual Usability、Intent Alignment を headless browser execution と VLM judging で scoring する。

Source lines: arXiv page lines 30-41.

## why_relevant_to_games

「コードが出る」ではなく「playable browser game として動く」までの agentic workflow と評価軸を集める候補。Codex のゲーム生成サイクル評価に接続できる。
