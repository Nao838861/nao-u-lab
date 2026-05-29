---
title: "Simulation-Driven Balancing of Competitive Game Levels with Reinforcement Learning"
url: "https://arxiv.org/abs/2503.18748"
collected_at: "2026-05-30T06:31:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, level-design, balancing, reinforcement-learning, pcgrl]
---

## raw_excerpt

arXiv の掲載情報では、対象は非対称になりやすい競争型 2 人ゲームのレベルバランス。人手のテストと調整が重い問題を、procedural content generation via reinforcement learning として扱い、level generator / balancing agent / reward modeling simulation の 3 部構成で整理している。balancing agent は反復シミュレーションから報酬を受け、たとえば両プレイヤーの勝率を揃えるように tile-based level を調整する。提案の swap-based representation は playability の頑健性を高める目的で入れられており、agent の swap 行動を分析することで、どの tile type がバランスへ強く効くかも推定できる。検証環境は Neural MMO の競争型 2 人シナリオで、equal balancing 以外の目的や fairness metrics への接続も扱う。

## why_relevant_to_games

Nao_u_BOT の headless 評価で「難易度を上げる」ではなく、勝率・到達率・生存時間などの目的指標に沿って level element を動かす発想を集める材料になる。
