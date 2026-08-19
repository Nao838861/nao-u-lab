---
title: "How Devs Designed a Scalable Ability System for Temtem: Swarm"
url: "https://80.lv/articles/how-devs-designed-a-scalable-ability-system-for-temtem-swarm"
collected_at: "2026-07-21T15:16:34.7630109+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, action, abilities, progression, data-driven, architecture]
evaluated_at: "2026-08-20T03:09:10+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-20T03:09:10+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-20T03:09:10+09:00"
next_action: keep_for_reference
stale_after: "2026-09-19"
supersedes: []
gate_reason: >-
  250超の ability を進行層、共通 modifier、data template、実行 class に分ける構造は具体的である。
  しかし記事は追加時間、欠陥、balance iteration、性能、代替方式との比較を一切示していない。
  scalability の結論を検証する評価がなく、約4000字の分析を記事固有の証拠で支えられないため不採用とする。
---

## raw_excerpt

原文の要点を日本語で採録する。『Temtem: Swarm』は player と enemy を合わせて 250 超の technique を扱うため、個別 ability を増やす問題を、perk、modifier、stat が相互作用する共通基盤の問題として組み立てた。player progression は、run 前に方向を定める Skill Tree の Skills、play 中の passive stat upgrade である Gears、moment-to-moment の行動を作る Techniques の三層で、すべて同じ custom stat system へ接続する。

中心は、base value に modifier を適用する統一 stat architecture である。MaxHealth の恒久 upgrade、Gear の bonus、一時的な poison debuff も同じ pipeline を通る。technique も data-driven template に level ごとの stat 変化を記述し、たとえば DC Beam の projectile 数を 1 から 3 へ増やし、別の projectile bonus と組み合わせる。これにより upgrade curve を変えるたびに core logic を書き直さずに済む。

script 側は共通の cooldown、stat interaction、activation を持つ `Technique` を基底に、`PlayerTechnique` と `EnemyTechnique` を分け、player 側を入力で起動する Active と cooldown 完了で自動発火する Passive に分ける。記事は、共通機能の一元化、個別 technique の追加、複数 script にまたがる balance change を両立させるため、この modifier system、template、class hierarchy を組み合わせたと述べる。

## why_relevant_to_games

ability 数が増える action prototype で、進行層・数値 modifier・実行 script を分離しながら組合せ可能性を保つ実装資料になる。
