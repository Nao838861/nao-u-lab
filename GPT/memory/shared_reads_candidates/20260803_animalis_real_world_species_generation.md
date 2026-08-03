---
title: "Show HN: I made Pokémon but with real animals in the real world"
url: "https://news.ycombinator.com/item?id=48270848"
collected_at: "2026-08-03T22:47:14+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, location-based-game, procedural-generation, llm, computer-vision, solo-dev]
evaluated_at: "2026-08-03T22:51:02+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-03T23:02:47+09:00"
last_decision: postponed
evidence: "Phase 3 final review: 公開約1か月・約20 playerの自己報告で、種判定精度・生成一貫性・位置情報安全性・費用scaleの評価がなく、現状では約4000字の結論を一次資料から支えられない"
next_action: candidate_revise
stale_after: "2026-09-02"
supersedes: []
gate_reason: >-
  encounter-time generation、cache、決定的地図生成、OpenStreetMap の土地利用を一つの progression loop に接続している。
  player／遭遇数と運用・画像生成費もあり、巨大 content space を個人制作で扱う手法とリスクを約4000字で具体化できる。
suggested_post_outline:
  overview_angle: "世界中の生物と地理を事前生成せず、遭遇時生成と cache で位置情報ゲームへ変える solo-dev architecture"
  analysis_axis: "種判定→能力・進化生成→sprite cache、OSM による行動 gate、決定的地図描画、運用費を分解する"
  application_target: "Log_cdx の content-heavy prototype で、必要時だけ生成し、安定 ID と cache で再現性・費用・待ち時間を制御する"
  pros_cons: "小規模でも巨大な題材空間を扱える一方、種判定誤り、生成一貫性、位置情報 safety、月額費用の検証が不足する"
  verdict_pre: "部分採用"
---

## raw_excerpt

開発者は、現実の動物を撮影して収集する位置情報ゲーム Animalis の実装過程を説明している。基本フローは “photo animal” → GPT-4o による種判定 → “return species” → LLM が “create evolution chain, plus attributes, types and moves” → sprite の並列生成で、生成済みデータは “All data is cached.” として再利用する。事前に世界中の数百万種と進化系列の sprite を用意するのではなく、遭遇時に必要な種だけを生成する構成である。

ゲーム地図には OpenStreetMap を使い、森林・公園など自然区域に GPS が入った時だけ捕獲を許可する。市街地から約 500 m 離れるごとに動物の level band を 5 上げ、礼拝所を health centre、食料品店を shop、公園を gym に割り当てて世界規模の配置を作る。地図は物理世界全体を保持せず、決定的に逐次描画する。動物の鳴き声と保全状況も実行時取得し、希少・絶滅危惧の度合いを報酬へ反映する。公開約1か月、約20 player、約500種の遭遇を報告し、server は月約200ドル、画像生成は1 sprite 約0.04ドルで2枚/種としている。

## why_relevant_to_games

位置情報・土地利用・生成AIを一つの progression loop に結びつけた個人開発の実装事例。事前生成できない巨大 content space を encounter-time generation、cache、決定的地図生成で扱う設計を検討する場面に使える。
