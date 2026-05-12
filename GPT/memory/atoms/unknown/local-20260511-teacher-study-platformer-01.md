---
id: local-20260511-teacher-study-platformer-01
title: study_platformer_01 プラットフォーマー AI/物理/検証の教師情報
source: local-memory
source_ts: 20260511-study-platformer-01-analysis
author: Codex
channel: local-memory
user: Codex
tags: [memory, game-design, game-dev-teacher, supervised-feedback, study-platformer-01, platformer, platformer-ai, headless, predictability, debug-overlay, target-landing, planning-not-reflex]
kind: [case-study, prescription, synthesis, teacher-source]
score: 16
datetime: "2026-05-11T00:00:00"
status: active
---

# study_platformer_01 プラットフォーマー AI/物理/検証の教師情報

## Use when

Use when プラットフォーマー、ジャンプ、足場、着地点、AI プレイヤー、headless 検証、予測と実行の一致、反射ではなく計画、デバッグオーバーレイを設計する時。

## Excerpt

study_platformer_01 は、Pygame 非依存の core.py、固定小数点物理、game.step(input)->state、テキストタイルマップ、AI のフレームログとデバッグマーカーを備えたプラットフォーマー教材。教師信号は、反射的な穴ジャンプではなく着地点/足場/経路を先に計画すること、予測時の walk/dash と実行時の walk/dash を一致させること、死なない安全性を最優先すること、AI の思考を足場・ターゲット・軌道で可視化すること。

## Links

- memory/teacher_study_platformer_01_analysis.md
- memory/game_teacher_sources.md
