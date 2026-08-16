---
title: "Game Design Deep Dive: Dandara's unique jump-only movement mechanic"
url: "https://www.gamedeveloper.com/design/game-design-deep-dive-i-dandara-i-s-unique-jump-only-movement-mechanic"
collected_at: "2026-08-16T23:30:49+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, platformer, input-design, level-design, postmortem]
evaluated_at: "2026-08-16T23:35:36+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-16T23:35:36+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-16T23:35:36+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-15"
supersedes: []
gate_reason: >-
  touch 起点の入力発見から jump-only への絞り込み、intent 補助、武器射程、room 制約、gamepad 移植まで、
  一つの移動 verb が周辺設計を変えた因果を具体例で追える。定量比較はないが、操作と level topology の検査へ直接適用でき、
  制約から設計語彙を育てる軸で約4000字の独立した分析を構成できる。
suggested_post_outline:
  overview_angle: "touch の制約から jump-only を発見し、着地の自由を削ることで速度感と意図の両立を作った反復として説明する"
  analysis_axis: "入力方式から中心動詞を選ぶ過程、last-valid aim と raycaster による intent 補助、武器射程と接近リスク、mini dead-end を防ぐ room 制約、gamepad での再解釈"
  application_target: "Log_cdx の移動中心 prototype で、入力ぶれ・失敗後の復帰経路・安全圏からの攻撃・controller 差を同じ movement test map で検査する"
  pros_cons: "設計変更の因果と失敗例が具体的で再現しやすい一方、成功評価は開発者の観察中心で、入力補助の強度や player 差は別途 playtest が必要"
  verdict_pre: "採用"
---

## raw_excerpt

Dandara の共同創業者 João Brant による開発解説。出発点は、mobile の touch screen に既存 console 操作を移植するのではなく、touch の開始と解放をどちらも即時的な入力として使う "Touch Release" と swipe から設計することだった。初期案には歩行もあったが、角度付き面で意図しない移動が混ざる一方、対向面へ跳ぶ動きが強い運動感を生んだため、歩行を削って jump-only に絞った。

自由着地は高速移動の快感と引き換えに、着地失敗や戻り操作でテンポを壊した。そこで jump range を制限し、有効な白い target area だけへ着地可能にした。指を離す瞬間の方向ぶれには最後の有効 aim を保持し、swipe の長さに応じて side raycaster の探索幅を広げる補助を入れた。攻撃も、画面外から安全に倒せる長射程 machine gun と auto-aim から、接近と位置取りを要求する短射程の広角 shot へ変更した。

level design では、誤着地後に進みたい方向へ戻れず一度後退を強いられる "mini dead-end"、壁沿い jump、敵配置や camera trigger が一時的な行き止まりを作る問題を room 制約として抽出した。gamepad への移植では touch 操作の直訳を断念し、移動と攻撃を同じ stick で aim し、接地後の次 jump に向けて方向 vector を反転する補助を採用した。

## why_relevant_to_games

固有の移動 verb を、入力方式、intent 補助、武器射程、room topology、別 controller への移植まで一体で反復した事例。platformer の操作感設計と、失敗後に余計な後退を生む level 構造の検査に参照できる。
