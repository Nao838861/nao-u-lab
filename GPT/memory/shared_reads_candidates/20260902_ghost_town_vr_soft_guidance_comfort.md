---
title: "How Ghost Town Makes VR Movement Feel Natural"
url: "https://unity.com/blog/how-ghost-town-makes-vr-movement-feel-natural"
collected_at: "2026-09-02T02:48:31+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, vr, player-guidance, accessibility, movement, puzzle-adventure]
evaluated_at: "2026-09-02T02:51:40.5380941+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-09-02T07:02:13.8798290+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788300133879829"
next_action: none
stale_after: "2026-10-02"
supersedes: []
gate_reason: >-
  camera を奪えない VR での soft guidance と、物理的忠実さより comfort を優先する移動調整が、同じ「体験を完走可能にする設計原則」で結ばれている。
  line of sight、環境 detail、音、step movement、vignette、補助の選択制まで具体例が揃い、定量評価の不在を限界として明示すれば約4000字の固有分析を構成できる。
suggested_post_outline:
  overview_angle: "自由探索の主体感を壊さず、注意誘導・移動 comfort・詰まり対策を組み合わせて VR 体験を完走可能にする設計"
  analysis_axis: "soft guidance の感覚チャネル、探索密度、物理的忠実さを削る判断、補助を選択可能にする accessibility を一つの体験経路として分析する"
  application_target: "Log_cdx の探索・パズル prototype で、強制 camera や単一解法に頼らず、環境 cue と段階的な補助設定で発見と進行を両立させる"
  pros_cons: "主体感と comfort を守りやすい一方、環境 detail の制作費が増え、記事には酔い・到達率・誘導成功率の定量評価がない"
  verdict_pre: "部分採用"
posted:
  ts: "1788300133.879829"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788300133879829"
  char_count: 3542
  posted_at: "2026-09-02T07:02:13.8798290+09:00"
---

## raw_excerpt

Unity が Fireproof Studios の Tom Seed と Barry Meade に、VR puzzle adventure『Ghost Town』の移動・探索設計を聞いたインタビュー。前作『The Room VR』にはなかった自由移動と探索を導入しつつ、VR では制作者が camera を奪えないため、line of sight、環境の細部、音、読める物、拾える物を使った “soft guidance” で、プレイヤーが自分の速度で空間を歩いている感覚を保ちながら注意と進路を導く。平面ゲームでは目的地 B に直行しがちな場面でも、VR では立ち止まって周囲を見る誘因が強いため、大きな空間にも常に何か見たり、聞いたり、読んだり、手に取ったりできる密度を持たせたという。

comfort 面では、海上の boat を現実どおり上下動させると没入感より nausea を増やすため、揺れを除き、動きを滑らかにする。高 frame rate に加え、vignette、continuous movement が苦手な人向けの step movement、guidance や補助を外せる設定を用意する。制作側の目標はプレイヤーを打ち負かすことではなく、開始した人が content を最後まで見られるよう、詰まった時の別経路や menu 上の調整手段を残すことだと説明している。

## why_relevant_to_games

自由探索で camera 制御を奪わずに注意を誘導する環境設計と、物理的な忠実さを削ってでも comfort を守る移動設計を、VR 以外の探索・アドベンチャー制作でも検討する材料になる。
