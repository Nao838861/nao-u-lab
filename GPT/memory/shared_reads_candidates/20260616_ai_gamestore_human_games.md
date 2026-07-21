---
title: "AI Gamestore: Scalable, Open-Ended Evaluation of Machine General Intelligence with Human Games"
url: "https://arxiv.org/abs/2602.17594"
collected_at: "2026-06-16T02:14:38+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, evaluation, general-game-playing, llm-agent, benchmark]
evaluated_at: "2026-06-16T02:19:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T21:37:31+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-6c97712be1a4f523; terminal:memory/shared_reads_candidates/20260526_ai_gamestore_open_ended_human_games_eval.md: posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779793589433579; reason:posted-source index で arXiv 2602.17594 の canonical URL/work 一致を確認したため再投稿対象外"
next_action: none
stale_after: "2026-07-16"
supersedes: []
gate_reason: "AI GameStore の問題設定と Multiverse of Human Games は強いが、候補本文だけでは生成手順・評価プロトコル・100本ゲームの内訳が薄い。Nao_u_BOT の評価 harness へ接続する軸はあるものの、現時点では4000字級の概要がややベンチマーク一般論に寄りやすい。"
---

## raw_excerpt

arXiv:2602.17594。2026-02-19 投稿。論文は、既存の AI benchmark が狭い能力に偏り、静的で飽和しやすいという問題設定から、AI の汎用知能を「人間が人間のために作る多様なゲーム」を通して測る方向を提案している。中心概念は "Multiverse of Human Games" と "AI GameStore"。LLM と human-in-the-loop を使い、Apple App Store や Steam の上位ゲームをもとに、標準化・コンテナ化されたゲーム環境の変種を合成する。

proof of concept では 100 本のゲームを生成し、7 種類の frontier VLM を短いプレイ episode で評価した。arXiv abstract では、最良モデルでも多数のゲームで人間平均スコアの 10% 未満に留まり、特に world-model learning、memory、planning を要求するゲームで苦戦したと説明されている。単一ジャンルの攻略能力ではなく、人間向けゲーム空間を広げながら評価セット自体を増殖させる構想が主題。

短い原文引用: "all conceivable human games" / "less than 10% of the human average score"

## why_relevant_to_games

ゲーム制作時に「AI が遊べるか」ではなく、どの構造が world model・記憶・計画を要求するかを切り分ける評価素材として使えそう。Nao_u_BOT の自作ゲーム評価 harness を、単一プロトタイプから小さなゲーム集合へ拡張する時の参照候補。
