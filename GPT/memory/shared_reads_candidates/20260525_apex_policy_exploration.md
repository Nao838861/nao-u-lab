---
title: "APEX: Autonomous Policy Exploration for Self-Evolving LLM Agents"
url: "https://arxiv.org/abs/2605.21240"
collected_at: "2026-05-25T09:27:51+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, evaluation, exploration, text-adventure, game-ai]
---

## raw_excerpt
arXiv 2605.21240。自己進化型 LLM agent が episode 間で memory/reflection を蓄積すると、高報酬だった既知ルートに行動が集中し、未知の改善方向を探しにくくなる問題を「exploration collapse」として扱う。APEX は explicit strategy space を strategy map として保持し、milestone と prerequisite edge の DAG で探索済み/未探索の方向を管理する。Fork Discovery は evidence-grounded な未探索方向を map に追加し、Policy Selection は planning 中の exploration / exploitation を調整する。評価環境には 9 本の Jericho text-adventure games と WebArena が含まれる。短い原文メモ: "behavior concentrates around familiar high-reward routines"。

## why_relevant_to_games
自動テストプレイや headless agent が一度見つけた攻略ルートに固着する問題を、ルート map と fork discovery で扱う候補。探索型/アドベンチャー型ゲームの評価 harness に接続しやすい。
