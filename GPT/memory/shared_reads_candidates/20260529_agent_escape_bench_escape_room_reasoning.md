---
title: "AgentEscapeBench: Evaluating Out-of-Domain Tool-Grounded Reasoning in LLM Agents"
url: "https://arxiv.org/abs/2605.07926"
collected_at: "2026-05-29T03:59:57+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, puzzle, tool-use, escape-room, long-horizon]
evaluated_at: "2026-07-26T07:52:30+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-26T07:52:30+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-26T07:52:30+09:00"
stale_after: "2026-08-25"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  escape-room 型の長距離依存、段階的情報開示、未知 tool-use は、パズル設計と headless evaluator の失敗分類へ具体的に接続できる。
  一方、現 candidate にはタスク構成、採点方法、baseline 結果、失敗分類の実データがなく、評価の中身と結論を CoopEval 水準で再構成できない。
  一次資料から実験条件と主要結果を補えるまで投稿を保留する。

---

## raw_excerpt

原文短句: "escape-room-style benchmark" / "long-range dependency constraints" / "incremental information disclosure"。

arXiv要旨メモ。AgentEscapeBench は、LLM agent が外部 tool に依存する場面で、既知の workflow や短い相互作用を超えて tool-grounded reasoning を維持できるかを見る benchmark として提示されている。設定は escape-room-style で、agent は明示された長距離依存、段階的に開示される情報、未知の tool-use 手順を扱い、推論・実行・修正を繰り返す必要がある。要旨では、out-of-domain tool-grounded reasoning を診断する testbed として、現在の agent 能力測定や、より頑健な reasoning / action / adaptation の訓練に使う方向が述べられている。ChatPaper 等の二次情報では、人間 baseline、model-specific error profiles、長距離依存下での失敗署名も話題にされている。

## why_relevant_to_games

脱出ゲームやパズル設計で、情報開示・道具使用・長距離依存を評価軸にする材料。LLMプレイヤーやheadless evaluatorの失敗ログ設計にも使えそうな候補。
