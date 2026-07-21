---
title: "How Devs Designed a Scalable Ability System for Temtem: Swarm"
url: "https://80.lv/articles/how-devs-designed-a-scalable-ability-system-for-temtem-swarm"
collected_at: "2026-07-21T15:16:34.7630109+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, action, abilities, progression, data-driven, architecture]
evaluated_at: "2026-07-21T15:23:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-21T15:29:26+09:00"
last_decision: postpone
evidence: "Phase 3 final review: source explains architecture but provides no benchmark, defect data, iteration timing, or balance outcome"
next_action: revise_or_research
stale_after: "2026-08-20"
supersedes: []
gate_reason: >-
  250超の ability を、進行三層、共通 stat modifier、data-driven template、実行 class hierarchy に分解した設計は具体的で、問題から解法まで追える。
  ただし元記事は architecture の紹介に留まり、追加時間、変更影響範囲、defect 件数、balance iteration、performance、代替方式との比較を示していない。
  「251個目も最初と同様に追加できる」という結論を検証する評価がなく、約4000字の深い分析を記事固有の証拠だけで支えられないため、Phase 3 で投稿を見送る。
  技術講演、実装公開、または制作前後を比較できる postmortem が得られた時に再評価する。
suggested_post_outline:
  overview_angle: "ability の大量追加を個別実装の問題ではなく、数値・進行・発火責務を分離した共通基盤の問題として整理する。"
  analysis_axis: "Skills/Gears/Techniques の進行責務、base value と modifier の合成、template による level curve、共通処理と個別挙動を分ける script hierarchy を分析する。"
  application_target: "自分達の action prototype で、数値効果を共通 modifier pipeline に寄せ、少数 ability の組合せテストと balance 調整を core logic の書き換えなしで回す場面に効く。"
  pros_cons: "利点は追加と横断調整の影響範囲を狭め、組合せを増やせること。欠点は規模が小さい段階から完全な階層と汎用 stat system を入れると抽象化コストが先行すること。"
  verdict_pre: "部分採用。まず共通 stat/modifier と data template を採用し、class hierarchy は ability 種別が増えてから段階導入する。"
---

## raw_excerpt

原文の要点を日本語で採録する。『Temtem: Swarm』は player と enemy を合わせて 250 超の technique を扱うため、個別 ability を増やす問題を、perk、modifier、stat が相互作用する共通基盤の問題として組み立てた。player progression は、run 前に方向を定める Skill Tree の Skills、play 中の passive stat upgrade である Gears、moment-to-moment の行動を作る Techniques の三層で、すべて同じ custom stat system へ接続する。

中心は、base value に modifier を適用する統一 stat architecture である。MaxHealth の恒久 upgrade、Gear の bonus、一時的な poison debuff も同じ pipeline を通る。technique も data-driven template に level ごとの stat 変化を記述し、たとえば DC Beam の projectile 数を 1 から 3 へ増やし、別の projectile bonus と組み合わせる。これにより upgrade curve を変えるたびに core logic を書き直さずに済む。

script 側は共通の cooldown、stat interaction、activation を持つ `Technique` を基底に、`PlayerTechnique` と `EnemyTechnique` を分け、player 側を入力で起動する Active と cooldown 完了で自動発火する Passive に分ける。記事は、共通機能の一元化、個別 technique の追加、複数 script にまたがる balance change を両立させるため、この modifier system、template、class hierarchy を組み合わせたと述べる。

## why_relevant_to_games

ability 数が増える action prototype で、進行層・数値 modifier・実行 script を分離しながら組合せ可能性を保つ実装資料になる。
