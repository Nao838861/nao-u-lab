---
title: "Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics"
url: "https://arxiv.org/abs/1802.06881v1"
collected_at: "2026-06-25T07:29:33+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [playtesting, procedural-personas, mcts, player-modeling, evaluation]
---

## raw_excerpt
arXiv abstract notes:

The paper describes generative player modeling for automatic testing of game content using archetypal player models called procedural personas. These personas are implemented with a variation of Monte Carlo Tree Search, where evolutionary computation develops the node selection criteria instead of using the standard UCB1 criterion.

The authors use the personas to enact different play styles across a corpus of game levels, effectively constructing synthetic playtesters. The proposed use cases include automatic playtesting when human feedback is unavailable and quick visualization of potential player-content interactions. The paper also points to procedural content generation systems where many evaluations must be run in a short time.

Source lines: arXiv metadata and abstract, submitted 2018-02-19.

## why_relevant_to_games
headless 評価で「1 つの最適エージェント」だけを見るのではなく、複数のプレイ癖を持つ合成テスターを置く発想として収集する。
