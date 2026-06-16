---
title: "Closing the Loop in Affect-Driven Game Adaptation: A Systematic Review"
url: "https://arxiv.org/abs/2505.01351"
collected_at: "2026-06-17T05:16:01+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-experience, adaptive-difficulty, affective-computing, pcg]
evaluated_at: "2026-06-17T05:36:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-17T05:26:32+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781641586904249"
next_action: none
posted:
  ts: "1781641586.904249"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781641586904249"
  char_count: 3525
  posted_at: "2026-06-17T05:26:32+09:00"
stale_after: "2026-07-17"
supersedes: []
gate_reason: |-
  sensing / modeling / adaptation を complete loop として切り分ける軸が明確で、問題設定・手法の中核・調査範囲・限界が揃っている。
  難易度調整や感情反応型演出を「測定で終わらせない」設計チェックリストへ落とせるため、ゲーム制作への適用も具体的。
suggested_post_outline:
  overview_angle: "affect-driven adaptation を、プレイヤー状態推定ではなく game content 変更まで接続する closed loop として読む。"
  analysis_axis: "3 要素の loop、23 empirical studies の偏り、telemetry 偏重、rule-based / heuristic 優勢、affective target と calibration cue の違い。"
  application_target: "難易度調整、ホラー演出、疲労・緊張検知を導入する際の設計レビューと実装スコープ決め。"
  pros_cons: "メリットは測定・モデル・適応を分けて失敗点を特定できること。デメリットは実装負荷とデータ不足、リアルタイム統合の難しさ。"
  verdict_pre: "部分採用。まずは telemetry + rule-based adaptation の小さな probe に限定する。"
---

## raw_excerpt

arXiv PDF / web search から拾った一次メモ。論文は、affective game adaptation を「プレイヤー状態を推定するだけ」ではなく、player data acquisition、player experience modeling、adaptive game content の三つがつながった complete experience-driven loop として整理する systematic review。対象は 2015-01-01 から 2025-12-31 までの 23 empirical studies。短い原文断片: "complete experience-driven loop" / "dynamic difficulty adjustment"。

要旨では、complete-loop systems は retrieved corpus の中で相対的に少なく、主な目的は dynamic difficulty adjustment、engagement、rehabilitation、performance-related goals に寄りがちだとされる。入力は game telemetry が中心で、facial expression analysis や peripheral interaction data のような非侵襲で affective relevance を持つ入力は少なめ。modeling と adaptation では、解釈可能性と低い導入要件のため rule-based systems や heuristics が多く、ML approach は data availability、transparency、runtime integration の制約を受ける。重要な区別として、affective information が challenge calibration を支える cue として入っていても、stress / anxiety / horror などの affective state 自体を adaptation target にしているとは限らない、という問題が立てられている。

## why_relevant_to_games

難易度調整、ホラー演出、疲労や緊張への反応を「測っただけ」で終わらせず、実際にどの game content をどう変えるかへ接続する設計観点として使えそう。
