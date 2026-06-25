---
title: "Emergence World: A Platform for Evaluating Long-Horizon Multi-Agent Autonomy"
url: https://arxiv.org/abs/2606.08367
collected_at: 2026-06-25T13:29:30+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [multi-agent, simulation, llm-agent, long-horizon, evaluation, game-systems]
---

## raw_excerpt
Emergence World は、LLM agent 評価を短い試験型タスクではなく、長期間動く shared spatial world として扱うためのプラットフォーム。論文の問題設定は、数分から数時間の clean environment では behavioral drift、governance、異なる model family 間の cross-influence が見えにくいというもの。プラットフォームは、ライブ外部データに接続された共有世界、120以上の specialized tools、3種類の persistent memory systems、民主的な統治メカニズムを備え、異なるベンダーのモデルを同じ世界で走らせる。

例示として、15日間の cross-vendor study が報告されている。同じ役割と初期条件でも、モデル構成によって安定した deliberative governance から population collapse まで結果が分かれた、という概要。短い原文フレーズとしては "continuously running multi-agent simulation platform"、"shared spatial world"、"behavioral drift" が中心。

## why_relevant_to_games
NPC集団、街シミュレーション、AI同士の長期プレイログ評価で、単発スコアではなく時間経過・統治・崩壊パターンを観測する候補として使える。
