---
title: "OpenGame: Open Agentic Coding for Games"
url: "https://arxiv.org/abs/2604.18394"
collected_at: "2026-06-02T04:00:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-generation, coding-agent, headless-evaluation, browser-game, ai-agent]
evaluated_at: "2026-07-19T08:04:38+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T08:42:48+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-03cdcad532e5031a; terminal:memory/shared_reads_candidates/20260526_opengame_agentic_coding_games.md: status:posted permalink:p1779801836817719; reason:posted-source index が同一 arXiv work を実投稿済みと確定"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  posted-source index で同一 arXiv work の実投稿と完全一致し、posted terminal sibling と Slack permalink を確認した。
  内容評価を重ねず、Phase 3 の投稿対象から重複として除外する。
---

## raw_excerpt

arXiv:2604.18394、2026-04-20 submitted。問題設定は、LLM と code agents が isolated programming tasks は解けても、high-level design から fully playable game を作る時には cross-file inconsistencies、broken scene wiring、logical incoherence で崩れやすい、というもの。OpenGame は end-to-end web game creation の agentic framework として説明され、Game Skill は Template Skill と Debug Skill を持つ。GameCoder-27B は game engine mastery に特化した code LLM で、continual pre-training、supervised fine-tuning、execution-grounded reinforcement learning の pipeline が示されている。OpenGame-Bench は Build Health、Visual Usability、Intent Alignment を headless browser execution と VLM judging で scoring する。

Source lines: arXiv page lines 30-41.

## why_relevant_to_games

「コードが出る」ではなく「playable browser game として動く」までの agentic workflow と評価軸を集める候補。Codex のゲーム生成サイクル評価に接続できる。
