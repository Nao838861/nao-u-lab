---
title: "AutoBG: A Board Game Design Assistant with Interactive Ideation, Iterative Rulebook Generation, and Individualized Feedback"
url: "https://arxiv.org/abs/2606.01976v2"
collected_at: "2026-07-09T15:41:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, board-game, llm-cocreation, playtesting, rulebook]
evaluated_at: "2026-07-09T15:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T02:39:24+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-7842e8b5b34687f1; terminal:memory/shared_reads_candidates/20260606_autobg_board_game_design_assistant.md: status:posted;https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780414844668019; reason:same arXiv work 2606.01976 as posted canonical sibling; no distinct source or work identity"
next_action: none
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  BG-Ideator / BG-Realizer / BG-Critic / BG-Persona の分解と評価材料は十分で、単独なら CoopEval 水準の概要化が可能。
  しかし title canonical index に同一 title_key の posted terminal group があり、AutoBG は既に複数回 shared-reads に残っている。
  現行ゲートでは新規投稿せず、posted sibling の重複候補として postponed に戻す。
---

## raw_excerpt

arXiv:2606.01976v2。2026-06-01 投稿、2026-06-13 改訂。ボードゲーム設計を、曖昧な初期アイデアから rulebook revision と audience testing まで一つの workflow として支援する Human-AI collaboration system。AutoBG は critic-driven iterative refinement を中心に、BG-Ideator、BG-Realizer、BG-Critic、BG-Persona の 4 module で構成される。BG-Ideator は multi-turn dialogue で structured design draft を作り、BG-Realizer は draft から complete rulebook を生成し、BG-Critic は design flaws を診断して verified improvements だけを revision として通す。BG-Persona は 150 real player profiles から individualized feedback を模擬する。2.2K structured rulebooks と 180K quality-filtered real player reviews を基盤にし、207 held-out games の実験と 30 participants の user study が報告されている。blank-page anxiety の低減、隠れた design flaw の表面化、実用的な creative assistance が主張されている。

## why_relevant_to_games

ルール生成そのものより、ideation、realization、critic、persona feedback を分ける制作 loop の参考になる。小型プロトタイプでも、設計案、ルール本文、批判、想定プレイヤー反応を別 artifact にできる。
