---
title: "Cross-Device Motion Interaction via Apple's Native System Frameworks"
url: "https://arxiv.org/abs/2508.01110"
collected_at: "2026-07-08T15:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-prototyping, hci, input-device, embodied-interaction, mobile-games]
---

## raw_excerpt

arXiv:2508.01110。2025-08-01 submitted。論文は、consumer-grade iPhone を motion controller として使い、CoreMotion、MultipeerConnectivity、CoreHaptics だけでリアルタイム触覚フィードバック付きのオフライン入力パイプラインを作る。要旨上の短い原文断片: "real-time tactile feedback" / "no reliance on cloud infrastructure"。通信は peer-to-peer で 10 Hz、内蔵 logger が clock synchronization なしに end-to-end latency を測る。報告値は 5 GHz Wi-Fi 環境で mean delay 70.4 ms、95th percentile below 74 ms、iPhone 13 mini の追加消費電力 24 mW。検証用に KeepCalm という real-time demonstrator game を公開イベントで 21 名に使わせ、stable connections、zero packet loss、negligible power impact を示したとされる。

ソースコード、latency logs、provisioning scripts は MIT license で公開とされ、Swift は 500 行未満。研究対象は HCI だが、ゲーム試作側から見ると、専用コントローラやクラウド依存なしで「身体を使う入力 + 即時フィードバック + ログ計測」を組むための実装素材として読める。

## why_relevant_to_games

スマホを即席モーションコントローラ化する小型ゲーム試作、展示用プロトタイプ、入力遅延ログ付き playtest の候補になる。特に tactile feedback と latency logger を最初から持つ点が、体感入力の調整に使える。
