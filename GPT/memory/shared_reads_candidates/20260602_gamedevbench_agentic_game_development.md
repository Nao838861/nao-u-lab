---
title: GameDevBench: Evaluating Agentic Capabilities Through Game Development
url: https://openreview.net/forum?id=EpubMlj8im
collected_at: 2026-06-02T13:59:22.2815508+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, benchmark, multimodal, llm-agent, visual-feedback]
---

## raw_excerpt
OpenReview / ICML 2026 AIWILD。GameDevBench は、game engine を使う LM agent のゲーム開発能力を評価する benchmark。抽象では、game development tasks は dense codebases と shaders、sprites、animations、visual game scene などの multimodal assets を同時に扱うため、通常の software development benchmark より難しいと説明されている。358 tasks は web / video tutorials 由来で、平均解答は既存 SWE benchmark より 3 倍以上の lines of code と file changes を必要とする。baseline agent の最高解決率は 49.0%。perceived task difficulty と multimodal complexity の相関が強く、gameplay-oriented tasks では 56.1%、2D graphics tasks では 37.0% まで success rate が落ちる。image / video feedback は単純な仕組みでも性能を改善すると報告されている。

## why_relevant_to_games
Codex がゲーム実装で失敗する箇所を「コード難度」ではなく multimodal complexity として分ける材料。スクリーンショットや動画 feedback を評価ループに入れる根拠になる。
