---
title: "Postmortem - Designer"
url: "https://itch.io/devlog/1529194/postmortem-designer.amp"
collected_at: "2026-08-12T02:01:44+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, playtesting, co-op, production]
evaluated_at: "2026-08-12T02:07:51+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-12T02:07:51+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-12T02:07:51+09:00"
next_action: keep_for_reference
stale_after: "2026-09-11"
supersedes: []
gate_reason: >-
  終盤の feature 優先で major bug を残したこと、fix の上書き、designer が mechanics の実装理解を手放したことはゲーム制作へ具体的に適用できる。しかし単一チームの短い回顧で、開発条件・判断過程・playtest の比較や定量結果が薄く、固有手法の中核もない。CoopEval 水準の約4000字を記事固有の根拠だけで支えると一般論の水増しになるため fail とする。
---

## raw_excerpt

原文の短い抜粋: “The core gameplay loop worked well and seemed to resonate with playtesters.”

Little Arthur の semester 開発を振り返った designer の一次記録。playtest では core gameplay loop が受け入れられ、初期には承認を得られなかった mechanics も反復調整で改善した。co-op は軽微な bug を残しながらも友人と遊ぶ体験として機能し、scene 内の physics object を動かして prop として利用できる点には、複数の playtest で明確な好反応があったという。

一方、短い schedule の終盤に final feature を優先したことで、既知の major bug が release build に残った。忘れられていたものに加え、いったん直した fix が repository 上の意思疎通不足で上書きされた例もある。respawn point が map と camera zone の外へ player を飛ばして camera を壊す不具合、player one しか item を拾えず combat feel を変える要素が事実上使えない不具合が具体例として挙げられている。

designer 自身は、programming が苦手なため mechanics の変更を programmer に任せ過ぎ、実装の仕組みを理解しないまま依存度を高めたことを最大の弱点の一つとしている。team 選定前の調査、skillset 外を含む各領域への関与、設計判断と実装理解を切り離さないことを次回への学びとして記録している。

## why_relevant_to_games

playtest で見えた面白さを残しつつ、終盤の feature 追加・bug 修正・repository 上の整合をどう優先するかを考える材料になる。設計者がコードを書かない場合でも、mechanics の実装理解と変更判断の ownership を失わないための具体的な失敗例でもある。
