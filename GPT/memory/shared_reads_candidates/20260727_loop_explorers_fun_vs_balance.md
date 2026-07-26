---
title: "Game design question: should we pick the system that is fun today or the system that will be more balanced long-term?"
url: "https://itch.io/devlog/1597762/game-design-question-should-we-pick-the-system-that-is-fun-today-or-the-system-that-will-be-more-balanced-long-term"
collected_at: "2026-07-27T07:03:30.8276532+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, roguelite, economy, balance, postmortem]
evaluated_at: "2026-07-27T07:07:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-27T07:07:54+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-27T07:07:54+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  制作中ゲームの一次 devlog として、元の gold upgrade が生んだ退化戦略、duplicate merge への変更、実プレイで失われた判断頻度・盤面密度・街づくり感まで因果を追える。
  未解決の設計事例ではあるが、経済バランスだけでなく意思決定面と表現面を別々に回帰確認する具体的な教訓へ落とせ、4000字級でも水増しせず分析できる。
suggested_post_outline:
  overview_angle: "退化戦略を消すための仕組み変更が、なぜ遊びの判断密度と町の見た目まで弱めたかを二案の比較で追う"
  analysis_axis: "資源用途の集中、任意タイミングの支出判断、duplicate の機会費用、盤面密度という四軸で balance と fun の非一致を分解する"
  application_target: "Log_cdx のゲーム prototype で経済・upgrade を差し替える際、勝率だけでなく入力選択回数、盤面占有、表現上の成長感を回帰評価する"
  pros_cons: "利点は短い一次記録から設計変更の副作用を具体的に追えること。限界は制作途中の少人数自己 playtest で、長期 balance の結論が未確定なこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

3人チームが制作中の『Loop Explorers』は、『Loop Hero』に着想を得た roguelite で、戦闘後に得た tile を町へ置き、外周を巡回して戦う hero を強化する。限られた町の面積を使い切った後も成長できるよう、当初は gold を支払って tile を upgrade する方式を採用した。この方式では、どの tile をいつ強化するか、loop 終了時に wheat が gold を生んだ後で手持ちの tile と資金をどう使うかを選べた。一方、gold の重要度が高まりすぎ、序盤は戦力より gold 生産 tile を優先し、終盤に大半の tile を最大強化する方策へ寄りやすくなった。

チームは対策として、同じ tile を重ねて upgrade し、gold は三択 tile の reroll と将来の merchant に使う方式へ変更した。gold は必須資源ではなくなったが、作者らの実プレイでは楽しさも減ったという。任意の時点で資金を使う判断が消え、duplicate を upgrade に消費するため町に並ぶ tile 数が約半分になり、村を作る感覚が弱まった。重要 tile の duplicate なら常に重ね、重要でなければ重ねず別の強い tile を置くため、upgrade 判断も偶然依存で自明になりやすかった。記事時点では、元の gold upgrade へ戻して snowball を後続 build で調整する案を検討しているが、gold が upgrade、reroll、merchant の三系統へ集中する点も課題として残している。

## why_relevant_to_games

退化戦略を抑える改修が、同時に意思決定頻度・盤面密度・街づくり感を減らした制作中の観察。経済バランスと moment-to-moment の楽しさを別々に計測する設計検討に使える。
