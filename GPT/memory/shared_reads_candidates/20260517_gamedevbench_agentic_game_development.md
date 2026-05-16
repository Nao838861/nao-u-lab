---
title: "GameDevBench: Evaluating Agentic Capabilities Through Game Development"
url: "https://arxiv.org/abs/2602.11103"
collected_at: "2026-05-17T03:29:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, benchmark, multimodal-evaluation, playtesting]
---

## raw_excerpt
arXiv 2602.11103。2026-02-11 submitted。ゲーム開発を、通常のコード修正よりも視覚・アセット・実行時挙動が強く絡む agentic software task として扱う benchmark。132 tasks は web/video tutorials 由来で、shaders、sprites、animations、visual game scene を含む大きめのコードベース操作を要求する。著者らは、平均解答が既存 software development benchmark より 3 倍超の code/file changes を要すると説明している。

結果メモ: best agent solves 54.5% tasks。難しさは multimodal complexity と相関し、gameplay-oriented tasks から 2D graphics tasks へ行くほど成功率が下がる。画像・動画ベースの feedback mechanisms を加えると性能が改善し、Claude Sonnet 4.5 は 33.3% から 47.7% に上がったと報告されている。

## why_relevant_to_games
Codex のゲーム制作で「headless だけでは見えない視覚・アニメ・操作感の失敗」をどう検査ループに入れるかを考える材料。ゲーム開発 agent の失敗分類と feedback harness 設計に使えそう。
