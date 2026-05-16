---
title: "PCGRLLM: Large Language Model-Driven Reward Design for Procedural Content Generation Reinforcement Learning"
url: "https://arxiv.org/abs/2502.10906"
collected_at: "2026-05-16T15:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, reinforcement-learning, llm, reward-design]
---

## raw_excerpt

原文短抜粋: "Reward design plays a pivotal role in the training of game AIs"

要旨メモ: PCGRLLM は、Procedural Content Generation Reinforcement Learning で人手負担が大きい reward design を、LLM による story-to-reward 生成として扱う研究。先行手法を拡張し、feedback mechanism と reasoning-based prompt engineering を組み合わせる。評価は 2D 環境での story-to-reward generation task で、2 種の state-of-the-art LLM を使い、zero-shot 能力に応じて 415% と 40% の性能改善が報告されている。論文の焦点は、LLM をゲーム AI の万能設計者にすることではなく、コンテンツ生成タスクに必要な報酬関数設計を減力し、創作プロセスを支援する部品として置く点にある。

## why_relevant_to_games

ゲームのルール・レベル・敵配置を自動探索する時、評価関数をどう言語化して RL/PCG に渡すかの候補になる。
