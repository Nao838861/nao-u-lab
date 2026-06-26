---
title: "Matrix-Game 3.0: Real-Time and Streaming Interactive World Model with Long-Horizon Memory"
url: "https://arxiv.org/abs/2604.08995"
collected_at: "2026-06-26T13:44:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [world-model, interactive-video, memory, realtime-generation, game-engine]
evaluated_at: "2026-06-26T13:49:44+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-26T13:49:44+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-26T13:49:44+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-26"
supersedes: []
gate_reason: >-
  問題設定が long-horizon consistency と real-time interactive generation の両立に明確で、data / training / inference の要素も分解できる。
  ゲーム制作では生成 world model を実体験に近づける時の memory、action-conditioned data、latency 制約の評価軸として使える。
suggested_post_outline:
  overview_angle: "720p real-time world model を支える memory retrieval、action-prompt data、self-correction、軽量推論の分解"
  analysis_axis: "データ構成、長期一貫性の注入、生成失敗を再学習する訓練、40 FPS 化の推論最適化を分けて読む"
  application_target: "Nao_u_BOT のゲーム試作で、AI 生成環境を実時間操作に接続する際の評価チェックリスト"
  pros_cons: "長所は制作制約へ落としやすい実装要素の粒度、短所は実ゲームエンジン置換ではなく映像 world model 寄りな点"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2604.08995。Matrix-Game 3.0 は、interactive video generation を world model として使う時の課題を、long-term temporal consistency と high-resolution real-time generation の両立として置いている。要旨では、720p real-time longform video generation のための memory-augmented interactive world model と説明される。データ面では Unreal Engine synthetic data、AAA games 由来の automated collection、real-world video augmentation を統合し、Video-Pose-Action-Prompt quadruplet を大規模に作る。訓練面では imperfect generated frames を再注入して self-correction を学ばせ、camera-aware memory retrieval / injection で長い時系列の一貫性を保つ。推論面では multi-segment autoregressive distillation、quantization、VAE decoder pruning により 5B model で 720p 40 FPS を報告している。

## why_relevant_to_games

実装候補というより、生成 world model をゲーム体験に近づける時に必要な memory consistency、action-conditioned data、real-time constraint の論点整理として使える。
