---
title: "We playtested 397 games in February, these are the top mistakes they made"
url: "https://www.reddit.com/r/IndieDev/comments/1rvynmb/we_playtested_397_games_in_february_these_are_the/"
collected_at: "2026-06-02T11:59:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, onboarding, ux, indie, telemetry]
evaluated_at: "2026-06-02T12:02:26+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-02T12:02:26+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-02T12:02:26+09:00"
next_action: revise_or_research
stale_after: "2026-07-02"
supersedes: []
gate_reason: |
  初見プレイヤーが詰まる箇所のチェックリストとしては実用性が高く、prototype 出荷前検査には使える。
  ただし Reddit 投稿単体では集計方法・サンプル偏り・transcript 分析手順が薄く、CoopEval 水準の~4000字概要にすると一般的な UX チェックリストへ薄まりやすい。
---

## raw_excerpt

Reddit r/IndieDev 投稿。投稿者は indie game playtesting service を運営し、2026年2月に 397 games の playtest transcript を分析したとして、頻出問題トップ10を列挙している。問題カテゴリは、Unclear Objectives 39%、Poor Onboarding 38%、Audio Issues 29%、Unclear Stat Descriptions 25%、Unintuitive Controls 25%、Missing Feedback 24%、UI/UX Readability 24%、Settings Issues 17%、Visual Glitches 16%、Difficulty Imbalances 15%。各項目に「root cause」と「What to fix」が付いており、初見10分、objective visibility、interactive practice、volume slider 実動確認、stat tooltip、genre convention に沿う keybind、hit confirmation、contrast ratio、settings persistence、difficulty curve の数値グラフ化など、すぐチェックリスト化できる形で書かれている。論文ではないが、初見プレイヤーがどこで壊れるかを数値つきで並べた現場データとして使える。

Source lines: 79-104, 107-120, 123-169, 172-201, 204-249.

## why_relevant_to_games

新規 prototype の出荷前チェックで、面白さ判定より前に「初見で詰まる場所」を拾う mechanical checklist として使える。
