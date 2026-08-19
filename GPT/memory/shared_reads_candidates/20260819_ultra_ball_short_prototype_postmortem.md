---
title: "Postmortem: Ultra Ball"
url: "https://www.gamedeveloper.com/design/post-mortem-ultra-ball"
collected_at: "2026-08-19T20:46:46+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, prototyping, arcade, playtesting, scope]
---

## raw_excerpt
James Rowbotham が Unreal Engine 5 の練習を兼ね、約20時間の開発と約5時間の公開準備で完成させた短期 arcade prototype の時系列記録。初期案は上下の paddle を左右の mouse button で別々に動かすものだったが、操作が複雑で感触も悪いと考え、ball が向かう側の paddle だけを自動的に操作対象にした。作者は早期に “get the core game loop in as soon as possible” とし、ball、match state、level data、save、簡易 UI、cooked build まで最初の約5時間で通している。短い作業時間では juice 追加に寄って完成へ進んでいない感覚が生じたため、level 案を紙に描き、player 視点の難度順に並べた。高速化に伴い camera shake や bounce sound が常時発火して過剰になるため、feedback は短く締める必要があった。終盤には他者 playtest で bug と改善点を拾い、難しすぎる逆操作 level は通常進行から外す一方、最終 challenge へ再配置した。作者は “Always Playtest” と “Scope Creep” を振り返り、追加可能でも prototype の目的を優先して終了を決めている。

## why_relevant_to_games
短時間の小規模 prototype で、入力の単純化、最初の playable loop、level 順序設計、高速ゲームの feedback 密度、難しすぎる mechanic の再配置、完成線の引き方を追える制作記録。
