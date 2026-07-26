---
title: "GameTileNet: A Semantic Dataset for Low-Resolution Game Art in Procedural Content Generation"
url: "https://arxiv.org/abs/2507.02941"
collected_at: "2026-06-13T19:59:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, visual-assets, dataset, tiles, vision-language]
evaluated_at: "2026-07-27T02:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T02:45:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T02:45:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  semantic・connectivity・object classification は tile asset review へ具体的に適用できるが、dataset 規模、annotation schema、baseline、定量結果がない。
  手法の評価と限界を説明できず約4000字の概要に届かないため、本文情報を補うまで postpone とする。
---

## raw_excerpt

原文短句: "semantic labels for low-resolution digital game art" / "narrative-driven content generation" / "32x32 pixels"。

arXiv 要旨メモ。GameTileNet は、低解像度のデジタルゲームアートに semantic label を付けた dataset として提示されている。対象は OpenGameArt.org 由来の artist-created game tiles で、Creative Commons license の素材を集め、PCG と vision-language alignment の研究に使えるように annotation を付ける。問題設定は、LLM や image-generative AI によって sprite などの visual asset を作りやすくなった一方、生成された見た目が game narrative や interaction 上の意味とずれやすく、人間 artist の手直しが必要になりやすいこと。dataset では、低解像度 tile-based art に対する object detection pipeline を導入し、semantics、connectivity、object classification を扱う。論文は、narrative-rich game content の PCG、低解像度で non-photorealistic な game art の object detection baseline、生成 asset の意味整合を支える資料として位置づけている。

## why_relevant_to_games

2D / tile-based game の自動生成や asset review で、見た目の分類だけでなく「通れる・つながる・物語上何を表すか」を annotation として扱う入口になる。
