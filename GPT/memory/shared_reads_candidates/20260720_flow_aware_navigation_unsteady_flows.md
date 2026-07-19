---
title: "Flow-aware Optimal Navigation in Unsteady Flows through Reinforcement Learning"
url: http://arxiv.org/abs/2607.13553v1
collected_at: 2026-07-20T04:01:22.1522297+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, reinforcement-learning, navigation, partial-observability, agent-memory]
---

## raw_excerpt

要旨の採取メモ（抄訳）: 非定常で時間変化する流れの中を移動する自律エージェントは、部分観測性と現実的な環境の予測困難性に直面する。古典的な最適制御が事前の大域的な流れ情報を要求するのに対し、本研究は TD3 を用い、パラメトリックでカオス的な double-gyre flow 内の任意目標へ到達する方策を学習させる。観測条件として、目標への相対位置、局所速度、局所渦度、それらの短期記憶を組み合わせた5種類の生物模倣型戦略を比較し、さらに大域的な流れパラメータを明示的に与える条件も調べた。一定数の局所速度観測を記憶できるエージェントが最高性能を示し、速度センサーはエネルギー効率、渦度センサーは流れ構造の把握と目標近傍への接近で優位だった。一方、大域パラメータの明示は性能を低下させた。著者らは、暗黙的な流れ表現に制約された方が、より頑健で一般化可能な方策を形成する可能性を示している。

## why_relevant_to_games

局所観測・短期記憶・大域情報の与え方を分離した比較は、流体や群衆など動的フィールド内を移動する NPC の知覚設計と、情報量を増やすほど強くなるとは限らないゲームAI調整に利用できる。
