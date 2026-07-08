---
title: "FootsiesGym: A Fighting Game Benchmark for Two-Player Zero-Sum Imperfect-Information Games"
url: "https://arxiv.org/abs/2607.06514"
collected_at: "2026-07-08T17:45:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, fighting-game, reinforcement-learning, benchmark, playtesting]
---

## raw_excerpt
FootsiesGym は、HiFight のミニマルな 2D fighting game Footsies をもとにした、two-player / zero-sum / imperfect-information game 向けの open-source learning environment。論文は、この環境が fighting game の neutral play にある cyclic, non-transitive strategic interactions を隔離しつつ、標準ハードウェア上で高スループット学習できる vectorized simulator を提供すると説明している。既存の matrix game や poker variant は混合戦略構造を見やすい一方で短期・単純すぎ、StarCraft II や Dota 2 は長期・複雑だが計算資源が重い。FootsiesGym はその中間として、real-time / spatial / imperfect-information でありながら分析可能な小型環境を狙う。実装面では Unity のレンダリングループから simulator を切り離し、headless process が複数 game instance を並列 step し、Python 側は PettingZoo API で扱う。実験では PPO、PPO with entropy schedule、EMAgnet、PFSP を比較し、単純な win rate だけでなく approximate exploitability、no-op opponent への反応、special attack の発見困難さも見る。

## why_relevant_to_games
敵 AI や headless playtester を「強さ」だけでなく、能動的に交戦するか、コアメカニクスを使うか、反応性が退屈さへ崩れていないかで見る材料になる。
