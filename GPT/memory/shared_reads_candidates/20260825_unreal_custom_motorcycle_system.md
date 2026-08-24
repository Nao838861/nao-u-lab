---
title: "Creating a Custom Motorcycle System for Unreal Engine 5"
url: "https://80.lv/articles/creating-a-custom-motorcycle-system-for-unreal-engine-5"
collected_at: "2026-08-25T04:21:19+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, unreal-engine, physics, vehicle-design, game-feel, debugging]
evaluated_at: "2026-08-25T04:25:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-25T04:32:29.480469+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787599949480469"
next_action: none
stale_after: "2026-09-24"
supersedes: []
posted:
  ts: "1787599949.480469"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787599949480469"
  char_count: 4486
  posted_at: "2026-08-25T04:32:29.480469+09:00"
gate_reason: |-
  標準 vehicle model の限界を状態列挙で判定し、rider を含む力学系、静止・動摩擦、転倒後の failure play、診断可視化まで一つの設計判断として追える。
  物理 game feel と custom system の採否を具体場面へ落とせ、成功談だけでなく一年規模のコストと適用境界も分析できるため通過とする。
suggested_post_outline:
  overview_angle: "四輪向け標準 model の tuning 失敗から、二輪と rider を全状態で扱う独自 core へ移った判断過程を中心に書く。"
  analysis_axis: "走行外 state の列挙、補正同士の干渉、摩擦 rule、failure state の遊び化、診断 tool への投資を、model boundary の発見として分析する。"
  application_target: "Nao_u_BOT の物理 prototype で、標準 component 採用前に全状態を列挙し、例外補正が増えた時点で core model と可視化 tool を同時設計する判断へ使う。"
  pros_cons: "利点は一貫した game feel、転倒や復帰まで遊びにできること、debug 可能性。弱点は一年規模の実装費、物理知識への依存、標準 engine 更新の恩恵を失うこと。"
  verdict_pre: "部分採用。独自二輪 system 自体ではなく、状態列挙で model 境界を見抜き、failure play と診断表示を先に試す方法を採る。"
---

## raw_excerpt

著作権に配慮し、記事本文の逐語引用ではなく要点を日本語で採取する。作者は linear road drama のほぼ全編に登場し、物語上の第二主人公でもある motorcycle のため、Unreal Engine 5 の Chaos Vehicles を二、三か月試した後、四回の作り直しを経て独自 core を一年かけて実装した。一般的な四輪 vehicle model に gyroscope、tire、suspension の補正を積むと、物理そのものではなく補正同士の相互作用を debug する状態になったという。二輪では低速の capsize、中速域への遷移、高速での自己安定が steering geometry、mass distribution、tire behavior から生じる。rider も表示 mesh ではなく、位置と行動で力学へ参加する mass として同一 system に含めた。

独自化の判断では、走行以外の状態を列挙した。kickstand で駐車、転倒、傾斜面で横倒し、押して後退、engine off で rolling、bump start、地面から持ち上げる、といった場面は通常の vehicle movement の想定外だった。転倒後は即 respawn せず、重量を感じながら button を連打して持ち上げる小さな event にした。slide は停止距離 curve ではなく、slope の力と surface resistance の関係で決め、傾斜ごとの停止・滑走や静止摩擦と動摩擦の差を同じ rule から出す。開発期間の多くは ground、contact、mass、rest state を可視化する診断 tool に使われた。作者は、object が通る全 state の大半が A-to-B 移動なら engine 標準を使い、そうでなければ tuning では model の境界を越えられない、と整理している。

## why_relevant_to_games

標準 system を調整するか独自 core を作るかを、物体が通る状態列挙で切り分けた実例。物理 game feel、failure state の遊び化、simulation と診断 tool の同時設計に使える収集資料である。
