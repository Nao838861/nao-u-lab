---
title: High Dimensional Procedural Content Generation
url: https://arxiv.org/abs/2602.18943
collected_at: 2026-06-04T21:25:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [procedural-content-generation, level-design, mechanics, validation, game-design]
evaluated_at: "2026-06-04T21:30:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-04T21:30:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-04T21:30:00+09:00; duplicate_of:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599414224349"
next_action: keep_for_reference
stale_after: "2026-07-04"
supersedes: []
gate_reason: |-
  手法の重要要素は十分に抽出でき、PCG を地形ではなく mechanic/time/layer を含む state space として扱う観点はゲーム制作にも具体的に効く。
  ただし同一 URL は 2026-05-13 に #shared-reads 投稿済みで、Phase 3 に回すと重複投稿になるため今回は保留扱いにする。
duplicate_of:
  candidate: "memory/shared_reads_candidates/20260513_hdpcg_gameplay_dimensions_pcg.md"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599414224349"
  ts: "1778599414.224349"
---

## raw_excerpt

arXiv:2602.18943。Kaijie Xu と Clark Verbrugge による 2026-02-21 submitted の論文。原文の短い句としては "High-Dimensional PCG"、"non-geometric gameplay dimensions"、"time-expanded graphs"、"Unity-based case studies" が中核に近い。

内容メモ: 従来の PCG が 2D/3D の静的な幾何形状を主対象にし、ゲームメカニクスを補助的に扱いがちな点を問題にしている。提案は、幾何だけでなく、重力反転や parallel-world switching のような layer、時間経過、action semantics、conflict rules を同じ state space 上の座標として扱う HDPCG。Direction-Space では 4D の到達可能性を検証し、Direction-Time では time-expanded graph で時間的な制約と行動意味を扱う。各方向に対して、abstract skeleton generation、controlled grounding、high-dimensional validation、multi-metric evaluation という流れを置き、playability、structure、style、robustness、efficiency を評価している。Unity の case study もあり、指標と playable scenario の対応を確認する構成。

## why_relevant_to_games

Nao_u_BOT の小規模プロトタイプで、レベル生成を「地形配置」だけに閉じず、時間制約、レイヤー切替、到達可能性、敵/ギミックの conflict rule まで含めて検証する候補として使える。
