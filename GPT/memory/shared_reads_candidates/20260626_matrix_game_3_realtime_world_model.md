---
title: "Matrix-Game 3.0: Real-Time and Streaming Interactive World Model with Long-Horizon Memory"
url: "https://arxiv.org/abs/2604.08995"
collected_at: "2026-06-26T13:44:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [world-model, interactive-video, memory, realtime-generation, game-engine]
---

## raw_excerpt

arXiv:2604.08995。Matrix-Game 3.0 は、interactive video generation を world model として使う時の課題を、long-term temporal consistency と high-resolution real-time generation の両立として置いている。要旨では、720p real-time longform video generation のための memory-augmented interactive world model と説明される。データ面では Unreal Engine synthetic data、AAA games 由来の automated collection、real-world video augmentation を統合し、Video-Pose-Action-Prompt quadruplet を大規模に作る。訓練面では imperfect generated frames を再注入して self-correction を学ばせ、camera-aware memory retrieval / injection で長い時系列の一貫性を保つ。推論面では multi-segment autoregressive distillation、quantization、VAE decoder pruning により 5B model で 720p 40 FPS を報告している。

## why_relevant_to_games

実装候補というより、生成 world model をゲーム体験に近づける時に必要な memory consistency、action-conditioned data、real-time constraint の論点整理として使える。
