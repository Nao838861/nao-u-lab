---
title: "Solvable Sokoban Without a Solver via Diffusion"
url: "https://arxiv.org/abs/2608.15958"
collected_at: "2026-08-18T17:02:12+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, puzzle, procedural-content-generation, diffusion-model, level-design]
evaluated_at: "2026-08-18T17:08:26+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-18T17:08:26+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-18T17:08:26+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-17"
supersedes: []
gate_reason: >-
  壊れやすい大域制約を局所的な tile completion 学習から獲得するという問題設定・着想・手法と、
  77.4% の可解率および失敗の 94.5% を壁 1 枚の除去で修復できる評価が揃う。PCG の生成順序、
  solver 非依存の候補生成、最小修復というゲーム制作上の具体場面へ接続でき、約 4000 字の分析に耐える。
suggested_post_outline:
  overview_angle: "局所補完だけを学んだ生成器から、探索を要する可解性が創発した仕組みと評価を整理する"
  analysis_axis: "固定順序の自己回帰と任意位置集合へ条件付ける masked diffusion の構造差、および可解率と一壁修復率が示す限界"
  application_target: "パズル・配置型ゲームの PCG で、生成順序に依存しない候補生成と、検証失敗時の最小編集 repair loop を設計する場面"
  pros_cons: "solver・報酬・可解性ラベルなしで高い可解率を得る一方、22.6% はそのままでは不可解であり、公開評価だけでは難易度・多様性・人間品質を保証しない"
  verdict_pre: "部分採用"
---

## raw_excerpt

> "Solvability is also a fragile property, since even a single misplaced wall can silently render an entire puzzle unsolvable."

arXiv abstract からの取得時要点（逐語引用は上記1文のみ）: Sokoban の可解性判定は PSPACE-complete で、解が指数的に長くなり得るうえ、壁を1枚ずらすだけでも盤面全体が解けなくなる。研究は solver、reward、可解性 label を与えず、tile completion だけで学習した transformer-based discrete diffusion model を用いる。生成盤面の 77.4% が可解で、残る失敗の 94.5% も壁を1枚除くと可解になったと報告する。自己回帰生成が固定順序の prefix に条件付けるのに対し、masked diffusion は任意位置の既配置 tile 集合を条件に cell を埋められるため、盤面の離れた位置同士が制約し合う puzzle 構造と対応する、という説明が置かれている。学習 pipeline は MD4 を基にし、dataset は DeepMind の Boxoban を使う。model と生成手順も公開されている。

## why_relevant_to_games

パズル level の「見た目の局所妥当性」と「実際に解けるという大域制約」をどう両立するかを扱っており、PCG の生成順序・検証器・失敗盤面の最小修復を検討する場面に接続できる。
