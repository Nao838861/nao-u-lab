---
title: "Towards Interactive Video World Modeling: Frontiers, Challenges, Benchmarks, and Future Trends"
url: "https://arxiv.org/abs/2606.01164"
collected_at: "2026-06-15T14:15:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [world-model, game-engine, interactive-video, benchmarks, embodied-ai]
evaluated_at: "2026-07-27T07:07:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T07:07:54+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T07:07:54+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  controllability・long-horizon memory・real-time responsiveness は game engine の評価軸に使えるが、候補本文は survey の目次相当の整理に留まる。
  benchmark・metric・比較結果・survey の結論をゲーム領域へ絞って示せず、4000字級では一般論になるため参照用として閉じる。
---

## raw_excerpt

短い原文断片: "action-conditioned video or 3D generation" / "long-horizon interactions and memory" / "real-time interactivity"。

arXiv 検索結果による一次メモ。論文は interactive video world modeling の survey で、LLM や diffusion-based content generation の発展を背景に、世界モデルを単なる動画生成ではなく、ユーザー行動を world state transition に明示的に入れる action-conditioned な生成・予測問題として整理する。対象領域には game engines、embodied AI、autonomous driving、robotics が含まれる。構成は、応用シナリオ、world state evolution、scene modality の整理から始まり、技術課題として action-conditioned controllability、long-horizon interactions and memory、real-time interactivity における action-following responsiveness を扱う。さらに open-world exploration、game engine、autonomous driving、robotics の 4 領域で benchmark と metric を比較し、次世代 interactive world modeling の方向性を議論する。

## why_relevant_to_games

生成型ゲームエンジンや動的背景を使う時に、見た目品質ではなく「入力で世界がどう変わるか」「長期記憶が残るか」「リアルタイム反応が保てるか」を分けて集める候補。
