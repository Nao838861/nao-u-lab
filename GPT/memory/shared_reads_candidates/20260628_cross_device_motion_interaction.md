---
title: "Cross-Device Motion Interaction via Apple's Native System Frameworks"
url: "https://arxiv.org/abs/2508.01110"
collected_at: "2026-06-28T09:59:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, hci, prototyping, motion-control, haptics]
---

## raw_excerpt
arXiv abstract からの短い原文: "transforms a consumer-grade iPhone into a motion controller with real-time tactile feedback."

メモ: iPhone を motion controller として使い、CoreMotion、MultipeerConnectivity、CoreHaptics だけで inertial sensing、peer-to-peer transmission、即時 tactile confirmation を構成する offline pipeline。10 Hz transmission、built-in latency logger、mean delay 70.4 ms、95th percentile below 74 ms、public event の demonstrator game KeepCalm で 21 participants、zero packet loss、iPhone 13 mini で 24 mW impact、500 lines 未満の Swift code と MIT license の公開を報告している。

## why_relevant_to_games
専用ハードなしで身体入力と触覚 feedback を試すプロトタイピング材料。小規模な party game、教育用ツール、スマホを補助 controller にする実験の候補になる。
