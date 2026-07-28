---
title: "Multi-Task Learning for Heterogeneous Prediction from Video Game State with Transfer Learning"
url: "https://arxiv.org/abs/2607.21290v1"
collected_at: "2026-07-29T06:17:45+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-analytics, player-modeling, multi-task-learning, transfer-learning, telemetry]
---

## raw_excerpt

> Multi-task learning (MTL) is a promising approach for prediction tasks derived from video game state data, as modern game telemetry provides multiple related supervision signals from the same structured observations. We study whether a shared model trained jointly across tasks in team-based multiplayer games can improve generalization while reducing training and inference cost compared to specialized single-task models. We adapt a multimodal architecture for endpoint prediction to a general multi-task setting that combines rasterized vision inputs, global match context, and per-unit state information through an image encoder and attention-based interaction modeling. Experiments on a large proprietary World of Tanks dataset compare single-task and multi-task training, evaluate weighting strategies for mixed losses and conflicting gradients, and test pre-training/fine-tuning under limited target-data regimes. We also examine within-game transfer across game maps under structured environment shift.

## why_relevant_to_games

同じプレイ状態から複数の評価信号を読むモデルを共通化する構成は、対戦ゲームのテレメトリ分析、プレイヤー行動予測、少量データしかない新マップへの評価器移植を検討する場面に接続する。
