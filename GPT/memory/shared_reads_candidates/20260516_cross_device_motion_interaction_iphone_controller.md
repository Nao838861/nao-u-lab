---
title: "Cross-Device Motion Interaction via Apple's Native System Frameworks"
url: https://arxiv.org/abs/2508.01110
collected_at: 2026-05-16T01:29:12+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [mobile-game, haptics, motion-control, prototyping, embodied-interaction]
---

## raw_excerpt
arXiv:2508.01110。論文は、consumer-grade iPhone を motion controller と real-time tactile feedback の入力装置にする、offline / native Apple frameworks ベースの pipeline を提案している。構成は CoreMotion による inertial sensing、MultipeerConnectivity による peer-to-peer transmission、CoreHaptics による tactile confirmation。検索結果の要旨では 10 Hz 通信、平均 70.4 ms、95th percentile below 74 ms、public event の demonstrator game KeepCalm で21 participants、zero packet loss、iPhone 13 mini で 24 mW、500 lines 未満の Swift code といった実装・計測情報が残っている。

要点メモ: 価値は「スマホをコントローラにできる」というアイデアだけではなく、 latency logger、offline 動作、cloud infrastructure なし、source code / logs / provisioning scripts の公開という再現性にある。ゲーム制作の入力実験では、面白さの前に、遅延・packet loss・電力・触覚応答の計測がないと、体感の良し悪しを設計判断に戻しにくい。

## why_relevant_to_games
物理入力やスマホ連携の小型ゲームを作る時、触覚・遅延・ログを最初から設計に含める候補。ブラウザ/PC中心のプロトタイプでも、入力手触りを測る発想は転用できる。
