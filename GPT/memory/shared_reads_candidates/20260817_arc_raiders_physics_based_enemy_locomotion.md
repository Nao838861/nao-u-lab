---
title: "Learning to Move: Physics-Based Enemy Locomotion in 'ARC Raiders'"
url: "https://schedule.gdconf.com/session/learning-to-move-physics-based-enemy-locomotion-in-arc-raiders/917319"
collected_at: "2026-08-17T09:31:41+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, reinforcement-learning, physics, animation, enemy-design, production]
---

## raw_excerpt

GDC Festival of Gaming 2026 のセッション概要によると、Embark Studios は『ARC Raiders』の敵移動を、animation clip や hand-tuned logic だけで組み立てるのではなく、animation、reinforcement learning、physics-based control を組み合わせて学習させた。対象となる行動は歩行、走行、よろめき、戦闘で、各 motion は個別 script ではなく経験から現れるようにしたと説明されている。agent の perception には point cloud を使い、周囲を見て反応する移動へ接続する。講演は Unreal Engine 上での学習済み agent の訓練と配備、高精細な action game で responsiveness と stability を両立する際の課題、大規模 production game へ learned locomotion を統合した際の lesson を扱う。登壇者は Embark Studios の Machine Learning Research Lead、Martin Singh-Blom。GDC の案内では、最先端の reinforcement learning research を、実時間で動く character animation と出荷済みゲームへ橋渡しした事例として位置づけられている。

## why_relevant_to_games

敵の motion・物理反応・知覚・戦闘 intent を同じ production system に接続する事例として、敵挙動設計と headless / runtime 検証の観点を拾える。学習済み挙動を Unreal Engine の実ゲームへ統合する際の responsiveness と stability の扱いも、ゲーム AI 実装時の参照候補になる。
