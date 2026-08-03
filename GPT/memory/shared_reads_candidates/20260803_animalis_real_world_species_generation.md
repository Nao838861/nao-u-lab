---
title: "Show HN: I made Pokémon but with real animals in the real world"
url: "https://news.ycombinator.com/item?id=48270848"
collected_at: "2026-08-03T22:47:14+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, location-based-game, procedural-generation, llm, computer-vision, solo-dev]
---

## raw_excerpt

開発者は、現実の動物を撮影して収集する位置情報ゲーム Animalis の実装過程を説明している。基本フローは “photo animal” → GPT-4o による種判定 → “return species” → LLM が “create evolution chain, plus attributes, types and moves” → sprite の並列生成で、生成済みデータは “All data is cached.” として再利用する。事前に世界中の数百万種と進化系列の sprite を用意するのではなく、遭遇時に必要な種だけを生成する構成である。

ゲーム地図には OpenStreetMap を使い、森林・公園など自然区域に GPS が入った時だけ捕獲を許可する。市街地から約 500 m 離れるごとに動物の level band を 5 上げ、礼拝所を health centre、食料品店を shop、公園を gym に割り当てて世界規模の配置を作る。地図は物理世界全体を保持せず、決定的に逐次描画する。動物の鳴き声と保全状況も実行時取得し、希少・絶滅危惧の度合いを報酬へ反映する。公開約1か月、約20 player、約500種の遭遇を報告し、server は月約200ドル、画像生成は1 sprite 約0.04ドルで2枚/種としている。

## why_relevant_to_games

位置情報・土地利用・生成AIを一つの progression loop に結びつけた個人開発の実装事例。事前生成できない巨大 content space を encounter-time generation、cache、決定的地図生成で扱う設計を検討する場面に使える。
