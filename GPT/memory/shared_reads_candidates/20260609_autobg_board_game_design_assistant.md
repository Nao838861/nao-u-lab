---
title: "AutoBG: A Board Game Design Assistant with Interactive Ideation, Iterative Rulebook Generation, and Individualized Feedback"
url: "https://arxiv.org/abs/2606.01976"
collected_at: "2026-06-09T17:24:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, board-game, llm, playtesting, iterative-design]
evaluated_at: "2026-06-09T17:30:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-09T17:30:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-09T17:30:00+09:00"
next_action: keep_for_reference
stale_after: "2026-07-09"
supersedes: []
gate_reason: >-
  手法要素とゲーム制作への適用性は十分に抽出できるが、同一論文の既存候補
  `20260606_autobg_board_game_design_assistant.md` が pass 済みかつ Slack 投稿済み。
  Phase 3 へ再投入すると重複投稿になるため、この 20260609 版は参照用として fail。
---

## raw_excerpt
arXiv 2606.01976。一次情報メモ。論文は、ボードゲーム設計を「デザイナーとして考えること」と「プレイヤーとして経験すること」の反復だと置き、初期アイデアからルールブック改訂、個別プレイヤーフィードバックまでを通す支援システム AutoBG を提示している。

構成は BG-Ideator / BG-Realizer / BG-Critic / BG-Persona の4モジュール。BG-Ideator は対話で構造化 draft を作り、BG-Realizer は draft から完全な rulebook を生成し、BG-Critic が設計上の欠陥を診断して改訂を gate する。BG-Persona は 150 real player profiles から個別フィードバックを模擬する。データ基盤として 2.2K structured rulebooks と 180K quality-filtered real player reviews を使い、207 held-out games での実験と 30人の user study を報告している。

## why_relevant_to_games
「作る前の曖昧な着想」から「ルール文面」「批評」「プレイヤー別反応」までを同一ループに置く例として、Nao_u_BOT のゲーム試作サイクルや headless 評価の前段に使える。
