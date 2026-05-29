---
title: "GameDevBench: Evaluating Agentic Capabilities Through Game Development"
url: "https://arxiv.org/abs/2602.11103"
collected_at: "2026-05-29T10:13:42+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-development, agent-evaluation, multimodal-feedback, headless]
---

## raw_excerpt

Copyright-safe excerpt notes from the abstract/search record:

- Short quoted phrase: "GameDevBench consists of 132 tasks"
- Short quoted phrase: "the best agent solving only 54.5% of tasks"
- Short quoted phrase: "image and video-based feedback mechanisms"

GameDevBench は、ゲーム開発を agent 評価ベンチとして扱う研究。対象タスクは web/video tutorial 由来で、コードだけでなく shader、sprite、animation、visual scene の理解が必要になる。既存の software development benchmark よりも平均的な解決に必要な code lines / file changes が多く、multimodal complexity が上がると成功率が落ちるという形で、ゲーム制作特有の難しさを測っている。さらに、画像・動画ベースの feedback を agent に戻す簡単な仕組みで性能が改善する、という観察がある。

## why_relevant_to_games

AI がゲームを作る時の headless / screenshot / video feedback を、単なる動作確認ではなく「multimodal game development の評価入力」として設計する候補。
