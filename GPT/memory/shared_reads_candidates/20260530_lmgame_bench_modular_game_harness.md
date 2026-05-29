---
title: "LMGame-Bench: How Good are LLMs at Playing Games?"
url: "https://openreview.net/forum?id=qeziG97WUZ"
collected_at: "2026-05-30T08:30:05+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, benchmark, modular-harness, llm-gameplay]
---

## raw_excerpt

原文要旨メモ。LMGame-Bench は、LLM/VLM が video game を遊ぶ能力を測る ICLR 2026 Poster。対象は platformer、puzzle、narrative games を含む 6 つの popular games で、unified Gym-style API を通じて扱う。特徴は、perception、memory、reasoning modules を含む modular harness を用意し、それぞれを toggle して distinct capabilities を切り分けて測れる点。さらに prompt standardization と contamination mitigation により robustness を高める。13 の state-of-the-art models を評価し、visual state extraction、reflection、spatiotemporal reasoning、long-context reasoning に制限が出ること、個別ゲームと中核 LLM capability の対応を相関分析で読むことを報告している。

## why_relevant_to_games

ヘッドレス playtest を「一つの賢い agent」ではなく、perception / memory / reasoning を切り替える modular harness として設計する参考になる。ゲーム側の難しさと agent 側の失敗を分離してログ化する候補。
