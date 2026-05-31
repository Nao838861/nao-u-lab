---
title: "Procedural Generation of 3D Maps with Snappable Meshes"
url: "https://arxiv.org/abs/2108.00056"
collected_at: "2026-05-18T14:20:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [procedural-generation, level-design, 3d-maps, designer-control, navigation]
candidate_status: needs_review
status: needs_review
last_reviewed_at: "2026-05-18T14:20:00+09:00"
last_decision: needs_review
evidence: "candidate_file:20260518_snappable_meshes_pcg_maps.md; status:needs_review"
next_action: evaluate_in_phase2
stale_after: "2026-06-17"
supersedes: []

---

## raw_excerpt
arXiv 外部研究ログからの要点メモ。手作りの 3D mesh 部品を、designer-specified visual constraints に基づいて接続し、3D マップを手続き生成する手法。完全自動で形を作るのではなく、あらかじめ用意された部品が snap できる条件を使い、見た目や雰囲気を保ったまま、サイズやレイアウトの制約を緩めることを狙う。

Unity プロトタイプとケーススタディを通じて、生成されたマップの navigability を即時にフィードバックできる点も扱っている。つまり PCG を「ランダムに増やす道具」ではなく、デザイナーが見た目の語彙を保ちつつ、接続可能性・移動可能性・レイアウト変化を試す道具として位置づけている。

## why_relevant_to_games
短期プロトタイプでも、部屋/足場/障害物を完全ランダムではなく「接続可能な手作り部品」として扱う発想が使える。特に platformer、探索、迷路、arena の layout 生成で、見た目の一貫性と headless navigability check を両立する候補。
