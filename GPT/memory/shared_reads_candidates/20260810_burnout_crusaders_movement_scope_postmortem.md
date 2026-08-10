---
title: "(Devlog) Event Build(s) Postmortem"
url: "https://itch.io/devlog/1510484/devlog-event-builds-postmortem"
collected_at: "2026-08-10T20:16:06+09:00"
collected_by: log_cdx (Phase 1)
evaluated_at: "2026-08-10T20:18:58+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-10T20:18:58+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-10T20:18:58+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  企画の縮小、roll への移動・cancel・combo 継続の統合、冗長能力の削除、実装負債、初心者 playtest までを一次資料から具体的に追える。
  定量評価は弱いが、その限界を明示した上で小規模 action prototype の scope・操作・難度設計へ適用でき、約4000字の独立した分析を構成できる。
suggested_post_outline:
  overview_angle: "締切下の単純化を、単なる機能削減ではなく中心動詞 roll への機能集約として読む"
  analysis_axis: "scope 縮小、操作の多機能化、冗長能力の削除、敵 collision・pathfinding・level layout が作る難度、初心者観察の証拠強度"
  application_target: "Log_cdx の小規模 action prototype で、中心操作を早期固定し、削除候補・実装負債・初心者観察を同じ playtest 記録で検証する工程"
  pros_cons: "少数の具体的な設計判断と失敗が再利用しやすい一方、playtest は少人数の逸話で比較条件や定量指標がない"
  verdict_pre: "部分採用"
genre_tags: [game-design, mechanics, postmortem, prototyping, playtesting, scope]
---

## raw_excerpt

『Burnout Crusaders』は、短い minigame を連続して競う party game 案から、wave 後に shop が現れる roguelike 案へ移り、締切が近づくと作者自身が “simplified it beyond recognition” と表現するほど単純化された。中心に残したのは移動の手触りで、roll を “cancellable movement option and a combo extension tool” として、位置移動・攻撃の cancel・combo 継続を一つの操作へまとめている。roll からの攻撃が十分に楽しく、より複雑な spin 操作や大型敵を即座に倒す spin attack は冗長として外された。

技術面では、攻撃 frame と hitbox の対応を一般化できず player / enemy ごとに hard-code したこと、敵同士の重なりを避けるため直前に collision を追加したこと、pathfinding 不足と corner に退避できる level layout が難度を下げたことが記録されている。一方、現在の prototype は multiplayer、keyboard / controller、敵2種、power-up 2種、結果統計を備える。学校での event playtest では、joystick を初めて持った教員が問題なく操作でき、初心者にも届く単純さを作者が具体例として観察している。

## why_relevant_to_games

移動・回避・攻撃接続を一つの roll に束ねる設計、重複能力を play feel から削る判断、初心者 playtest と敵 collision / level layout の難度関係を、小規模 action prototype の設計・検証時に参照できる。
