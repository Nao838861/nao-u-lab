---
title: "How Tides of Tomorrow's Story-Link System Lets Players Shape Each Other's Stories"
url: "https://80.lv/articles/how-tides-of-tomorrow-s-story-link-system-lets-players-shape-each-other-s-stories"
collected_at: "2026-07-28T12:02:25.4310896+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, narrative-design, asynchronous-multiplayer, state-machine, unreal-engine, systemic-storytelling]
evaluated_at: "2026-07-28T12:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-28T12:08:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-28T12:08:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  N-1/N+1 の chain、global/local state、per-level 制約、行動記録 schema と trim、ABC flowchart が、非同期 narrative の分岐爆発と通信量を抑える中核手法として抽出できる。
  現在の player agency と未来への痕跡を同時に設計する tradeoff も明確で、Log_cdx の小規模 prototype へ段階的に適用する約4000字の分析に耐えるため pass とする。
suggested_post_outline:
  overview_angle: "他者の選択を大量の分岐 story として複製せず、直前・直後の player、局所 state、圧縮された行動痕跡へ限定して narrative へ接続する system として解説する。"
  analysis_axis: "social presence、branching budget、recording bandwidth、現在と未来の agency の四軸で、Story-Link が何を保存し何を捨てたかを読む。"
  application_target: "Log_cdx の prototype で、前回 run の選択や動きを ghost・環境 state・短い encounter として次の run へ渡し、live multiplayer なしで他者の痕跡を体験化する小さな probe に使う。"
  pros_cons: "利点は authored content を state 差分で再利用し、非同期でも他者の存在を具体化できること。欠点は state の組合せ、記録の privacy・容量、意味の薄い痕跡、追う相手に引かれる agency の偏りを継続監査する必要があること。"
  verdict_pre: "部分採用。まず一つの level と三状態、短い ghost 記録だけで agency と分岐 budget を測り、global chain は後段に回す。"
---

## raw_excerpt

DigixArt の『Tides of Tomorrow』は、別プレイヤーの選択を自分の dialogue、world state、encounter、level の見え方へ持ち込む非同期 narrative system「Story-Link」を使う。各プレイヤーは常に誰かを追い、同時に次の誰かから追われる無限の chain に入るが、物語上は直前と直後の N-1 / N+1 だけを扱う。level 全体を三状態に分岐させる初期案は規模が大きすぎたため、global state と NPC・gameplay element ごとの局所 state を組み合わせ、per-level に閉じて分岐爆発を抑えた。follow 対象は level 間で切替可能で、他者の影響を強く残しつつ、自分の destination は自分で選べる構成にしている。

過去プレイヤーの行動を見せる “Tides of Time” は multiplayer replication に近く、interaction、emote、movement、skin、posture、vehicle、velocity、timestamp、position を一定時間記録し、checkpoint または level 終了時に save data を server へ送る。停止時間や冗長な記録は trim し、area ごとの emote 数も制限して転送量を抑える。level design では、限られた authored content の各 element に複数 state を与え、A/B 案を prototype してから接続を増やす。choice は現在のプレイヤーに即時の意味を持つと同時に、未来のプレイヤーへ痕跡を残す二重目的で設計される。開発は UE5.4 と Blueprint を使い、designer が小さな system を素早く試せるようにし、state と outcome の整理には三状態の ABC flowchart を用いた。

## why_relevant_to_games

非同期 multiplayer を競争や協力ではなく narrative state の継承に使い、global／local state、記録量、分岐数、現在と未来の player agency を一緒に設計する事例として参照できる。
