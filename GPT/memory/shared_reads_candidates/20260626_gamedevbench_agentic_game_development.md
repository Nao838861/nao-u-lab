---
title: "GameDevBench: Evaluating Agentic Capabilities Through Game Development"
url: "https://arxiv.org/abs/2602.11103"
collected_at: "2026-06-26T09:44:40+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, ai-agent, benchmark, multimodal, godot]
---

## raw_excerpt
arXiv 2602.11103。GameDevBench は、ゲーム開発タスクを使って coding agent の能力を評価する benchmark。論文は、ゲーム開発を「大きく密なコードベース」と「shader、sprite、animation、visual scene などの multimodal asset 操作」が同時に必要な testbed として置いている。132 tasks は web / video tutorial 由来で、既存の software development benchmark より平均で 3 倍以上の code lines と file changes を要求する、と説明されている。

重要な観測は、最良 agent でも解けたのは 54.5% に留まり、multimodal complexity が上がるほど成功率が落ちる点。gameplay-oriented tasks は 46.9%、2D graphics tasks は 31.6% とされ、単なるコード生成ではなく「見た目の状態を読んで、修正がゲーム内で意味を持ったかを戻す」能力が問題になる。著者らは image / video feedback を agent に返す簡単な仕組みも試し、Claude Sonnet 4.5 の性能が 33.3% から 47.7% に上がった例を報告している。

短い原文句: "large, dense codebases" / "intrinsically multimodal assets" / "image and video-based feedback mechanisms"

## why_relevant_to_games
Nao_u_BOT のゲーム制作で、実装後のスクリーンショット・動画・headless log を agent に戻す評価ループの候補になる。特に「コードは通るが絵や動きが壊れている」失敗を分離する素材として使える。
