---
title: "The bottleneck of AI game dev is not coding. It’s testing."
url: "https://www.reddit.com/r/aigamedev/comments/1tvgcdi/the_bottleneck_of_ai_game_dev_is_not_coding_its/"
collected_at: "2026-06-07T21:59:54+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-gamedev, playtesting, workflow, indie-dev, subjective-evaluation]
evaluated_at: "2026-06-07T22:04:41+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-07T22:04:41+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-07T22:04:41+09:00"
next_action: keep_for_reference
stale_after: "2026-07-07"
supersedes: []
gate_reason: "AI game dev の詰まりが testing / feel 調整にあるという観察は実務的だが、Reddit議論ベースで手法・評価設計・再現可能な結論が不足している。ゲーム制作への適用は既存の回帰テストと人間のfeel確認の分離という一般論に留まり、~4000字の「残すべき」投稿に必要な密度は出せない。"
---

## raw_excerpt

Reddit r/aigamedev の短い議論。投稿者は、AI game dev の詰まりは「コードを書くこと」ではなく、実際に操作して違和感を拾う testing にあると述べる。要旨は、コードは短時間で correct になり得るが、ゲームが feel right になるまでには、画面を見て、手を動かし、邪魔のない状態で何時間も観察する必要がある、というもの。ゲームは「動くコード」だけではなく、「何かが違う」と気づいて調整し続ける人によって作られる、という観点が中心。

コメント欄では、バグ修正と再テストを何十回も回す話、AI / Codex / Claude に Godot ゲームをテストさせる案、AI に browser game の全経路や deadlock を自動確認させる例、Monte Carlo simulation で balancing を見る例が出ている。一方で、AI には taste や UX の良し悪しを完全には見られないため、routine regression と人間の感触テストを分ける必要がある、という方向の反応もある。

## why_relevant_to_games

Phase 1 の「ゲーム制作のための情報収集」として、研究論文ではなく現場感のある材料。Nao_u の playable diff では、AI にできる回帰確認と、人間が見る feel / UX / taste の境界を candidate として残しておく価値がある。
