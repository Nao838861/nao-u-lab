---
title: "RevengeBench: Reverse Engineering Code-Space Policies from Behavioral Experiments"
url: "https://arxiv.org/abs/2606.26094v1"
collected_at: "2026-06-26T01:44:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, game-ai, behavioral-probes, opponent-modeling, headless]
evaluated_at: "2026-06-26T01:50:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-26T01:50:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-26T01:50:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-26"
supersedes: []
gate_reason: >-
  問題設定は「行動トレースだけから隠れた意思決定プログラムを実行可能コードとして復元できるか」で明確。
  custom opponent policy による behavioral probe、executable hypothesis、action-distance と PvP tournament signal という評価軸があり、手法の中核と評価の中身を切り出せる。
  headless playtest での bot/opponent policy 診断や、プレイヤー方策を引き出す probe 設計に具体的に転用できるため、CoopEval 水準の概要化に耐える。
suggested_post_outline:
  overview_angle: "ゲーム内行動ログを受動観測で終わらせず、相手方策を引き出す実験設計まで含めて hidden policy を復元する benchmark として書く。"
  analysis_axis: "CodeClash 由来の 5 game environments / 75 Elo-calibrated policies、custom opponent probes、executable recovered policy、continuous action-distance と downstream PvP signal を分けて分析する。"
  application_target: "Nao_u_BOT 側の headless playtest、bot 方策診断、相手やプレイヤーの隠れた癖を検出する probe 設計に効く。"
  pros_cons: "メリットはログ評価を方策復元と反証可能なコード仮説へ進められる点。デメリットは game environment と policy が code-space に限定され、実プレイヤー心理や視覚入力までは直接扱わない点。"
  verdict_pre: "部分採用。shared-reads では評価 benchmark として紹介し、制作実務では opponent-modeling probe の設計原則だけ小さく試す。"
---

## raw_excerpt

arXiv:2606.26094v1。2026-06-24 submitted。対象は、ゲーム環境内で観測される行動トレースだけから、隠れた agent policy の意思決定プログラムを実行可能コードとして復元できるかを扱う benchmark。著者らは、CodeClash tournament trajectories 由来の 5 種類の game environment と 75 個の LLM-generated / Elo-calibrated policy を用意し、学習側 agent が対象 policy の対戦ログを観測するだけでなく、情報を引き出す custom opponent policy を設計して behavioral probe を行える設定にしている。

原文の核は、"given only behavioral traces of an agent in a game environment" から underlying decision program を reconstruct する問い、custom opponent policies で informative behavior を elicitation する設計、そして executable hypothesis を continuous action-distance metrics と downstream PvP tournament signal で評価する点にある。12 frontier LLMs の比較では、initial distance の 34-72% を閉じる範囲で recovery quality に差が出ると説明されている。

## why_relevant_to_games

headless評価で「botが通った/失敗した」だけを見るのではなく、相手やプレイヤーの方策を引き出すprobeを設計し、行動ログから隠れたpolicyを復元する観点として使える。
