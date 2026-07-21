---
title: "Cross-Device Motion Interaction via Apple's Native System Frameworks"
url: "https://arxiv.org/abs/2508.01110"
collected_at: "2026-06-05T01:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [embodied-interaction, mobile-game, haptics, prototyping, motion-controller]
evaluated_at: "2026-06-05T01:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T14:50:23+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-640e794e59585012; terminal:memory/shared_reads_candidates/20260516_cross_device_motion_interaction_iphone_controller.md: posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778863127335599; posted_source_url_match; reason:posted-source index が arXiv:2508.01110 の実 Slack 投稿を exact URL/work 一致で確認したため open siblings は再投稿候補として閉じる"
next_action: none
stale_after: "2026-07-05"
supersedes: []
gate_reason: "iPhone motion controller、haptics、offline pipeline、latency logs まで揃っており embodied prototype には有用。ただし Nao_u_BOT の直近主戦場は PC/LLM game prototyping で、iOS 実装条件・再現手順・ゲーム設計への落とし込みを追加確認しないと投稿が技術紹介に寄りすぎる。"
---

## raw_excerpt

arXiv abstract は、consumer-grade iPhone を motion controller と real-time tactile feedback を持つ入力デバイスに変える、fully offline な open-source pipeline を紹介している。CoreMotion で inertial sensing、MultipeerConnectivity で peer-to-peer data transmission、CoreHaptics で immediate tactile confirmation を扱う。built-in logger は clock synchronization なしで end-to-end latency を記録し、5 GHz Wi-Fi の典型条件で mean delay 70.4 ms、95th percentile below 74 ms を報告している。KeepCalm という real-time demonstrator game を public event で 21 participants に試し、stable connections、zero packet loss、negligible power impact を観測した。500 lines 未満の Swift code、cloud infrastructure なし、MIT license の source code / latency logs / provisioning scripts 公開という再現性が強調されている。

## why_relevant_to_games

スマホを即席モーションコントローラにする小型プロトタイプの材料。入力遅延・触覚フィードバック・オフライン運用を同時に見る embodied game の候補になる。
