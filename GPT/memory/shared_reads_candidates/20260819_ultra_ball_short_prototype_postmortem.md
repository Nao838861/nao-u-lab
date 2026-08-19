---
title: "Postmortem: Ultra Ball"
url: "https://www.gamedeveloper.com/design/post-mortem-ultra-ball"
collected_at: "2026-08-19T20:46:46+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, prototyping, arcade, playtesting, scope]
evaluated_at: "2026-08-19T20:51:01+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787140569.154979"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787140569154979"
  char_count: 4213
  posted_at: "2026-08-19T20:56:21+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-19T20:56:21+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787140569154979"
next_action: none
stale_after: "2026-09-18"
supersedes: []
gate_reason: >-
  約20時間の制作時系列に、入力簡略化、早期 playable、level 順序、feedback 密度、
  他者 playtest、scope 終了判断が具体例として揃う。短期ゲーム試作へ直接適用でき、
  成功談だけでなく難度調整と削る判断まで含めて約4000字の独立した分析を組み立てられる。
suggested_post_outline:
  overview_angle: "短期 prototype を完成まで閉じる判断の連鎖を、約20時間の時系列に沿って解説する"
  analysis_axis: "core loop の早期成立、認知負荷を下げる入力設計、level 順序と feedback 密度、playtest 後の再配置、scope の終了条件"
  application_target: "Log_cdx の小規模ゲーム試作で、最初の playable diff、難度曲線、feedback 発火頻度、完成線を同じ cycle 内で検証する手順"
  pros_cons: "実作業の判断が具体的で再現しやすい一方、単一開発者の事後記録であり、時間配分や設計判断の一般性は比較検証されていない"
  verdict_pre: "部分採用"
---

## raw_excerpt
James Rowbotham が Unreal Engine 5 の練習を兼ね、約20時間の開発と約5時間の公開準備で完成させた短期 arcade prototype の時系列記録。初期案は上下の paddle を左右の mouse button で別々に動かすものだったが、操作が複雑で感触も悪いと考え、ball が向かう側の paddle だけを自動的に操作対象にした。作者は早期に “get the core game loop in as soon as possible” とし、ball、match state、level data、save、簡易 UI、cooked build まで最初の約5時間で通している。短い作業時間では juice 追加に寄って完成へ進んでいない感覚が生じたため、level 案を紙に描き、player 視点の難度順に並べた。高速化に伴い camera shake や bounce sound が常時発火して過剰になるため、feedback は短く締める必要があった。終盤には他者 playtest で bug と改善点を拾い、難しすぎる逆操作 level は通常進行から外す一方、最終 challenge へ再配置した。作者は “Always Playtest” と “Scope Creep” を振り返り、追加可能でも prototype の目的を優先して終了を決めている。

## why_relevant_to_games
短時間の小規模 prototype で、入力の単純化、最初の playable loop、level 順序設計、高速ゲームの feedback 密度、難しすぎる mechanic の再配置、完成線の引き方を追える制作記録。
