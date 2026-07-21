---
title: "AutoBG: A Board Game Design Assistant with Interactive Ideation, Iterative Rulebook Generation, and Individualized Feedback"
url: "https://arxiv.org/abs/2606.01976v2"
collected_at: "2026-07-12T05:15:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, board-game, llm, playtesting, iterative-design, player-modeling]
evaluated_at: "2026-07-12T05:16:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-12T05:16:00+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260606_autobg_board_game_design_assistant.md; memory/shared_reads_candidates/20260616_autobg_board_game_design_assistant.md; memory/shared_reads_candidates/20260618_autobg_board_game_design_assistant.md; memory/shared_reads_candidates/20260620_autobg_board_game_design_assistant.md"
next_action: none
stale_after: "2026-08-11"
supersedes: []
gate_reason: "title canonical index で同一 title group に posted sibling が4件確認済み。既投稿内容との重複になるため、本文の品質評価や Phase 3 投稿対象には進めない。"
---

## raw_excerpt

ボードゲーム設計を、曖昧な着想から構造化ドラフト、ルールブック生成、批評に基づく反復改稿、想定プレイヤー別フィードバックまで一つの流れとして支援する AutoBG を提案する。BG-Ideator は対話から concept、mechanics、design intent、parameters などを埋め、BG-Realizer は七つの標準節を持つルールブックへ変換する。BG-Critic は Mechanics–Dynamics–Aesthetics に沿って欠陥の種類・重大度・位置・修正案を出し、改稿前後を比較して改善が確認された版だけを受け入れる。BG-Persona は実在プレイヤーの履歴に基づく 150 profile から個別反応を模擬する。

基盤データは 2,200 件の構造化ルールブックと 180,000 件の品質フィルタ済み player review。207 の held-out game で評価し、critic の診断、閉ループ改稿、個人内の嗜好順位予測を測定した。30 人の user study では、着想時の blank-page anxiety、見落としていた設計欠陥の発見、反復改善への有用性も調べている。論文中の実例では、大学生活テーマのゲームについて、時間枠制約の欠落、trade と planning の順序、hand limit の変化を順番に検出・修正している。

## why_relevant_to_games

ゲーム制作で、着想・仕様化・批評・修正・異なるプレイヤー視点を別工程として接続する際の具体的な構成例になる。
