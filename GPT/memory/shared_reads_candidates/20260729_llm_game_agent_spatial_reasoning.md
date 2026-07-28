---
title: "Spatial Reasoning in LLM Game Agents: Impact of Causal Context and Multi-Step Planning"
url: "https://arxiv.org/abs/2607.22732v1"
collected_at: "2026-07-29T06:18:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, automated-playtesting, spatial-reasoning, planning, benchmark]
---

## raw_excerpt

> LLM-based game agents often perform poorly on more complex tasks. This work examines whether these failures are linked to limited spatial reasoning and evaluates whether causal prompt augmentation and multi-step planning can improve win-rates while managing response latency. Using the open-source Qwen3 model family, we conduct experiments across varying model scales, reasoning modes, and planning horizons. We further introduce a focused GVGAI benchmark consisting of three custom games with five difficulty levels to isolate spatial navigation. The evaluation follows two paradigms: an initial “positioning experiment” to test an agent's ability to find its exact coordinates, and a study of game-play success. Our results show that while larger models with an enabled thinking mode identify their positions more accurately, overall performance in coordinate matching remains limited for smaller models. Win rates decrease as game levels and layout complexity increase, validating the benchmark's difficulty scaling. Integrating causal context into the prompts tends to improve the agents' success rates, particularly for bigger models. While enabling thinking mode and longer planning horizons significantly improve performance, multi-step planning further reduces mean per-step response times, offering a practical trade-off between reasoning depth and execution speed.

## why_relevant_to_games

ゲームプレイ agent の失敗を空間認識、因果文脈、計画長、応答遅延へ分解して測る構成は、自動 playtest harness や難易度段階付きの agent 評価場面に接続する。
