---
title: "AutoBG: A Board Game Design Assistant with Interactive Ideation, Iterative Rulebook Generation, and Individualized Feedback"
url: "https://arxiv.org/abs/2606.01976"
collected_at: "2026-07-11T13:05:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, board-game, llm, playtesting, iterative-design]
evaluated_at: "2026-07-11T13:25:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-11T13:25:00+09:00"
last_decision: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260606_autobg_board_game_design_assistant.md; canonical posted siblings include 20260616/20260618/20260620"
next_action: none
stale_after: "2026-08-10"
supersedes: []
gate_reason: >-
  title canonical index に同一 title_key の posted terminal sibling が複数あり、AutoBG は既に #shared-reads に記録済み。
  terminal-title preflight 契約に従い、内容の再評価や Phase 3 投稿対象化を行わず duplicate として保留する。
---

## raw_excerpt

曖昧な初期着想から rulebook の反復改訂、対象 audience のテストまでを一つの human-AI workflow で支援する board game design assistant。BG-Ideator は multi-turn dialogue から構造化 design draft を作り、BG-Realizer は完全な rulebook を生成する。BG-Critic は design flaw を診断し、closed loop の各 revision を gate して、検証された改善だけを受理する。BG-Persona は実在 player 150 人分の profile に基づき、個別化した feedback を模擬する。基盤データは 2.2K の structured rulebook と、quality filtering を通した 180K の real player review。207 の held-out game を用いた実験では baseline より高い rulebook 品質を報告し、経験水準の異なる 30 人の user study では blank-page anxiety の低減、隠れた design flaw の発見、実用的な制作支援が観察された。

## why_relevant_to_games

生成・批評・改訂を分離し、「改善と確認された変更だけを受理する」反復ループや、単一平均ではなく player persona 別に playtest feedback を取る設計の参照候補になる。
