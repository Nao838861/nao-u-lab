---
title: "WebGameBench: Requirement-to-Application Evaluation for Coding Agents via Browser-Native Games"
url: https://arxiv.org/abs/2605.17637
collected_at: "2026-08-17T17:30:54+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, browser-games, coding-agents, playtesting, evaluation]
evaluated_at: "2026-08-17T17:33:46+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786956003.605089"
  permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786956003605089
  char_count: 4157
  posted_at: "2026-08-17T17:40:20+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-17T17:40:20+09:00"
last_decision: posted
evidence: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786956003605089
next_action: none
stale_after: "2026-09-16"
supersedes:
  - memory/shared_reads_candidates/20260529_webgamebench_browser_native_games.md
gate_reason: >-
  旧 candidate の fail 要因だった一次資料不足を解消し、runtime evaluator の評価軸、
  111 task・12 agent の結果、人手照合で判明した自動判定の限界が揃い、約4000字の概要を構成できる。
  prototype の受入条件を入力反応・状態遷移・勝敗・restart まで具体化する用途へ直接適用できる。
suggested_post_outline:
  overview_angle: "コード生成ベンチマークを、実ブラウザで遊べるゲームの requirement-to-application 評価へ拡張した設計と結果"
  analysis_axis: "仕様難度別の成功率、runtime evaluator の観測項目、三値品質判定と人手評価の不一致から見る自動 playtest の有効範囲"
  application_target: "Log_cdx の browser game prototype と headless playtest harness で、起動確認を入力反応・状態遷移・資源更新・勝敗・restart の受入テストへ分解する"
  pros_cons: "再現可能で集計可能な runtime 診断と agent 比較が利点。Excellent 判定の人手一致が低く、操作可能性より上の遊びの質は別評価が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt

論文本文から拾った要点（日本語メモ）: WebGameBench は、coding agent が固定された Structured WebGame Specification を受け取り、ソース生成・ビルド・ローカル配信を経て、ブラウザから実際に操作できるゲームを届けられるかを測る requirement-to-application benchmark である。評価対象をコード、diff、build 成功、画面表示だけに置かず、実ブラウザ上で runtime evaluator が操作し、入力反応、空間対応、ルール実行、状態遷移、得点や資源の更新、勝敗条件、restart、可視 feedback を確認する。111 task、7 gameplay family、12 coding agent、14 evaluation configuration を扱い、最良構成でも Usable は 76.9% だが Excellent は 20.2% に留まった。仕様難度別の pooled usable rate は D1 73.7%、D2 76.1%、D3 52.1%、D4 12.6%。43 artifact の human review では、Usable 判定の agreement は evaluator の reasoning 強度とともに上がり、XHigh で accuracy 85.0%、macro-F1 82.9% だった一方、Excellent / Usable / Unusable の三値完全一致は accuracy 50.0% だった。著者らは自動評価を人間評価の代替認証ではなく、集計可能な usability signal と runtime failure diagnosis の補助として位置づけている。

## why_relevant_to_games

ブラウザゲームの生成を「起動したか」ではなく、プレイ中の振る舞いと受入条件で検証する task specification／runtime harness の事例として、ゲーム prototype の自動 playtest と完成判定の設計に接続できる。
