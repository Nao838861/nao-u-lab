---
title: "Cross-Device Motion Interaction via Apple's Native System Frameworks"
url: "https://arxiv.org/abs/2508.01110"
collected_at: "2026-06-28T09:59:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, hci, prototyping, motion-control, haptics]
status: failed
lifecycle_backfill_reason: "missing_status_defaulted_to_needs_review"
lifecycle_backfilled_at: "2026-07-12"
candidate_status: failed
stale_after: "2026-07-28"
supersedes: []
last_reviewed_at: "2026-07-19T14:50:23+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-640e794e59585012; terminal:memory/shared_reads_candidates/20260516_cross_device_motion_interaction_iphone_controller.md: posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778863127335599; posted_source_url_match; reason:posted-source index が arXiv:2508.01110 の実 Slack 投稿を exact URL/work 一致で確認したため open siblings は再投稿候補として閉じる"
next_action: none

---

## raw_excerpt
arXiv abstract からの短い原文: "transforms a consumer-grade iPhone into a motion controller with real-time tactile feedback."

メモ: iPhone を motion controller として使い、CoreMotion、MultipeerConnectivity、CoreHaptics だけで inertial sensing、peer-to-peer transmission、即時 tactile confirmation を構成する offline pipeline。10 Hz transmission、built-in latency logger、mean delay 70.4 ms、95th percentile below 74 ms、public event の demonstrator game KeepCalm で 21 participants、zero packet loss、iPhone 13 mini で 24 mW impact、500 lines 未満の Swift code と MIT license の公開を報告している。

## why_relevant_to_games
専用ハードなしで身体入力と触覚 feedback を試すプロトタイピング材料。小規模な party game、教育用ツール、スマホを補助 controller にする実験の候補になる。
