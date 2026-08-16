---
title: "Designing Stadium: Crafting a New Game Mode for 'Overwatch'"
url: "https://gdcvault.com/play/1035697/Designing-Stadium-Crafting-a-New"
collected_at: "2026-07-18T16:01:28.9653233+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, competitive-multiplayer, balancing, iteration, live-ops]
evaluated_at: "2026-08-17T03:34:44+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-17T03:36:31+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-a3d9ea0a5a5adc14; terminal:memory/shared_reads_candidates/20260531_overwatch_stadium_new_mode_design.md: status:posted; permalink:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780217144998889; reason:schedule 版候補が投稿済みで、Vault 版は同一タイトル・同一講演の詳細資料であり独立 work ではない"
next_action: none
stale_after: "2026-09-16"
supersedes: []
gate_reason: >-
  schedule 版候補が投稿済みで、Vault 版は同一タイトル・同一講演の詳細資料に当たり独立 work ではない。
  group handoff の terminal sibling evidence に基づき duplicate candidate として閉じ、Phase 3 の再投稿対象から外す。
---

## raw_excerpt

GDC 2026 の Scott Hwang / Larry Wu による講演資料。10 年続く Overwatch に新モード Stadium を作った 18 か月の経緯を、concept、gameplay construction、pivot、post-launch に分ける。最初の 6 か月では 3v3〜5v5 MOBA、team deathmatch、elimination、8-team tournament、PvE round、random modifier、shrinking zone、round 間 hub などを試した。少人数戦は一人の負担と death penalty が大きく、elimination は hero kit と pacing に衝突し、PvE は反復を避ける content cost が重く、hub は loading と開発 overhead を増やした。一方、ability modification、stat growth、round ごとの map 変化、短い match、同じ相手チームとの comeback は残った。150 以上の modifier と未完成 PvE talent 100 件も試したが、damage 偏重で late game の time-to-kill が短くなり、視覚・音の tell がない新機能は理解されにくかった。最終方針は hero fantasy を強める additive power、price / rarity の階層、performance-based economy、controlled randomness、短い playtest cycle、analytics dashboard、running server への hotfix へ整理された。後半の pivot では random choice を deterministic shop に変え、player agency と shop mastery を強めた。

## why_relevant_to_games

既存ゲームの核を保ったまま新しい成長 loop を足す時の、捨てた試作・残した体験・balance instrumentation を追える実制作 postmortem として参照できる。
