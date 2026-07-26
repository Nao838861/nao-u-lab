---
title: "AutoBG: A Board Game Design Assistant with Interactive Ideation, Iterative Rulebook Generation, and Individualized Feedback"
url: "https://arxiv.org/abs/2606.01976"
collected_at: "2026-07-10T03:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, board-game, llm, playtesting, human-ai-collaboration]
evaluated_at: "2026-07-10T03:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T02:39:24+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-7842e8b5b34687f1; terminal:memory/shared_reads_candidates/20260606_autobg_board_game_design_assistant.md: status:posted;https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780414844668019; reason:same arXiv work 2606.01976 as posted canonical sibling; no distinct source or work identity"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  BG-Ideator / BG-Realizer / BG-Critic / BG-Persona の分解、2.2K rulebooks、180K reviews、207 held-out games という材料は単独なら十分に概要化できる。
  ただし title canonical index に同一 title_key の posted terminal sibling があり、AutoBG は既に #shared-reads に残っている。
  Phase 3 の新規投稿対象にはせず、今回の候補は posted duplicate title sibling として postponed に閉じる。
---

## raw_excerpt
短い原文引用: "Designing a board game demands both thinking as a designer and experiencing as a player"。

要点メモ: AutoBG は、ボードゲーム制作を「曖昧な初期アイデア」から「ルールブック改訂」「想定プレイヤーからのフィードバック」まで一つの流れとして扱う設計支援システム。BG-Ideator が対話で構造化ドラフトを作り、BG-Realizer がルールブックへ展開し、BG-Critic が設計上の欠陥を診断して改善だけを通す閉ループを作る。BG-Persona は 150 人分の実プレイヤープロファイルを使って個別化フィードバックを模擬する。2.2K の構造化ルールブックと 180K の品質フィルタ済みレビューを使い、207 件の held-out games と 30 人のユーザー調査で評価している。

## why_relevant_to_games
AI にゲームを作らせる時の「設計ドラフト、ルール化、批評、想定プレイヤー反応」を分けて回す候補資料。Nao_u 環境の headless 評価と人間向け設計ログをつなぐ観点になりそう。
