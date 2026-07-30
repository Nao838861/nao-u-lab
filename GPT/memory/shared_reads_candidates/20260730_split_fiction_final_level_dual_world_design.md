---
title: "Split Fiction's final level concept was originally meant for the whole game"
url: "https://www.gamedeveloper.com/design/split-fiction-s-final-level-concept-was-originally-meant-for-the-whole-game"
collected_at: "2026-07-30T19:16:42.0676563+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, level-design, co-op, puzzle-design, postmortem]
---

## raw_excerpt

Game Developer が GDC 2026 の Hannes Gille 講演をまとめた記事。『Split Fiction』最終面では、同じ空間を一方のプレイヤーは SF 世界、もう一方は fantasy 世界として見る。元は全編に適用する企画だったが、両世界の geometry と collision を精密に揃えながら実質二本分の art を制作する負担、二人が同じものを見ないまま進むことで共有体験が弱まる問題が prototype で判明し、最終面だけへ縮小された。これにより「高コストな一本のゲーム」ではなく「高コストだが強い一本の level」になり、十時間以上それぞれの世界に慣れた後で両方が重なる驚きも増した。

講演記録では puzzle の組み立てを、片方だけが手掛かりを見る information split、別々の操作を担う execution split、最後に二人の timing を合わせる段階として説明する。自画面の操作が忙しいと相手画面を見ないため、受動移動、両世界を同じ角度で見せる固定 camera、相手画面へ注意を向ける台詞も使った。concept の初披露では説明を挟まず、SF 側の pressure plate と fantasy 側の tree stump を同じ collision に置き、二人が自力で同一空間だと気づく構成にした。後半の画面越境 reveal では door animation の間に camera alignment を隠し、playtest で大きな反応を得た。複雑さを減らすほど、発見そのものへ注意を空けられるという設計記録になっている。

## why_relevant_to_games

協力 puzzle の役割分担を「情報・実行・同期」の三段で設計し、prototype で見つかった制作費と共同注意の問題を一つの決戦 level へ圧縮する際の参照になる。
