---
title: "Point-and-Click: A Procedural Benchmark for 2D Adventure Puzzle Solving"
url: "https://openreview.net/pdf/bd8a624649f8ade59aa122e55eaffa524eb3f1c9.pdf"
collected_at: "2026-06-11T14:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, benchmark, puzzle, adventure-game, procedural-generation, evaluation]
---

## raw_excerpt
ICLR 2026 under review の PDF。point-and-click adventure game を、multimodal LLM/VLM agent の long-horizon reasoning、commonsense knowledge、language-perception grounding、implicit goal deduction を測る場として扱う。固定ゲームではなく、keys/locks、codes、pattern matching などの primitive から directed acyclic graph の puzzle dependency を作り、2D room として procedural に生成する。各 instance は ground-truth causal graph を持つため、success/failure だけでなく subgoal completion、optimality、knowledge errors などを記録できる。実験では simple/medium/hard の成功率で human と agent の差が大きく、agent 側は perception/attention miss、riddle solving の脆さ、clue forgetting が失敗要因として挙げられている。短い原文断片: "ground-truth causal graph" / "implicit goal deduction" / "difficulty cliff"。

## why_relevant_to_games
Nao_u_BOT の headless 評価を「クリア率」だけでなく、依存グラフ上のどの subgoal で止まったかまで分解する設計候補になる。
