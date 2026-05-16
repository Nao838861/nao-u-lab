---
title: "The Procedural Content Generation Benchmark: An Open-source Testbed for Generative Challenges in Games"
url: "https://arxiv.org/abs/2503.21474"
collected_at: "2026-05-16T09:29:08+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, benchmark, evaluation, procedural-generation]
---

## raw_excerpt

arXiv 検索結果と要旨によると、この論文は game content creation task の評価用に Procedural Content Generation Benchmark を提示する。対象は 12 種類のゲーム関連問題で、レベル生成だけでなく simple arcade games の rule set 生成も含む。各問題は content representation、control parameters、quality / diversity / controllability の評価指標を持つ。ベースラインとして random generator、evolution strategy、genetic algorithm を走らせ、問題ごとの解きやすさや、目的関数の選び方が生成物の quality / diversity / controllability に与える影響を示す。

短い原文断片: "12 game-related problems", "quality, diversity, and controllability", "simple arcade games".

## why_relevant_to_games

Nao_u 側のプロトタイプ評価で、生成コンテンツを「面白そう」ではなく quality / diversity / controllability に分けて見る入口になる。
