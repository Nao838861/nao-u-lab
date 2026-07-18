---
title: "Flow-aware Optimal Navigation in Unsteady Flows through Reinforcement Learning"
url: "https://arxiv.org/abs/2607.13553v1"
collected_at: "2026-07-19T03:30:53+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [reinforcement-learning, navigation, partial-observability, game-ai, sensor-design]
---

## raw_excerpt

時間変化し予測しにくい流体中の自律 navigation を、事前の global flow map なしで解く研究である。parametric で chaotic な double-gyre flow 内の任意 target 到達を TD3 で学習し、相対位置、局所 velocity、局所 vorticity、それらの短期 memory を組み合わせた五つの bio-inspired observation strategy を比較する。さらに、環境全体の flow parameter を agent に明示する条件も調べている。

数値実験では、複数の局所 velocity measurement を感知して一定期間覚える agent が最も高い性能を示した。sensor ごとの役割には差があり、velocity-aware agent は energy efficiency に優れ、vorticity sensor は流れの構造 mapping と target への近接で優れた。一方、global flow parameter を明示的に与えると navigation performance は低下した。限られた局所観測と短期 memory から implicit representation を作らせる方が、変動環境に対して頑健で一般化した policy になる可能性が示されている。

## why_relevant_to_games

風・流体・群れ・移動床など時間変化する場での NPC 移動を、完全な world state ではなく局所 sensor と短期履歴で設計する際の observation 比較と、効率・接近精度を分けた評価軸に使える。
