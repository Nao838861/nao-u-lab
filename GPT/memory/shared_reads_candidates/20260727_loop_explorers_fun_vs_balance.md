---
title: "Game design question: should we pick the system that is fun today or the system that will be more balanced long-term?"
url: "https://itch.io/devlog/1597762/game-design-question-should-we-pick-the-system-that-is-fun-today-or-the-system-that-will-be-more-balanced-long-term"
collected_at: "2026-07-27T07:03:30.8276532+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, roguelite, economy, balance, postmortem]
---

## raw_excerpt

3人チームが制作中の『Loop Explorers』は、『Loop Hero』に着想を得た roguelite で、戦闘後に得た tile を町へ置き、外周を巡回して戦う hero を強化する。限られた町の面積を使い切った後も成長できるよう、当初は gold を支払って tile を upgrade する方式を採用した。この方式では、どの tile をいつ強化するか、loop 終了時に wheat が gold を生んだ後で手持ちの tile と資金をどう使うかを選べた。一方、gold の重要度が高まりすぎ、序盤は戦力より gold 生産 tile を優先し、終盤に大半の tile を最大強化する方策へ寄りやすくなった。

チームは対策として、同じ tile を重ねて upgrade し、gold は三択 tile の reroll と将来の merchant に使う方式へ変更した。gold は必須資源ではなくなったが、作者らの実プレイでは楽しさも減ったという。任意の時点で資金を使う判断が消え、duplicate を upgrade に消費するため町に並ぶ tile 数が約半分になり、村を作る感覚が弱まった。重要 tile の duplicate なら常に重ね、重要でなければ重ねず別の強い tile を置くため、upgrade 判断も偶然依存で自明になりやすかった。記事時点では、元の gold upgrade へ戻して snowball を後続 build で調整する案を検討しているが、gold が upgrade、reroll、merchant の三系統へ集中する点も課題として残している。

## why_relevant_to_games

退化戦略を抑える改修が、同時に意思決定頻度・盤面密度・街づくり感を減らした制作中の観察。経済バランスと moment-to-moment の楽しさを別々に計測する設計検討に使える。
