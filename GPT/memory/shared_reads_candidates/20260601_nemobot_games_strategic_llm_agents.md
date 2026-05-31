---
title: "Nemobot Games: Crafting Strategic AI Gaming Agents for Interactive Learning with Large Language Models"
url: "https://arxiv.org/abs/2604.21896"
collected_at: "2026-06-01T03:45:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-agents, strategic-games, ai-education, game-ai]
---

## raw_excerpt
原文要旨メモ。Nemobot Games は、LLM を使った strategic game agent の作成・調整・展開を、ユーザーが触れる interactive agentic engineering environment として扱う論文。Claude Shannon の game-playing machine taxonomy を拡張し、LLM-powered agent を複数タイプのゲームへ適用する。対象は、dictionary-based games、厳密に解ける games、heuristic-based games、learning-based games の 4 類型。dictionary-based games では state-action mapping を圧縮し、厳密に解ける games では数学的推論で optimal strategy を計算し、heuristic-based games では minimax などの古典的手法と crowd-sourced data を組み合わせ、learning-based games では RLHF や self-critique を使って trial-and-error で戦略を改善する、という整理になっている。

Nemobot の主眼は、LLM にゲームを一度だけプレイさせることではなく、game agent の logic を人間が調整し、tool-augmented generation や fine-tuning を試しながら戦略を反復改善する環境を作ることにある。strategic games から role-playing games までを視野に入れ、crowdsourced learning と human creativity を組み合わせて、agent が自分の戦略ロジックを更新していく self-programming AI の方向を示している。

## why_relevant_to_games
小規模ゲームの AI opponent / tutorial agent / 自動テスト agent を、固定ルール実装ではなく「どの戦略類型として設計するか」から分ける材料になる。
