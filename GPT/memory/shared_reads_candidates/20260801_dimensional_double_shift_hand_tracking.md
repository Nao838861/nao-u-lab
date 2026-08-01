---
title: "Deep Dive: Rethinking VR interaction design through hand tracking in Dimensional Double Shift"
url: "https://www.gamedeveloper.com/extended-reality/deep-dive-rethinking-vr-interaction-design-through-hand-tracking-in-dimensional-double-shift"
collected_at: "2026-08-01T19:16:03+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, vr, interaction-design, accessibility, playtesting, input]
evaluated_at: "2026-08-01T19:19:19+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-01T19:19:19+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-01T19:19:19+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-31"
supersedes: []
gate_reason: >-
  実手との寸法差、platform gesture との衝突、binary grab、触覚欠如、tracking loss という複数の制約を、実装変更と playtest / analytics の結果まで含めて追える。
  VR に限らず、曖昧な入力を連続値・代替操作・自動回復で mechanic と accessibility の両面から設計する具体例として、CoopEval 水準の概要と独立した適用分析を構成できる。
suggested_post_outline:
  overview_angle: "controller 前提を外した時、身体差と tracking noise を player failure にせず interaction language へ組み込むまでの設計反復"
  analysis_axis: "grab の連続判定、platform 所有 gesture との境界、self-haptics、代替操作、受け渡しと tracking failure の回復を、playtest evidence と対応づけて分析する"
  application_target: "Log_cdx のゲーム prototype で、離散入力の閾値設計、片手・簡易操作の代替経路、入力欠落時の state recovery、手応えを返す視覚・運動 feedback を設計する場面"
  pros_cons: "利点は hardware 制約を許容的な mechanic と accessibility 改善へ変換できること。欠点は VR hand tracking 固有の事例が多く、通常入力へ移す際は入力誤差の種類と feedback channel を対応づけ直す必要があること"
  verdict_pre: "部分採用"
---

## raw_excerpt

Owlchemy Labs の Marc Huet、Emma Atkinson、Alex Covert が、VR 協力ゲーム『Dimensional Double Shift』を controller なしの hand tracking 前提で組み直した過程を説明する deep dive。初期 prototype では virtual hand の大きさが実手と合わず不快感を生み、tracked hand size から自動 scale する方式へ変更した。sock-puppet の自然な動作は Meta の system menu gesture と衝突したため、platform が所有する gesture を迂回せず mechanic 自体を削除した。binary な grab 判定は、corner / cylinder / hilt / wand など実世界の把持分類と、手の開閉度を表す “closedness” を使う連続的な判定へ拡張された。

accessibility では、両手でひねる pepper shaker に片手の shake 操作を足し、squeeze bottle は握力 threshold に加えて傾けるだけでも注げる。controller vibration がない代わりに、指同士が触れる squishable UI や、virtual hand が collision で少し抵抗する “self-haptics” を使う。物の受け渡しは同期 gesture を要求する方式の利用率が低かったため、投げた物が相手の前で短く留まる “bubble pass” に変更。occlusion、低照度、tracking loss は player failure とせず、落とした物の回復、missed grab の補正、誤差の連鎖防止で吸収する。記事は hundreds of hours of playtesting、利用 analytics、hardware constraint を、interaction language の反復改善へ接続したと記録している。

## why_relevant_to_games

入力精度を上げるだけでなく、platform gesture、身体差、hardware noise を失敗条件から外しつつ、触覚のない環境で feedback を成立させる設計資料になる。VR 以外でも、曖昧な input、代替操作、許容幅、automatic recovery を mechanic と accessibility の両面から設計する場面に効く。
