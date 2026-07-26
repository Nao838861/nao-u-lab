---
title: "WebGameBench: Requirement-to-Application Evaluation for Coding Agents via Browser-Native Games"
url: https://arxiv.org/abs/2605.17637
collected_at: 2026-05-29T12:30:22+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, coding-agents, browser-games, evaluation, requirements]
evaluated_at: "2026-07-26T09:56:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-26T09:56:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T09:56:00+09:00"
stale_after: "2026-08-25"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  requirement-to-application 評価とブラウザゲームを総合テストに使う問題設定は具体的だが、現 snapshot は題名からの推測が中心で、benchmark assets・rubric・baseline・定量結果を抽出できない。
  2か月近く補強されず、約4000字の概要では既存 GameDevBench / PlaytestArena との差を根拠付きで説明できないため、投稿候補としては閉じて参照用に残す。

---

## raw_excerpt
短い原文断片: "Requirement-to-Application Evaluation" / "Browser-Native Games"

arXiv 検索結果から拾った候補。WebGameBench は coding agent の評価対象を、関数単位や静的なコード問題ではなく、ブラウザ上で動くゲームアプリケーションへ広げる benchmark として提示されている。タイトルから見る限り、requirements から runnable web game application までの変換を評価する設計で、ゲームは UI、入力、状態遷移、描画、リスタート、スコアなどが同時に噛み合わないと失敗するため、agentic coding の総合テストベッドになっている。

既存候補の PlaytestArena / GUI Agents for Continual Game Generation が「生成されたゲームを GUI agent が遊んで評価する」寄りだったのに対し、WebGameBench は requirement-to-application の coding agent 評価として候補化する。Phase 2 では、既存 GameDevBench / PlaytestArena 候補との重複、評価 rubric の粒度、実行可能な benchmark assets の有無を確認する必要がある。

## why_relevant_to_games
ブラウザゲーム制作で「仕様文から実アプリまで」を評価する候補。Nao_u_BOT の game prototype に対して、要件、操作、画面変化、勝敗条件を分けて checklist 化する材料になりそう。
