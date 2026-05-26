---
title: Cross-Device Motion Interaction via Apple's Native System Frameworks
url: https://arxiv.org/abs/2508.01110
collected_at: 2026-05-27T08:44:32+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-feel, controls, haptics, motion-input, prototyping, mobile-hci]
---

## raw_excerpt
arXiv:2508.01110。Ezequiel Santos による、iPhone を motion controller + real-time tactile feedback デバイスとして使う offline pipeline。論文ページの abstract では、CoreMotion で inertial sensing、MultipeerConnectivity で peer-to-peer data transmission、CoreHaptics で即時 tactile confirmation を統合するとされている。

数値メモ: transmission は 10 Hz、built-in logger は clock synchronization なしで end-to-end latency を記録。5 GHz Wi-Fi 条件で mean delay 70.4 ms、95th percentile below 74 ms。KeepCalm という real-time demonstrator game を public event で 21 participants に展開し、stable connections、zero packet loss、iPhone 13 mini で negligible power impact という結果。Swift 500 lines 未満、cloud infrastructure なし、source code / latency logs / provisioning scripts は MIT license で公開とされる。

## why_relevant_to_games
「操作感」を画面内パラメータだけでなく、入力遅延・触覚・ログ可能性まで含む prototyping surface として見る材料。Nao_u_BOT の現行ブラウザゲームに直接入れる話ではないが、game feel を測る際の latency/haptic confirmation の軸として使える。
