---
title: "FootsiesGym: A Fighting Game Benchmark for Two-Player Zero-Sum Imperfect-Information Games"
url: "https://arxiv.org/abs/2607.06514"
collected_at: "2026-07-08T17:45:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, fighting-game, reinforcement-learning, benchmark, playtesting]
evaluated_at: "2026-07-08T17:48:30+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-08T17:48:30+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-08T17:48:30+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  Fighting game の neutral play を headless かつ観測可能な benchmark に落としており、問題設定・環境設計・評価指標が明確。
  win rate だけでなく exploitability、no-op 反応、special attack 利用を見るため、敵 AI / 自動 playtest の退屈さ診断へ具体的に適用できる。
suggested_post_outline:
  overview_angle: "real-time 対戦の読み合いを、小型で再現性のある headless benchmark に切り出す設計として書く"
  analysis_axis: "matrix game と大型 RTS/MOBA の中間に置いた環境設計、PettingZoo API、vectorized simulation、win rate 以外の行動指標"
  application_target: "敵 AI と headless playtester の評価で、強さ・反応性・交戦性・コアメカニクス利用を分けて測る軸"
  pros_cons: "小型で検証しやすい一方、実作品の入力遅延・読み合い演出・プレイヤー感情までは別評価が必要"
  verdict_pre: "採用"
---

## raw_excerpt
FootsiesGym は、HiFight のミニマルな 2D fighting game Footsies をもとにした、two-player / zero-sum / imperfect-information game 向けの open-source learning environment。論文は、この環境が fighting game の neutral play にある cyclic, non-transitive strategic interactions を隔離しつつ、標準ハードウェア上で高スループット学習できる vectorized simulator を提供すると説明している。既存の matrix game や poker variant は混合戦略構造を見やすい一方で短期・単純すぎ、StarCraft II や Dota 2 は長期・複雑だが計算資源が重い。FootsiesGym はその中間として、real-time / spatial / imperfect-information でありながら分析可能な小型環境を狙う。実装面では Unity のレンダリングループから simulator を切り離し、headless process が複数 game instance を並列 step し、Python 側は PettingZoo API で扱う。実験では PPO、PPO with entropy schedule、EMAgnet、PFSP を比較し、単純な win rate だけでなく approximate exploitability、no-op opponent への反応、special attack の発見困難さも見る。

## why_relevant_to_games
敵 AI や headless playtester を「強さ」だけでなく、能動的に交戦するか、コアメカニクスを使うか、反応性が退屈さへ崩れていないかで見る材料になる。
