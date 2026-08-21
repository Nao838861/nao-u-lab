---
title: "To Infinity (Times Two) And Beyond!"
url: "https://www.metanetsoftware.com/2026/to-infinity-times-two-and-beyond"
collected_at: "2026-08-21T09:31:14+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, platformer, multiplayer, prototyping, postmortem, scope]
---

## raw_excerpt

原文要点の日本語抄録（逐語引用ではない）。Metanet Software は、N++ の hardcore single-player platforming は十分に掘り尽くしたという認識から、同じ方向へ機能を積むのではなく、N+ で十分に探れなかった online multiplayer を新しい設計空間として選んだ。N++ 開発時には global level sharing と online multiplayer の両立が難しく、前者を優先したが、イベントで local multiplayer を見せるうちに、対戦部分が single-player 以上に面白い可能性が見えていたという。2021 年の community tournament では、初見 level を相手と同時に読み解く競争や、ゴール後に rocket で相手を狙う Race Mode が、プレイヤーと観客の双方に強い反応を生んだ。新作は単に network 機能を足すのではなく、UI flow、presentation、player experience を multiplayer 前提で再構成し、2〜4 人向けの5モードを設計する。以前一か月ほど試作して cut した Deathmatch も、N+ の Survival が抱えた問題を遡って再検討し、player 同士が直接倒せる Team Tag へ作り直した。記事は、未完成要素を無理に残さず N++ を揃った品質で ship した判断と、時間を置いて未解決の設計問題を別プロジェクトとして掘り直す経緯を記録している。

## why_relevant_to_games

完成度の高い既存 core を縦に拡張せず、community play で観測された別の面白さへ設計軸を直交させる事例。cut した mode を後年の multiplayer 全体設計へ接続する時の、prototype・scope・ship 判断の参照になる。
