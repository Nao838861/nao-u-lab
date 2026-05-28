---
title: "Agent-ToM: Learning to Monitor Autonomous LLM Agents via Theory-of-Mind Reasoning"
url: "https://arxiv.org/abs/2605.24216"
collected_at: "2026-05-28T15:14:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-agent, evaluation, theory-of-mind, safety, game-testing]
---

## raw_excerpt
arXiv 2605.24216。自律 LLM agent の監視では、悪意や逸脱が長い軌跡の後半に出る、または表面上は正常な行動に見えるため、単発 trajectory ごとの説明や ensemble だけでは検出しにくい、という問題設定。Agent-ToM は Theory-of-Mind に基づく monitoring framework として、agent の belief、intent hypothesis、expected action、task-consistent baseline からの deviation を構造化して見る。推論時は Reason-Verify-Refine pipeline、訓練時は critique signal を persistent semantic guardrail memory に蒸留し、episode をまたいで belief / intent 条件付き制約を再利用する。評価は SHADE-Arena / CUA-SHADE-Arena。短い原文メモ: "covert malicious behavior", "semantic guardrail memory"。

## why_relevant_to_games
AI プレイヤーや自動テスト agent の行動ログを「成功/失敗」だけでなく、意図・期待行動・逸脱として読める可能性がある。ゲーム内 NPC の不自然行動検出や、headless bot policy の失敗分類にも接続しやすい。
