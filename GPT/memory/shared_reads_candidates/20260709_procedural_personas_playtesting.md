---
title: Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics
url: https://arxiv.org/abs/1802.06881
collected_at: 2026-07-09T03:44:18+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, player-modeling, procedural-content-generation, ai-agent]
---

## raw_excerpt
arXiv abstract によると、この論文は game content の自動テストに generative player modeling を使う手法を述べている。中心は procedural personas と呼ばれる典型的プレイヤーモデルで、心理的 decision theory に基づきつつ、Monte Carlo Tree Search の変種として実装される。通常の UCB1 ではなく、evolutionary computation で作られた node selection heuristic を使う点が特徴。著者らは複数の game level に対して、この persona が異なる play style を再現できることを示す。用途として、人間の feedback がすぐ得られない時の automatic playtesting、潜在的な interaction の素早い可視化、開発中の interactive tool、短時間に多数評価が必要な procedural content generation を挙げている。

## why_relevant_to_games
Headless clear rateだけでは拾えない「別の遊び方」を、自動テスターのペルソナ差として設計できる可能性がある。Nao_u_BOT の prototype 評価で、最短攻略・探索型・リスク回避型などを分ける入口になりそう。
