---
title: Q-based Variational Inverse Reinforcement Learning
url: https://arxiv.org/abs/2608.16888
collected_at: "2026-08-19T05:31:37+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, inverse-reinforcement-learning, player-modeling, evaluation, uncertainty]
---

## raw_excerpt

人間の好みを報酬関数として手作業で完全に記述することは難しいため、著者らは専門家の行動デモから報酬を推定する inverse reinforcement learning を扱う。提案法 Q-based Variational IRL（QVIRL）は、報酬そのものを直接近似する代わりに、最適 Q 値上の変分分布を主に学習し、そこから報酬の事後分布を復元する Bayesian IRL 手法である。狙いは、大規模化しやすい推定と不確実性の定量化を同時に成立させ、デモが不足している局面を見分ける active learning にも接続することにある。評価は gridworld、Lunar Lander、Highway Environment、2 種類の ATARI game を含む apprenticeship learning task で行われ、固定された expert data と active learning の双方を試している。著者らは、raw pixel observation から学習する Bayesian IRL を示した最初の手法だとしている。

## why_relevant_to_games

プレイヤーや熟練 bot の軌跡から「何を良いプレイとみなしたか」を推定し、その確信度まで保持するため、模倣型 game AI、playtest bot、難易度調整の設計材料になる。
