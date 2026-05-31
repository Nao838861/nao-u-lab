---
title: "4:Loop - designing the ominous cube-shaped Scanner boss"
url: "https://blog.playstation.com/2026/04/28/4loop-designing-the-ominous-cube-shaped-scanner-boss/"
collected_at: "2026-05-31T11:14:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, boss-design, co-op, action, encounter-design, decision-design]
evaluated_at: "2026-05-31T11:18:36+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-05-31T11:18:36+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-05-31T11:18:36+09:00"
next_action: post_to_shared_reads
stale_after: "2026-06-30"
supersedes: []
gate_reason: |
  直接 shot を撃たない boss が、breakable panels、navigation、gear choice、core damage window で圧を作る構造が具体的。
  action prototype で攻撃密度以外の難しさを設計する材料として使えるため、ゲーム制作への適用性は十分ある。
suggested_post_outline:
  overview_angle: "撃ってくる敵ではなく、壊す順序と短い同期 window で co-op 圧を作る boss 設計として読む"
  analysis_axis: "panel 破壊、core 露出、Laser Matrix、Probability Map、preparation decision の分担"
  application_target: "action prototype の非弾幕 boss、協力タイミング、装備準備、攻撃密度に頼らない encounter pressure"
  pros_cons: "構造は明快だが商業記事寄りなので、実装時は小さな再現 probe で圧力源を切り分ける必要がある"
  verdict_pre: "部分採用"
---

## raw_excerpt
著作権配慮のため長文引用ではなく、記事本文の要点メモとして保存する。PlayStation Blog 2026-04-28、Bad Robot Games の 4:Loop Scanner boss 設計記事。Scanner は「撃ってくる敵」ではなく、巨大な floating cube puzzle として始まり、54 tiles を壊すと短時間だけ Reactor Core が露出する構造。プレイヤーは map 上で離れた位置にいても、その短い window に一斉に攻撃する必要があり、co-op coordination が boss design から自然に発生するように作られている。

重要部分は、boss が攻撃弾を撃たなくても encounter pressure を作れる点。Scanner は breakable panels、Laser Matrix の navigation、gear choice、core damage window の同期で圧力を作る。Probability Map により act end の boss が事前に分かるため、shotgun のような近距離火力を選ぶか、Laser Matrix 対策の装備を選ぶかといった preparation decision も fight の一部になる。記事末尾では、Scanner は複数の improvisation layer に触れる boss だが、プレイヤーへ直接 shot を撃たないと説明されている。

## why_relevant_to_games
敵弾や直接攻撃を増やさず、地形・露出 window・装備選択・協力タイミングで boss 圧を作る例。Nao_u_BOT の action prototype で「攻撃密度以外の難しさ」を考える時の材料。
