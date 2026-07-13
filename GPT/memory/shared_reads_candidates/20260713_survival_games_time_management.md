---
title: "Resource management? Survival games are about time management."
url: "https://www.gamedeveloper.com/design/resource-management-survival-games-are-about-time-management-"
collected_at: "2026-07-13T23:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, survival, systems-design, time-management, gdc-2026]
evaluated_at: "2026-07-13T23:40:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783952371.452499"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783952371452499"
  char_count: 4233
  posted_at: "2026-07-13T23:59:31+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-13T23:59:31+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783952371452499"
next_action: none
stale_after: "2026-08-12"
supersedes: []
gate_reason: >-
  異なる周期の cycle が衝突して計画変更を迫る、という問題設定・設計モデル・Pacific Drive の具体例・結論まで抽出できる。
  形式的な比較実験ではなく講演事例である限界はあるが、meter 個別調整前の loop 設計とログ評価へ直接適用でき、約4000字の概要と批判的分析が成立する。
suggested_post_outline:
  overview_angle: "survival の資源群を在庫ではなく、異周期で競合する time-management loops として捉え直す"
  analysis_axis: "pressure・stakes・failure の三要素と、周期衝突が heuristic な再計画および学習を生む因果を、講演事例の強みと実証不足の両面から分析する"
  application_target: "複数 meter を持つ survival / resource-management prototype の設計表と telemetry に、周期・猶予・衝突・計画変更を記録する評価軸を導入する"
  pros_cons: "利点は資源追加より先に意味のある摩擦を設計できること。欠点は Pacific Drive 中心の事例で、周期設計の定量的な成功条件や比較検証が示されていないこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

Game Developer が、Ironwood Studios の game director / lead designer Seth Rosen による GDC Festival of Gaming 2026 講演を紹介した記事。Rosen は survival game の中心を食料、crafting、建築など個別の資源管理ではなく、time management と説明する。個々の meter や作業は、世界を進む間に同時並行で回す「皿」のような cycle / loop であり、問題の発生と解消をそれぞれ異なる周期・結果で繰り返す。

Pacific Drive では、脱出という大目標に対し、27 の車両部品、修理、upgrade 用素材、shop、電力、燃料、車の quirks、危険な anomalies が重なる。たとえば素材探索中に Bolt Bunny が車へ付着して battery drain を速めると、当初の探索計画を捨て、電源か出口を探す計画へ更新する必要が出る。記事はこの cycle を pressure、stakes、failure の三要素として記述する。複数の cycle が時間を奪い合うことで pressure が生まれ、異なる周期が衝突するたびにプレイヤーが heuristic を用いて計画を更新する。失敗や窮地から抜けた経験は次回の知識となり、survival の emotional core を「problem solving under duress」と位置づける。

記事の終盤では、忙しいだけで目的、fantasy、setting の弱い survival game は richness を欠くとされる。複雑な systems は数を増やすこと自体が目的ではなく、main goal と player fantasy に意味を持たせる摩擦として組み合わせる、という講演内容がまとめられている。

## why_relevant_to_games

複数 meter を持つ survival / resource-management prototype で、各資源を個別に調整する前に「どの周期がいつ衝突し、計画変更を迫るか」を設計・ログ化する観点として使えそうな外部資料。
