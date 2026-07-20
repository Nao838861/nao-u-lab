---
title: "How voxels enabled a juicy gameplay loop in Donkey Kong Bananza"
url: "https://www.gamedeveloper.com/design/how-voxels-enabled-a-juicy-gameplay-loop-in-donkey-kong-bananza"
collected_at: "2026-07-21T04:32:43.2861660+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, action, level-design, game-feel, voxel]
evaluated_at: "2026-07-21T04:37:13+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1784576518.296969"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784576518296969"
  char_count: 4280
  posted_at: "2026-07-21T04:41:58+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-21T04:41:58+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784576518296969"
next_action: none
stale_after: "2026-08-20"
supersedes: []
gate_reason: >
  voxel 地形を見せ物ではなく戦闘・地形変化・発見・再戦闘の循環へ変える中核と、collision の不自然さを player の機会増減で裁く基準が明確。
  出荷済み作品の具体例として action prototype の loop 設計と game-feel 調整へ直接適用でき、限界も含めて約4000字の分析を組める。
suggested_post_outline:
  overview_angle: "大規模 voxel 技術の紹介ではなく、破壊を次の戦闘と探索へ接続する chain of destruction の設計として説明する"
  analysis_axis: "岩を得る powered-up state、敵の吹き飛ばし、地形開口、報酬露出、次の岩の獲得という循環と、厳密な collision を崩す判断基準"
  application_target: "小規模 action prototype で、攻撃結果が移動経路・発見・次の攻撃資源を同時に生む playable loop と game-feel の評価軸を設計する場面"
  pros_cons: "メリットは一つの破壊操作が戦闘と探索を連結し、技術コストを反復可能な遊びへ回収できる点。デメリットは自由破壊が level pacing と発見順を崩し、許容した食い込みが損失側へ転ぶ境界を個別検証する必要がある点。"
  verdict_pre: "部分採用"
---

## raw_excerpt

Game Developer が Nintendo の Kenta Motokura と Tatsuya Kurihara による GDC 2026 解説をまとめた事例。『Donkey Kong Bananza』では、最大347,070,464 voxel の破壊可能地形を見せ物で終わらせず、戦闘と探索の境界をつなぐ。player は地形から岩を掴むことで一時的な powered-up state に入り、それを敵へ投げる。攻撃と吹き飛ばしで壁や床が削れ、撃破された敵が壁を破ると、その先の宝・敵・隠し空間が露出する。発見した場所から次の岩を取り、再び戦闘へ戻る循環を team は "chain of destruction" と呼ぶ。collision は voxel 同士の厳密判定ではなく、moving object に primitive shape を持たせるため、物体が壁へ食い込む場合がある。team は、その不自然さが player の行動機会や楽しさを増やす側なら許容し、損失や選択肢の減少を生む側なら修正する基準を置いた。

## why_relevant_to_games

新技術を描画品質ではなく、戦闘→地形変化→発見→次の戦闘という playable loop に変換する設計資料になる。物理的な厳密さと操作機会が衝突した時の判定軸も、action prototype の game-feel 調整に使える。
