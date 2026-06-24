---
title: "From the Ground Up: Rethinking Quality in Games"
url: "https://schedule.gdconf.com/session/from-the-ground-up-rethinking-quality-in-games/915041"
collected_at: "2026-06-22T10:59:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [qa, automation, telemetry, game-production, playtesting, gdc]
evaluated_at: "2026-06-22T11:02:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-22T11:06:05+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782093954581069"
next_action: none
stale_after: "2026-07-22"
supersedes: []
posted:
  ts: "1782093954.581069"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782093954581069"
  char_count: 3518
  posted_at: "2026-06-22T11:06:05+09:00"
gate_reason: |-
  Quality を bug finding から automation / data / testing / upskilling の workflow へ再定義する問題設定が明確。
  takeaway に Gen AI、team structure、testing efficiency、collaboration、development outcomes まで含まれ、prototype の検証設計へ具体的に落とせる。
suggested_post_outline:
  overview_angle: "ゲーム QA をバグ発見係ではなく、telemetry・automation・role upskilling を束ねる production workflow として再設計する話として書く。"
  analysis_axis: "大規模化と複雑化で従来 QA が足りなくなる問題、tech/testing blend、data と automation による重点化、team structure と upskilling の関係。"
  application_target: "Nao_u_BOT の headless bot、replay 検証、主観 feedback、telemetry を一つの Quality workflow に接続する評価サイクル。"
  pros_cons: "メリットは制作中の設計リスクを早期に見つけやすいこと。デメリットは AAA/live game 前提の話を小規模 prototype に縮約する設計が必要なこと。"
  verdict_pre: "部分採用。小規模 prototype では全体組織論ではなく、automation/data/subjective feedback の接続パターンだけを採る。"
---

## raw_excerpt

GDC 2026 の Game & Production Technology 講演。Aniruddha Pawar と Jawad Shakil / Ubisoft によるセッションで、公開概要では、ゲームが大型化し systems が複雑になる中で、Quality を単に bug finding として扱うだけでは足りない、という問題設定が置かれている。講演は、tech と testing の融合、role の upskilling、automation と data を使って「本当に重要なもの」に集中する Quality workflow の再設計を扱う。

ATIG / Toolsmiths の紹介文では、Quality の考え方を shift する必要、Ubisoft の teams が automation と data を使って modern Quality teams の基準を上げようとしていること、real stories と honest lessons を含むことが示されている。

短い原文断片: "Quality can no longer be just about finding bugs" / "blending tech and testing" / "using automation and data to focus on what really matters"。

## why_relevant_to_games

headless bot や replay 検証を「バグ探し」だけでなく、設計意図が実際に遊びとして出ているかを見る Quality workflow に広げる候補。特に Nao_u_BOT の prototype では、主観 feedback と telemetry / automation を接続する設計に使える。
