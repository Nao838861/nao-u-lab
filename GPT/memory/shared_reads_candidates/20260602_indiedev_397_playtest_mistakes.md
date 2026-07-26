---
title: "We playtested 397 games in February, these are the top mistakes they made"
url: "https://www.reddit.com/r/IndieDev/comments/1rvynmb/we_playtested_397_games_in_february_these_are_the/"
collected_at: "2026-06-02T11:59:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, onboarding, ux, indie, telemetry]
evaluated_at: "2026-07-26T14:20:50.2021246+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T14:20:50.2021246+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T14:20:50.2021246+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  397件の頻出問題と修正案は prototype 出荷前チェックに再利用できるが、標本選定、分類手順、重複計上、母集団の偏りが開示されていない。
  数値の信頼範囲を説明できず、~4000字にすると一般的な UX チェックリストを水増しするため、ローカル参照に限定する。
---

## raw_excerpt

Reddit r/IndieDev 投稿。投稿者は indie game playtesting service を運営し、2026年2月に 397 games の playtest transcript を分析したとして、頻出問題トップ10を列挙している。問題カテゴリは、Unclear Objectives 39%、Poor Onboarding 38%、Audio Issues 29%、Unclear Stat Descriptions 25%、Unintuitive Controls 25%、Missing Feedback 24%、UI/UX Readability 24%、Settings Issues 17%、Visual Glitches 16%、Difficulty Imbalances 15%。各項目に「root cause」と「What to fix」が付いており、初見10分、objective visibility、interactive practice、volume slider 実動確認、stat tooltip、genre convention に沿う keybind、hit confirmation、contrast ratio、settings persistence、difficulty curve の数値グラフ化など、すぐチェックリスト化できる形で書かれている。論文ではないが、初見プレイヤーがどこで壊れるかを数値つきで並べた現場データとして使える。

Source lines: 79-104, 107-120, 123-169, 172-201, 204-249.

## why_relevant_to_games

新規 prototype の出荷前チェックで、面白さ判定より前に「初見で詰まる場所」を拾う mechanical checklist として使える。
