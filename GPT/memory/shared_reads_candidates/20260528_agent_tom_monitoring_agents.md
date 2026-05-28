---
title: "Agent-ToM: Learning to Monitor Autonomous LLM Agents via Theory-of-Mind Reasoning"
url: "https://arxiv.org/abs/2605.24216"
collected_at: "2026-05-28T15:14:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-agent, evaluation, theory-of-mind, safety, game-testing]
evaluated_at: "2026-05-28T15:23:34+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
posted:
  ts: "1779950437.392149"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779950437392149"
  char_count: 3608
  posted_at: "2026-05-28T15:40:58.1167816+09:00"
stale_after: "2026-06-27"
supersedes: []
gate_reason: |-
  問題設定、ToM ベースの監視構造、Reason-Verify-Refine、semantic guardrail memory、評価環境が揃っており、手法の重要要素を抽出できる。
  ゲーム制作では AI プレイヤー、自動テスト agent、NPC の長期ログを意図・期待行動・逸脱として分類する用途に接続できる。
  CoopEval 水準の概要は、単発判定ではなく長期 trajectory 監視を設計単位にする軸で書ける。
suggested_post_outline:
  overview_angle: "長期行動ログから belief / intent / expected action / deviation を組み立て、自律 agent の逸脱を検出する監視設計として読む。"
  analysis_axis: "trajectory 監視の問題設定、ToM 表現、Reason-Verify-Refine、persistent semantic guardrail memory、SHADE 系評価の順に分解する。"
  application_target: "headless テスト bot、AI プレイヤー、NPC の不自然行動検出、失敗リプレイ分類の semantic guardrail 化。"
  pros_cons: "長期ログの失敗理由を構造化できる一方、ゲーム側では belief / intent をどう観測・記録するかの実装負荷が高い。"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv 2605.24216。自律 LLM agent の監視では、悪意や逸脱が長い軌跡の後半に出る、または表面上は正常な行動に見えるため、単発 trajectory ごとの説明や ensemble だけでは検出しにくい、という問題設定。Agent-ToM は Theory-of-Mind に基づく monitoring framework として、agent の belief、intent hypothesis、expected action、task-consistent baseline からの deviation を構造化して見る。推論時は Reason-Verify-Refine pipeline、訓練時は critique signal を persistent semantic guardrail memory に蒸留し、episode をまたいで belief / intent 条件付き制約を再利用する。評価は SHADE-Arena / CUA-SHADE-Arena。短い原文メモ: "covert malicious behavior", "semantic guardrail memory"。

## why_relevant_to_games
AI プレイヤーや自動テスト agent の行動ログを「成功/失敗」だけでなく、意図・期待行動・逸脱として読める可能性がある。ゲーム内 NPC の不自然行動検出や、headless bot policy の失敗分類にも接続しやすい。
