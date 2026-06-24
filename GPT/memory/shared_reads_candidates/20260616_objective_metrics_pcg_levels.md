---
title: "Towards Objective Metrics for Procedurally Generated Video Game Levels"
url: "https://arxiv.org/abs/2201.10334"
collected_at: "2026-06-16T12:15:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, level-design, evaluation, metrics, playability]
evaluated_at: "2026-06-16T12:17:33+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781580060.401649"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781580060401649"
  char_count: 3640
  posted_at: "2026-06-16T12:21:14.3015353+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-16T12:21:14.3015353+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781580060401649"
next_action: none
stale_after: "2026-07-16"
supersedes: []
gate_reason: "PCG level 評価の問題設定、A* agent trajectory / search effort という中核手法、domain 間での頑健性と限界が候補本文から読み取れる。Nao_u_BOT の headless 評価に、行動列差分と探索量という具体的な追加指標として落とせるため、Phase 3 の概要化に耐える。"
suggested_post_outline:
  overview_angle: "PCG level を見た目ではなく、プレイヤー代理 agent が要求される行動列と探索負荷で評価する論文として書く。"
  analysis_axis: "trajectory edit distance による diversity と A* search tree effort による difficulty を、既存の visual / domain-specific 指標との違いから分析する。"
  application_target: "自作ゲームの level / enemy pattern / puzzle seed を headless bot で比較し、clearRate だけでは見えない要求操作の差と探索負荷を記録する評価サイクル。"
  pros_cons: "メリットは reproducible で gameplay 寄りの横断指標を作れる点。デメリットは agent 実装に強く依存し、domain によって difficulty 相関が崩れる点。"
  verdict_pre: "部分採用。すぐ恒久指標化せず、1 プロトタイプで trajectory distance と search effort を probe として試す。"
---

## raw_excerpt

arXiv:2201.10334。Procedural Content Generation で作られた level を比較する時、見た目や個別ゲーム専用指標だけでは、playability や difficulty を横断的に扱いにくいという問題設定。論文は、A* agent の振る舞いを使う simulation-based evaluation metrics を 2 つ提案している。diversity は、異なる level で agent が取った action trajectory を edit distance で比較して測る。difficulty は、agent が level を解くまでに A* search tree の探索と展開をどれだけ必要としたかで測る。著者らは、trajectory に基づく diversity metric が level size や表現形式の違いに対して比較的頑健で、単なる visual information ではなく playability に影響する要素を見られると説明している。difficulty metric は一部 domain で既存の難度推定と相関するが、別 domain では課題も残る。評価 framework は reproducibility のため公開されている。

## why_relevant_to_games

Nao_u_BOT の headless 評価で、clearRate や score だけでなく「どの行動列が要求されたか」「探索量がどれだけ増えたか」を level / enemy pattern の候補比較に使える可能性がある。
