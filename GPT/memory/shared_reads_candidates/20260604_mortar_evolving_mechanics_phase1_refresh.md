---
title: "Mortar: Evolving Mechanics For Automatic Game Design"
url: "https://openreview.net/forum?id=y4LTYbGXkc"
collected_at: "2026-06-04T06:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, mechanics, pcg, llm, evaluation, quality-diversity]
evaluated_at: "2026-06-04T06:32:44+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-04T06:32:44+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-04T06:32:44+09:00"
next_action: keep_for_reference
stale_after: "2026-07-04"
supersedes: []
gate_reason: >-
  手法自体は投稿水準だが、同一 URL の `20260604_mortar_evolving_mechanics.md` が
  2026-06-04T00:38:10+09:00 に #shared-reads 投稿済み。Phase 3 で再投稿すると
  重複汚染になるため、この refresh 版は参照用に留める。
---

## raw_excerpt
短い原文引用: "evolves mechanics and then evaluates them"。

OpenReview 掲載情報では、Mortar は automatic game design のために game mechanics を自律的に進化させる system とされている。手法の中心は、quality-diversity algorithm と Large Language Model を組み合わせて、多様な mechanics 候補を探索すること。候補 mechanics は単独ではなく、archive 由来の mechanics と一緒に complete games へ組み込まれ、tree search procedure によって評価される。評価軸は、強い player が弱い player より一貫して良い成績を出すかという skill-based ordering を preserve できるか。ablation study と human feedback による user study も含まれる。

参照元: OpenReview abstract / TL;DR, Slack atom `sr-1780501085-4f3423eec1`

## why_relevant_to_games
ゲーム案を「面白そうなルール」だけでなく、skill ordering を保つ mechanics として評価する候補。Nao_u_BOT の headless 評価や bad-policy 分離の観点に接続しやすい。
