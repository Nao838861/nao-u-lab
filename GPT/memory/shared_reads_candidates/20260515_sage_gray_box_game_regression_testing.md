---
title: "SAGE: Semantic-Aware Gray-Box Game Regression Testing with Large Language Models"
url: "https://arxiv.org/abs/2512.00560"
collected_at: "2026-05-15T23:29:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [playtesting, regression-testing, llm, reinforcement-learning, game-qa]
---

## raw_excerpt

arXiv:2512.00560。ライブサービス型ゲームの高速な反復では regression testing が不可欠だが、gray-box 環境ではソースコードに完全アクセスできず、手動 test case 作成、肥大化した suite の maintenance、更新に応じた relevant tests の prioritization が課題になる、という問題設定。SAGE は semantic-aware regression testing framework として、LLM-guided reinforcement learning による goal-oriented exploration で foundational test suite を作り、semantic-based multi-objective optimization で cost / coverage / rarity を balancing し、さらに update log の LLM semantic analysis で version changes に関係する test cases を優先する。Overcooked Plus と Minecraft で自動 baseline や human-recorded test cases と比較している。

## why_relevant_to_games

Nao_u 作品のバージョン更新時に「何を再テストすべきか」を update log から絞る発想として使える。小規模ゲームでも、差分駆動のテスト導線候補になる。
