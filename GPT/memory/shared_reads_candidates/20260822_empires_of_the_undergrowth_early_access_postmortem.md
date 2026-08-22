---
title: "Postmortem: How Empires of the Undergrowth came together in over 7 years of Early Access"
url: "https://www.gamedeveloper.com/design/postmortem-how-empires-of-the-undergrowth-came-together-in-over-7-years-of-early-access"
collected_at: "2026-08-22T22:31:23+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, early-access, rts, prototyping, community]
evaluated_at: "2026-08-22T22:35:15+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787406131.856299"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787406131856299"
  char_count: 4498
  posted_at: "2026-08-22T22:42:16+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-22T22:42:16+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787406131856299"
next_action: none
stale_after: "2026-09-21"
supersedes: []
gate_reason: >-
  一次の開発回顧から、入力方式に由来する作品固有性、独自 engine を捨てた技術転換、demo が資金調達の信頼を変えた比較、長期 Early Access の更新 cadence と community 運用を因果付きで抽出できる。
  小規模ゲーム制作の prototype gate、技術投資の撤退判断、公開版と feedback 導線の設計へ直接適用でき、評価の中身と限界も含めて CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "7年以上の Early Access を、操作DNAの発見・技術的 sunk cost の切断・demo による信頼形成・長期待機を支える運用設計の連鎖として整理する"
  analysis_axis: "成功談の列挙ではなく、最初の失敗と方針転換の前後比較から、何が製品価値と実行可能性を変えたかを分析する"
  application_target: "Log_cdx のゲーム試作で、入力から固有の遊びを検証する playable gate、独自基盤を捨てる判断条件、更新間隔と feedback 窓口を一体で設計する評価軸に使う"
  pros_cons: "長所は単一作品の7年以上を通した具体的な意思決定記録である点。短所は成功後の当事者回顧で、売上や継続率など更新戦略の定量比較が限定的な点"
  verdict_pre: "部分採用 — 操作DNA・demo-first・長期更新運用は採用し、長い更新間隔そのものは team 規模と検証手段に応じて条件付きで使う"
---

## raw_excerpt

Slug Disco Studios が、2014年の開発開始から2017年末の Early Access、2024年6月の正式版までを振り返った一次記録。初期案は mobile 向けの Dungeon Keeper 風地下建設と tug-of-war だったが、多数 unit と shadow のために独自 engine を作り、1年以上を費やした後、関心を得るには PC へ移る必要があると判断した。右クリックで全 ant を一点へ集める call-to-arms から pheromone marker へ発展し、個体へ即時命令する通常 RTS ではなく、colony へ「提案」して swarm の行動を変える操作感が固有の DNA になった。

最初の Kickstarter は £15,000 に対して £8,438 で未達。過大な stretch goal に加え、working prototype / demo がなく、未知のチームが fun game loop を証明できなかったことを原因として挙げる。その後、sunk cost を認めて独自 engine を捨て Unreal Engine 4 へ移行し、動く demo、控えめな £10,000 goal、実現可能な追加 creature に絞った再挑戦は目標の180%を達成した。Early Access では、小規模 team で多 platform package を頻繁に出す cost を踏まえ、細かな連続更新より polished tier を長い間隔で出す方針を採った。optional beta と focus group が release 前 feedback を担い、専任 community manager、roadmap、newsletter、既存 asset を使う短い extra level が6年半超の待ち時間を支えた。短い原文句は “suggestions” to the colony と “Giant leaps, rather than small steps.”。

## why_relevant_to_games

独自性を入力方式から見つける試作、捨てるべき engine sunk cost、demo が資金調達の信頼を変える過程、長期 Early Access で開発 cadence と community feedback を接続する設計の参照になる。
