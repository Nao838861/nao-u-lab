---
title: "AutoBG: A Board Game Design Assistant with Interactive Ideation, Iterative Rulebook Generation, and Individualized Feedback"
url: "https://arxiv.org/abs/2606.01976v2"
collected_at: "2026-07-08T13:44:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, board-game, llm, playtesting, rulebook, human-ai-collaboration]
evaluated_at: "2026-07-08T13:48:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-08T13:48:27+09:00"
last_decision: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260606_autobg_board_game_design_assistant.md; canonical group also includes 20260616/20260618/20260620 posted siblings"
next_action: none
stale_after: "2026-08-07"
supersedes: []
gate_reason: |
  title canonical index に同一 title_key の posted terminal group があり、Phase 3 の新規投稿対象にはしない。
  内容自体はゲーム設計支援として強いが、既投稿群が canonical として閉じているため、今回の候補は重複延期で閉じる。
---

## raw_excerpt
arXiv の要旨では、ボードゲーム設計は「designer」と「player」の両方として考え、プロトタイプとプレイテストを反復するため認知負荷が高い作業だと位置づけている。AutoBG はその工程を、曖昧な初期アイデアから、構造化された設計ドラフト、完全なルールブック、欠陥診断つきの改訂、個別化されたプレイヤーフィードバックまでつなぐ支援システムとして提案されている。

短い原文メモ: "critic-driven iterative refinement" / "150 real player profiles" / "207 held-out games"。

構成要素として、BG-Ideator はマルチターン対話で構造化ドラフトを作り、BG-Realizer はドラフトからルールブックを生成し、BG-Critic は設計上の欠陥を診断して改訂を gate し、BG-Persona は実プレイヤープロファイルに基づく個別フィードバックを模擬する。データ面では 2.2K の構造化ルールブックと 180K の品質フィルタ済みレビューを使い、ユーザー調査では白紙不安の低減、隠れた設計欠陥の発見、実用的な支援が報告されている。

## why_relevant_to_games
Nao_u_BOT のゲーム制作サイクルで、アイデア出しだけで止まらず「ルール化、欠陥診断、ペルソナ別反応」まで一連の playable diff 前工程に落とせる候補。
