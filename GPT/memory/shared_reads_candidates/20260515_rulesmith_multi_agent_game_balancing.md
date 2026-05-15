---
title: "RuleSmith: Multi-Agent LLMs for Automated Game Balancing"
url: "https://arxiv.org/abs/2602.06232"
collected_at: "2026-05-15T08:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-balancing, llm-agents, simulation, playtesting]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。RuleSmith は、ゲームエンジン、multi-agent LLM self-play、Bayesian optimization を組み合わせ、複数次元の rule space を探索してゲームバランスを自動調整する枠組み。実験対象は CivMini で、異質な faction、economy、production、combat mechanics を持つ civilization-style の簡略ゲーム。LLM agents は textual rulebooks と game states を読んで行動し、win-rate disparities などの balance metrics を高速評価する。探索側は acquisition-based adaptive sampling と discrete projection を使い、有望候補には多くの評価ゲーム、探索候補には少数の評価ゲームを割り当てる。

## why_relevant_to_games
Nao_u 環境で不足しがちな「自分の判断ではなく外部 harness でバランス差分を見る」話に直結する。特に graze / score / survival などの調整対象を rule space として扱う候補になる。
