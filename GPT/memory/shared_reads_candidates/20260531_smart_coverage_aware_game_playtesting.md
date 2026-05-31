---
title: "Synergizing Code Coverage and Gameplay Intent: Coverage-Aware Game Playtesting with LLM-Guided Reinforcement Learning"
url: "https://arxiv.org/abs/2512.12706"
collected_at: "2026-05-31T13:29:20.9041162+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, reinforcement-learning, code-coverage, llm-agent, update-testing]
---

## raw_excerpt
arXiv 2512.12706。2025-12-14 submitted。Games as a Service 的な高頻度更新では QA 圧が高まる、という問題設定。短い原文抜粋: "code-centric methods focus on structural coverage"。SMART は、AST diff を LLM が解釈して functional intent を抽出し、modified code branches を探索する RL agent の reward に混ぜる構成。既存手法が code coverage と gameplay intent を分断しがちな点に対して、Structural Mapping for Augmented Reinforcement Testing として structural verification と functional validation を同時に狙う。評価環境は Overcooked と Minecraft。abstract では modified code の branch coverage 94% 超、task completion rate 98% と報告している。

## why_relevant_to_games
プロトタイプ改修ごとの「どの差分を踏ませるべきか」を headless 評価に落とす時、ゲーム内目的とコード差分 coverage を分けずに扱う発想源になる。
