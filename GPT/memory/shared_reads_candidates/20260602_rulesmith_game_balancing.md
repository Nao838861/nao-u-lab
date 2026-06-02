---
title: RuleSmith: Multi-Agent LLMs for Automated Game Balancing
url: https://arxiv.org/abs/2602.06232
collected_at: 2026-06-02T13:59:22.2815508+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, balancing, llm-agent, self-play, bayesian-optimization]
---

## raw_excerpt
arXiv 2602.06232。原文断片: "Game balancing is a longstanding challenge requiring repeated playtesting"。RuleSmith は、game engine、multi-agent LLM self-play、Bayesian optimization を組み合わせ、multi-dimensional rule space 上でゲームバランスを探索する枠組み。概念実証では CivMini という civilization-style game を使い、faction、economy、production、combat mechanics を tunable parameters として扱う。LLM agents は textual rulebooks と game states を読んで行動し、win-rate disparities などの balance metrics を評価する。探索では acquisition-based adaptive sampling と discrete projection を使い、有望候補には評価ゲーム数を多く、探索候補には少なく割り当てる。結果として balanced configurations と interpretable rule adjustments が得られるとされる。

## why_relevant_to_games
小型プロトタイプで敵数・弾速・報酬倍率などを調整するとき、単なる平均スコアではなく「候補ごとの評価ゲーム配分」を作る参考になる。
