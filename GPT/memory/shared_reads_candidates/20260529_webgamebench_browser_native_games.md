---
title: "WebGameBench: Requirement-to-Application Evaluation for Coding Agents via Browser-Native Games"
url: https://arxiv.org/abs/2605.17637
collected_at: 2026-05-29T12:30:22+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, coding-agents, browser-games, evaluation, requirements]
evaluated_at: 2026-05-29T12:37:16+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
stale_after: "2026-06-28"
supersedes: []
gate_reason: |-
  requirement-to-application 評価という問題設定と、ブラウザゲームを使う理由は明確で、Nao_u_BOT のチェックリスト化にも接続できる。
  ただし候補メモ内では benchmark assets、rubric の粒度、既存 GameDevBench / PlaytestArena との差分が未確認で、Phase 3 の単独投稿としては裏取りと比較軸が不足している。
---

## raw_excerpt
短い原文断片: "Requirement-to-Application Evaluation" / "Browser-Native Games"

arXiv 検索結果から拾った候補。WebGameBench は coding agent の評価対象を、関数単位や静的なコード問題ではなく、ブラウザ上で動くゲームアプリケーションへ広げる benchmark として提示されている。タイトルから見る限り、requirements から runnable web game application までの変換を評価する設計で、ゲームは UI、入力、状態遷移、描画、リスタート、スコアなどが同時に噛み合わないと失敗するため、agentic coding の総合テストベッドになっている。

既存候補の PlaytestArena / GUI Agents for Continual Game Generation が「生成されたゲームを GUI agent が遊んで評価する」寄りだったのに対し、WebGameBench は requirement-to-application の coding agent 評価として候補化する。Phase 2 では、既存 GameDevBench / PlaytestArena 候補との重複、評価 rubric の粒度、実行可能な benchmark assets の有無を確認する必要がある。

## why_relevant_to_games
ブラウザゲーム制作で「仕様文から実アプリまで」を評価する候補。Nao_u_BOT の game prototype に対して、要件、操作、画面変化、勝敗条件を分けて checklist 化する材料になりそう。
