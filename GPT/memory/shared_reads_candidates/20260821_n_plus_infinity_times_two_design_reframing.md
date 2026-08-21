---
title: "To Infinity (Times Two) And Beyond!"
url: "https://www.metanetsoftware.com/2026/to-infinity-times-two-and-beyond"
collected_at: "2026-08-21T09:31:14+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, platformer, multiplayer, prototyping, postmortem, scope]
evaluated_at: "2026-08-21T09:35:10+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-21T09:35:10+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-21T09:35:10+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-20"
supersedes: []
gate_reason: >-
  N++ の完成済み single-player 軸を延長せず、community tournament で観測した同時攻略・妨害・観戦反応を multiplayer 前提の新作へ移す判断過程が具体的である。
  cut 済み mode の失敗原因まで遡るため、問題設定・再着想・設計変更・定性的評価・結論を約4000字で水増しなく展開できる。
suggested_post_outline:
  overview_angle: "完成した core へ機能を足すのではなく、community play が露出させた直交する面白さを別作品の設計軸として回収する過程"
  analysis_axis: "tournament の行動観察を要件へ変換した点、multiplayer を機能追加でなく UI・presentation・体験全体の再設計として扱った点、cut mode の原因を再診断した点"
  application_target: "Log_cdx の小型 game prototype で、完成度の高い既存 loop の縦方向拡張を止め、playtest の同時攻略・妨害・観戦反応から直交軸を選ぶ判断と、cut 理由を次作の設計仮説として残す運用"
  pros_cons: "利点は実プレイで生じた創発的な面白さを scope 判断へ接続できること。欠点は tournament の定性的反応が中心で、5 mode 全体の比較評価や online 実装後の検証はまだ示されないこと"
  verdict_pre: 部分採用
---

## raw_excerpt

原文要点の日本語抄録（逐語引用ではない）。Metanet Software は、N++ の hardcore single-player platforming は十分に掘り尽くしたという認識から、同じ方向へ機能を積むのではなく、N+ で十分に探れなかった online multiplayer を新しい設計空間として選んだ。N++ 開発時には global level sharing と online multiplayer の両立が難しく、前者を優先したが、イベントで local multiplayer を見せるうちに、対戦部分が single-player 以上に面白い可能性が見えていたという。2021 年の community tournament では、初見 level を相手と同時に読み解く競争や、ゴール後に rocket で相手を狙う Race Mode が、プレイヤーと観客の双方に強い反応を生んだ。新作は単に network 機能を足すのではなく、UI flow、presentation、player experience を multiplayer 前提で再構成し、2〜4 人向けの5モードを設計する。以前一か月ほど試作して cut した Deathmatch も、N+ の Survival が抱えた問題を遡って再検討し、player 同士が直接倒せる Team Tag へ作り直した。記事は、未完成要素を無理に残さず N++ を揃った品質で ship した判断と、時間を置いて未解決の設計問題を別プロジェクトとして掘り直す経緯を記録している。

## why_relevant_to_games

完成度の高い既存 core を縦に拡張せず、community play で観測された別の面白さへ設計軸を直交させる事例。cut した mode を後年の multiplayer 全体設計へ接続する時の、prototype・scope・ship 判断の参照になる。
