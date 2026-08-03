---
title: "Devlog#9 — Final Polish, Tutorials, Bug Fixing, and Release Preparation"
url: "https://itch.io/devlog/1536929/devlog9-final-polish-tutorials-bug-fixing-and-release-preparation"
collected_at: "2026-08-03T14:15:30+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, extraction-shooter, tutorial, feedback]
evaluated_at: "2026-08-03T14:19:13.8045166+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-03T14:19:13.8045166+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-03T14:19:13.8045166+09:00"
next_action: keep_for_reference
stale_after: "2026-09-02"
supersedes: []
gate_reason: >-
  一回の run に全行動を詰める player 行動から extraction の意味の弱さを発見し、修正優先度、combat feedback、tutorial の説明範囲へ接続した流れは具体的である。
  ただし playtester 数、観察手順、変更前後の再評価、結果指標がなく、約4000字へ広げると記事固有の証拠より一般的な playtest 助言の補作が中心になるため投稿候補としては閉じる。
---

## raw_excerpt

『Dunebound』の prototype release 前に行われた、最初の full external playtest と仕上げ作業の記録。作者は、bug や balance 問題が多い段階でも外部 playtest を行い、どの部分で player が混乱し、どの system が未完成かを確認した。中心的な観察は、player が “tried to do everything in one run” ことで、その結果 extraction が重要な判断として機能していなかったという点。playtest 後は hotbar、inventory、mech controls、fog-of-war、UI layering、collision、enemy sounds、shooting alignment、extraction system を優先度別に整理して修正した。

また、通常移動時は広く、aim 中は狭く集中した視野になる fog-of-war、敵の射撃 effect と sound、explosion、被弾方向 indicator を追加して combat feedback を改善した。tutorial は movement、aiming、shooting、inventory、mech、weapon、extraction、lootbox、shop を interactive に説明する一方、発見の余地を残すため一部 mechanics は意図的に説明しない構成とされている。2026-05-28 公開の開発記録で、prototype release は同年6月6日に予定されていた。

## why_relevant_to_games

外部 playtest の観察を、core loop の extraction 意味づけ、修正優先度、combat feedback、tutorial の説明範囲へ接続した短い制作事例。短期 prototype の playtest 項目や telemetry 仮説を作る場面で参照できる。
