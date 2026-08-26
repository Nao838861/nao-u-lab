---
title: "GameXpert-Bench: How Far Are Coding Agents from Expert Game Development?"
url: "https://arxiv.org/abs/2608.21833v1"
collected_at: "2026-08-26T11:50:02+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, coding-agents, benchmark, automated-testing, regression-testing, human-agent-co-creation]
evaluated_at: "2026-08-26T11:56:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-26T12:05:21+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787713507728929"
next_action: none
stale_after: "2026-09-25"
supersedes: []
posted:
  ts: "1787713507.728929"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787713507728929"
  char_count: 4246
  posted_at: "2026-08-26T12:05:21+09:00"
gate_reason: >-
  初期生成・不具合修復・累積改善という制作 lifecycle を分離し、実行時挙動、Fail-to-Pass、
  Pass-to-Pass、受入条件、regression まで評価している。規模・評価手順・失敗モードも揃い、
  自分達の playable diff と回帰検証へ具体的に接続した CoopEval 水準の概要を書けるため pass とする。
suggested_post_outline:
  overview_angle: "ゲーム制作 coding agent を単発生成ではなく生成・修復・反復改善の lifecycle で測る評価設計"
  analysis_axis: "実行時証拠と回帰保全を軸に、GameGen / GameFix / GameOpt の課題設計と失敗モードを比較する"
  application_target: "自分達の prototype 制作で、playable diff、headless 検証、受入条件、既存機能の非退行を cycle ごとに結ぶ"
  pros_cons: "制作工程に近い再現可能な評価が強み。人間評価を要する visual quality / player experience と dataset 規模には限界がある"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文を基にした日本語抜粋メモ（長文の直接引用ではなく要約）。GameXpert-Bench は、coding agent によるゲーム制作を、空の workspace からの初期生成 `GameGen`、不具合の診断・修復 `GameFix`、人間の要求を6 turnにわたって反映する累積改善 `GameOpt` の3段階で評価する。GameGen は11 genre・97 task（うち3Dが44）を含み、code inspection だけでなく live interaction と runtime event で機能を確認し、visual quality と player experience は人間が見る。集計では core completeness に比べて richness が低かった。

GameFix は人間が確認した50 levelへ7領域の可逆 bug を各19〜27件注入する。全不具合を列挙する Explicit Issue と、一部症状だけを示して残りを探させる Self-Discovery を分け、headless Chromium、固定時刻、synthetic input、JSON state snapshot から Fail-to-Pass / Pass-to-Pass を判定する。最上位でも near-perfect repair を表す Strict は39.0で、未提示 bug の発見、実行検証、複数 bug の計画、regression 制御、停止条件が別々の能力として現れた。

GameOpt は実際の human-agent trajectory を基にした17 game・102 turnを使い、gameplay、level、balance、art、UI、audio の要求を順に与える。最終成果物を701 acceptance criteria（392 requirement、212 challenge、97 regression）で確認し、dead code、コメント、agent 自身の説明は証拠に数えない。reachable code、runtime log、screenshot、audio trace を証拠とし、過去の要求が後続編集で壊れていないかも見る。

## why_relevant_to_games

ゲーム生成、修復、反復改善を別 track に分け、実行時挙動と regression を証拠にする評価設計の資料。prototype 制作後の自己評価や headless test を、単発の最終 score ではなく制作 lifecycle 全体へ接続する場面に使える。
