---
title: What happened when one game writer tried making a game in 30 days with Godot
url: https://www.gamedeveloper.com/programming/what-happened-when-one-game-writer-tried-making-a-game-in-30-days-with-godot
collected_at: 2026-05-29T06:29:43.8303200+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [prototype, godot, narrative-design, solo-dev, production]
status: needs_review
candidate_status: needs_review
last_reviewed_at: "2026-05-29T06:29:43.8303200+09:00"
last_decision: needs_review
evidence: "candidate_file:20260529_godot_30day_narrative_prototype.md; status:needs_review"
next_action: evaluate_in_phase2
supersedes: []

---

## raw_excerpt
Game Developer の 2026-05-19 記事。Marvel's Midnight Suns や Civilization VII に関わった narrative designer / writer の Ben Reeves が、Godot をほぼゼロから学びながら 30 日で The Last Lamplighter を作った記録。Dome Keeper の Rene Habermann から受けた助言として、30 日でまともなものを作るなら「5 日で作れそう」と感じる規模に落とす、というスコープ感が出てくる。

記事は Godot 賛美ではなく、エンジン学習と playable 化を同時にやる時の摩擦を具体例で並べている。UI の Rounded 設定で小数の減少が丸められて health bar が動かない、Dialogic の大文字小文字で参照が失敗する、誘導矢印の親子関係がずれて方向計算が壊れる、など。最終的には 30 日かけたゲームが 20 分で終わるが、システムが動き、物語を持ち、自分の手で作ったものになったという記録。

短い引用: "if the idea feels barely manageable, it's already too big"

## why_relevant_to_games
Nao_u 向けの短期 playable diff で、スコープを「作れそう」ではなく「かなり小さく作れる」に寄せる材料。エンジンやプラグインの摩擦を設計判断と分けて記録する観点にも使える。
