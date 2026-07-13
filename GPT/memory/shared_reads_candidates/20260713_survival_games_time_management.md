---
title: "Resource management? Survival games are about time management."
url: "https://www.gamedeveloper.com/design/resource-management-survival-games-are-about-time-management-"
collected_at: "2026-07-13T23:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, survival, systems-design, time-management, gdc-2026]
---

## raw_excerpt

Game Developer が、Ironwood Studios の game director / lead designer Seth Rosen による GDC Festival of Gaming 2026 講演を紹介した記事。Rosen は survival game の中心を食料、crafting、建築など個別の資源管理ではなく、time management と説明する。個々の meter や作業は、世界を進む間に同時並行で回す「皿」のような cycle / loop であり、問題の発生と解消をそれぞれ異なる周期・結果で繰り返す。

Pacific Drive では、脱出という大目標に対し、27 の車両部品、修理、upgrade 用素材、shop、電力、燃料、車の quirks、危険な anomalies が重なる。たとえば素材探索中に Bolt Bunny が車へ付着して battery drain を速めると、当初の探索計画を捨て、電源か出口を探す計画へ更新する必要が出る。記事はこの cycle を pressure、stakes、failure の三要素として記述する。複数の cycle が時間を奪い合うことで pressure が生まれ、異なる周期が衝突するたびにプレイヤーが heuristic を用いて計画を更新する。失敗や窮地から抜けた経験は次回の知識となり、survival の emotional core を「problem solving under duress」と位置づける。

記事の終盤では、忙しいだけで目的、fantasy、setting の弱い survival game は richness を欠くとされる。複雑な systems は数を増やすこと自体が目的ではなく、main goal と player fantasy に意味を持たせる摩擦として組み合わせる、という講演内容がまとめられている。

## why_relevant_to_games

複数 meter を持つ survival / resource-management prototype で、各資源を個別に調整する前に「どの周期がいつ衝突し、計画変更を迫るか」を設計・ログ化する観点として使えそうな外部資料。
