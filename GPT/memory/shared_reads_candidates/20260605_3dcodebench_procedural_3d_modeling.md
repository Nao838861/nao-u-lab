---
title: "3DCodeBench: Benchmarking Agentic Procedural 3D Modeling Via Code"
url: "https://arxiv.org/abs/2606.01057"
collected_at: "2026-06-05T11:47:47.1769811+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-art, procedural-generation, 3d-assets, agent-evaluation, tooling]
---

## raw_excerpt

arXiv:2606.01057。2026-05-31 submitted。論文は、procedural 3D modeling through code を、neural 3D generation と違って deterministic、engine-ready、precisely editable な asset を作れる paradigm として置く。一方で、3D software API、parametric design、code-level geometric reasoning の専門性が必要になるため、VLM agent が text / image reference から executable 3D code をどこまで作れるかを測る benchmark として 3DCodeBench を提案している。

3DCodeBench は 12 advanced VLMs を対象に、procedural 3D generation in 3D modeling software の能力を評価する。自動 metric だけでは 3D shape の perceptual quality を十分に測れないため、pairwise human preferences に基づく 3DCodeArena も用意する。報告されている失敗は、主に API mismatch に起因し、render が成功しても disconnected / floating geometric components が残ることがある。test-time scaling、higher thinking budgets、multi-turn refinement は全体として性能を改善する。著者らは、high-quality procedural coding data と、iterative refinement に high-fidelity feedback を返す robust execution environment が必要だと述べている。

短い原文断片: "engine-ready, and precisely editable assets"

## why_relevant_to_games

ゲーム用 3D アセットを画像生成ではなく「編集可能な手続きコード」として扱う評価軸になる。小規模プロトタイプで、Blender / Three.js / Unity 向け asset を agent が作る時の失敗分類にも使える。
