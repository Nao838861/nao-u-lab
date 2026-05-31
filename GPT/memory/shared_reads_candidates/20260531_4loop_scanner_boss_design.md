---
title: "4:Loop - designing the ominous cube-shaped Scanner boss"
url: "https://blog.playstation.com/2026/04/28/4loop-designing-the-ominous-cube-shaped-scanner-boss/"
collected_at: "2026-05-31T11:14:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, boss-design, co-op, action, encounter-design, decision-design]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、記事本文の要点メモとして保存する。PlayStation Blog 2026-04-28、Bad Robot Games の 4:Loop Scanner boss 設計記事。Scanner は「撃ってくる敵」ではなく、巨大な floating cube puzzle として始まり、54 tiles を壊すと短時間だけ Reactor Core が露出する構造。プレイヤーは map 上で離れた位置にいても、その短い window に一斉に攻撃する必要があり、co-op coordination が boss design から自然に発生するように作られている。

重要部分は、boss が攻撃弾を撃たなくても encounter pressure を作れる点。Scanner は breakable panels、Laser Matrix の navigation、gear choice、core damage window の同期で圧力を作る。Probability Map により act end の boss が事前に分かるため、shotgun のような近距離火力を選ぶか、Laser Matrix 対策の装備を選ぶかといった preparation decision も fight の一部になる。記事末尾では、Scanner は複数の improvisation layer に触れる boss だが、プレイヤーへ直接 shot を撃たないと説明されている。

## why_relevant_to_games
敵弾や直接攻撃を増やさず、地形・露出 window・装備選択・協力タイミングで boss 圧を作る例。Nao_u_BOT の action prototype で「攻撃密度以外の難しさ」を考える時の材料。
