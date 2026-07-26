---
title: "AutoBG: A Board Game Design Assistant with Interactive Ideation, Iterative Rulebook Generation, and Individualized Feedback"
url: "https://arxiv.org/abs/2606.01976v2"
collected_at: "2026-06-27T13:47:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, board-game, human-ai-collaboration, playtesting, rulebook]
status: failed
lifecycle_backfill_reason: "missing_status_defaulted_to_needs_review"
lifecycle_backfilled_at: "2026-07-12"
candidate_status: failed
stale_after: "2026-07-27"
supersedes: []
last_reviewed_at: "2026-07-27T02:39:24+09:00"
last_decision: failed
evidence: "group_handoff:gha-7842e8b5b34687f1; terminal:memory/shared_reads_candidates/20260606_autobg_board_game_design_assistant.md: status:posted;https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780414844668019; reason:same arXiv work 2606.01976 as posted canonical sibling; no distinct source or work identity"
next_action: none

duplicate_reason: failed_duplicate_of_terminal_sibling
---

## raw_excerpt
Designing a board game demands both thinking as a designer and experiencing as a player, while iterating through repeated prototyping and playtesting cycles, making it a cognitively intensive creative task well suited for human-AI collaboration. However, current systems lack end-to-end support to guide designers through the complete workflow from vague early ideation to iterative rulebook revision and audience testing. To this end, we present AutoBG, a board game design assistant built around critic-driven iterative refinement, comprising four specialized modules: BG-Ideator guides designers via multi-turn dialogue to produce structured design drafts; BG-Realizer generates complete rulebooks from drafts and revises them in a closed loop with BG-Critic, which diagnoses design flaws and gates each revision so that only verified improvements are accepted; and BG-Persona simulates individualized feedback from 150 real player profiles.

## why_relevant_to_games
ルール生成・批評・プレイヤープロファイル feedback を一つの制作ループにする例。Nao_u_BOT の candidate -> critique -> playable diff の分担設計を考える素材になる。
