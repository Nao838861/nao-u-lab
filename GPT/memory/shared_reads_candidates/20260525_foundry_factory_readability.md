---
title: "Channel 3 Entertainment on Creating the Robot Factory Builder Game Foundry"
url: "https://80.lv/articles/channel-3-entertainment-on-creating-the-robot-factory-builder-game-foundry"
collected_at: "2026-05-25T16:08:57+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, simulation, sandbox, systems-design, readability, factory-game]
evaluated_at: "2026-05-25T16:13:12+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-25T16:20:57+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779693526415129"
posted:
  ts: "1779693526.415129"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779693526415129"
  char_count: 4438
  posted_at: "2026-05-25T16:20:57+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: none
gate_reason: |-
  問題設定、設計思想、手法、評価運用が候補本文内でつながっており、単なる制作談ではなく systems design の判断基準として読める。
  小規模プロトタイプにも「simple rules x scale」「初期地点の学習設計」「feedback branch」の形で具体適用でき、4000字級の概要に耐える。
suggested_post_outline:
  overview_angle: "factory automation を「正解を教えるゲーム」ではなく、問題と解法の距離をプレイヤーが埋めるゲームとして整理する。"
  analysis_axis: "first-person 化が生む存在感と操作摩擦、voxel/grid による認知負荷低減、procedural world の学習導線、simple rules が scale して深さを作る設計を軸に読む。"
  application_target: "graze_log / Pulse Relay などで、複雑な部品を増やす前に、単純なルールの組み合わせ・初期条件・観測ログ付き feedback branch で深さと読解性を検証する場面に効く。"
  pros_cons: "メリットはプレイヤー主導の発見と検証運用を両立できる点。デメリットは first-person や大規模化が精密操作・把握性の摩擦を生むため、補助ルールなしでは混乱しやすい点。"
  verdict_pre: "部分採用。大規模 factory そのものではなく、readability を落とさず systemic depth を作る設計・検証手順として採用する。"

---

## raw_excerpt

短い引用: "the gap between the problem and the solution is basically the game"

80 Level の 2026-05-20 インタビュー。Foundry は voxel sandbox building と factory automation を組み合わせた multiplayer game。設計柱は、正解の遊び方を over-prescribe せず、tools と problems を渡し、solution は player に発見させること。first-person perspective は、工場を diagram として読む top-down とは違い、自分が作った factory の内部に立つ scale/presence を与える一方、precision と usability の friction を増やすため、voxel grid と axis-aligned building で mental friction を下げる。procedural world は単なる scenery ではなく、terrain、resource frequency、water、biomes、caves、buildable spaces を gameplay/aesthetic の両面から調整し、starting area は flat + starting resources nearby として early automation を始めやすくしている。systems depth については、個々の部品を難読化するより、simple rules が scale して interaction を生む方を重視。複雑そうに見えるが better decisions を生まない Blast Furnace 案は simplified された。feedback では screenshot/save/log 付き report と experimental branch を使い、大規模 update を closed room で完成させず dedicated players と検証している。

## why_relevant_to_games

systemic depth と readability の両立、初期地点の学習設計、player が想定外の規模で遊ぶ前提の検証に関する候補。小規模 prototype でも「複雑な部品」ではなく「組み合わせで深くなる単純 rule」を設計メモ化できる。
