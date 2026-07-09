---
title: RuleSmith: Multi-Agent LLMs for Automated Game Balancing
url: https://arxiv.org/html/2602.06232v1
collected_at: 2026-07-09T19:29:15+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, balancing, llm-agents, simulation, pcg]
---

## raw_excerpt
短い原文フレーズ: "automated game balancing" / "evaluate and refine game designs" / "optimized game parameters"。

RuleSmith は、LLM と multi-agent 評価を使ってゲームパラメータのバランス調整を自動化する方向の研究。関連研究では、AI-based playtesting がボードゲームやトレーディングカードゲームの balance 評価に使われ、人間プレイテストのコスト削減に寄与してきた流れが整理されている。さらに、強化学習や scripted agents が commercial video games の edge case や balance issue を見つけるために使われた事例、Bayesian optimization による連続パラメータ調整、multi-fidelity optimization による評価予算配分、PCG / PCGML / player-aware PCG との接続が説明されている。

論文の主題は、ゲームデザイン、最適化手法、調整されたパラメータ、rollout 分析を通じて、balanced parameters が評価設定をまたいで転移する条件も見ること。ゲームバランスを「感覚的に直す」だけでなく、複数 agent の rollout と目的関数で探索する素材として読める。

## why_relevant_to_games
シューティングの敵弾頻度、ローグライクの報酬量、パズルの手数など、Nao_u_BOT の小規模ゲームで数値調整を probe 化する時の候補になる。
