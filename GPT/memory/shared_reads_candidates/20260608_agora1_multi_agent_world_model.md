---
title: "Agora-1: The Multi-Agent World Model"
url: "https://odyssey.ml/introducing-agora-1"
collected_at: "2026-06-08T02:14:51+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, world-models, multi-agent, simulation, reinforcement-learning]
---

## raw_excerpt
Odyssey が 2026-05-18 に公開した Agora-1 の紹介記事。従来の world model は単一参加者が simulated world に入る形が多かったのに対し、Agora-1 は最大 4 人が同じ generated world 内で real time に相互作用する multi-agent world simulation として説明されている。探索対象は GoldenEye 風の shared deathmatch simulation。各 participant が同時に同じ world state に作用し、モデルは player actions から interaction を simulating し、各 player に generated pixels を streaming する。

構造上のポイントは、simulation と rendering の分離。記事では、game state の時間発展を学ぶ model と、shared state から視覚表示を生成する DiT-based rendering model の二つを置く。原文短句: "decoupling simulation and rendering"。このため、複数視点から同一 world を整合的に見せること、内部 game state を直接操作して新しい levels を作ること、multi-agent RL の training data を open-ended interaction から増やすことが狙いとして並ぶ。記事は research preview と位置づけており、ゲームだけでなく robotics や multi-view simulation への拡張も示唆している。

## why_relevant_to_games
リアルタイム game engine そのものとして使えるかは別として、simulation state と rendering を分けて「複数 agent が同じ世界を共有する」設計の参考になる。
