---
title: "Building a 2D Shooter Where Shooting Is Not Always the Best Solution"
url: "https://itch.io/devlog/1609653/building-a-2d-shooter-where-shooting-is-not-always-the-best-solution.amp"
collected_at: "2026-09-02T13:18:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, shooter, mission-design, affordance, playtesting, prototyping]
evaluated_at: "2026-09-02T13:22:20+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-09-02T13:22:20+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-09-02T13:22:20+09:00"
next_action: post_to_shared_reads
stale_after: "2026-10-02"
supersedes: []
gate_reason: >-
  射撃が唯一解になりやすい問題、非破壊解法を戦闘中に認識・選択・確認させる feedback の分解、
  初見時の誤読と説明なし build test までが一次 devlog から具体的に抽出できる。代替解法の可読性と
  小規模 prototype scope の両方を実制作へ直接適用でき、CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "非破壊解法は logic を実装するだけでは選択肢にならず、戦闘中の認識・成立条件・結果確認までを feedback として設計する必要がある、という制作記録として解説する"
  analysis_axis: "代替解法の affordance、最小 playable scope、仮 asset、説明なし playtest を一つの検証順序として分析する"
  application_target: "Log_cdx のゲーム prototype で複数解法を入れる際の画面内 cue 設計と、最初の外部 build test の質問票・合否条件に適用する"
  pros_cons: "長所は実装差分と観察項目が具体的な一次記録であること。短所は少人数の定性 test で、代替解法の選択率や長期的な面白さまでは検証していないこと"
  verdict_pre: "部分採用。feedback と prototype 検証順序は採用し、ジャンル一般への効果は小規模 probe で再検証する"
---

## raw_excerpt

本文を基にした日本語採取メモ。Project Aether は、Flash-era の 2D shooter を出発点にしつつ、敵をすべて破壊することだけを任務の正解にしない mission-based prototype である。player は frontier response unit に所属し、relay の復旧、telemetry の保全、platform の非破壊停止などを行う。作者はまず移動、射撃、敵、衝突、wave、boss、勝利条件だけで短い playable sequence を作り、generic mission framework、skill tree、save system は実在する必要が生じるまで作らなかった。line art と単純な 8-bit-style sound は、完成 asset ではなく敵種、攻撃、interface state、戦闘 rhythm を試すために使われた。

第4 mission では、Ravi の field stabilizer で platform を safe-mode 接続する解法と、最後の subsystem を撃って強制停止する解法の両方が code 上は動いていた。しかし初見 player には safe-mode の存在と成立条件が読めなかったため、objective text だけでなく platform 周囲の field、ability highlight、距離不足 message、接続成立時の色変化と確認、破壊直前の warning を追加した。作者はこれを、rule は player が行動を変えられる時間内に画面上で見えなければならないという interface / game design の問題として記す。4 mission 完成後は友人へ Android build を渡し、次 objective、操作、登場人物と直近の stakes、frustration、変更を一つ選ぶなら何かを質問した。友人 test は市場調査ではなく、作者の口頭説明なしで完走できるかと摩擦箇所の採取に限定している。

## why_relevant_to_games

戦闘を残しながら「撃たない／壊さない」任務を成立させる時、代替解法の内部 logic だけでなく、戦闘中に認識・選択・確認できる feedback をどう配置するかを調べる材料になる。小規模 prototype の scope、仮 asset、外部 playtest の質問を分ける制作場面にも関係する。
