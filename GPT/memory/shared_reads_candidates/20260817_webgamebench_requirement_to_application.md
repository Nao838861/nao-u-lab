---
title: "WebGameBench: Requirement-to-Application Evaluation for Coding Agents via Browser-Native Games"
url: https://arxiv.org/abs/2605.17637
collected_at: "2026-08-17T17:30:54+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, browser-games, coding-agents, playtesting, evaluation]
---

## raw_excerpt

論文本文から拾った要点（日本語メモ）: WebGameBench は、coding agent が固定された Structured WebGame Specification を受け取り、ソース生成・ビルド・ローカル配信を経て、ブラウザから実際に操作できるゲームを届けられるかを測る requirement-to-application benchmark である。評価対象をコード、diff、build 成功、画面表示だけに置かず、実ブラウザ上で runtime evaluator が操作し、入力反応、空間対応、ルール実行、状態遷移、得点や資源の更新、勝敗条件、restart、可視 feedback を確認する。111 task、7 gameplay family、12 coding agent、14 evaluation configuration を扱い、最良構成でも Usable は 76.9% だが Excellent は 20.2% に留まった。仕様難度別の pooled usable rate は D1 73.7%、D2 76.1%、D3 52.1%、D4 12.6%。43 artifact の human review では、Usable 判定の agreement は evaluator の reasoning 強度とともに上がり、XHigh で accuracy 85.0%、macro-F1 82.9% だった一方、Excellent / Usable / Unusable の三値完全一致は accuracy 50.0% だった。著者らは自動評価を人間評価の代替認証ではなく、集計可能な usability signal と runtime failure diagnosis の補助として位置づけている。

## why_relevant_to_games

ブラウザゲームの生成を「起動したか」ではなく、プレイ中の振る舞いと受入条件で検証する task specification／runtime harness の事例として、ゲーム prototype の自動 playtest と完成判定の設計に接続できる。
