---
title: "Cross-Device Motion Interaction via Apple's Native System Frameworks"
url: https://arxiv.org/abs/2508.01110
collected_at: 2026-05-16T01:29:12+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [mobile-game, haptics, motion-control, prototyping, embodied-interaction]
evaluated_at: "2026-05-16T01:32:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T01:38:50+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
gate_reason: >-
  CoreMotion / MultipeerConnectivity / CoreHaptics の具体 pipeline と、latency、packet loss、電力、demonstrator game、参加者数まで candidate 内で把握できる。
  スマホ連携そのものだけでなく、入力手触りをログと再現性込みで評価する姿勢がゲーム制作の prototype 検証に具体的に適用できる。
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778863127335599"
next_action: none
posted:
  ts: "1778863127.335599"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778863127335599"
  char_count: 4398
  posted_at: "2026-05-16T01:38:50+09:00"
suggested_post_outline:
  overview_angle: "iPhone を motion controller にする話を、低遅延入力・触覚応答・再現可能な計測基盤の設計として読む。"
  analysis_axis: "native Apple frameworks の構成、offline/P2P pipeline、KeepCalm demonstrator、latency・packet loss・電力・コード量の測定が設計判断にどう効くか。"
  application_target: "物理入力、スマホ連携、触覚 feedback、または通常の PC/browser prototype でも入力ログを設計に戻すための検証テンプレート。"
  pros_cons: "メリットは consumer device で低コストに再現性のある入力実験を作れる点。デメリットは Apple ecosystem 依存と 10 Hz/単一 demonstrator から一般ゲーム全体へは広げすぎられない点。"
  verdict_pre: "採用"

---

## raw_excerpt
arXiv:2508.01110。論文は、consumer-grade iPhone を motion controller と real-time tactile feedback の入力装置にする、offline / native Apple frameworks ベースの pipeline を提案している。構成は CoreMotion による inertial sensing、MultipeerConnectivity による peer-to-peer transmission、CoreHaptics による tactile confirmation。検索結果の要旨では 10 Hz 通信、平均 70.4 ms、95th percentile below 74 ms、public event の demonstrator game KeepCalm で21 participants、zero packet loss、iPhone 13 mini で 24 mW、500 lines 未満の Swift code といった実装・計測情報が残っている。

要点メモ: 価値は「スマホをコントローラにできる」というアイデアだけではなく、 latency logger、offline 動作、cloud infrastructure なし、source code / logs / provisioning scripts の公開という再現性にある。ゲーム制作の入力実験では、面白さの前に、遅延・packet loss・電力・触覚応答の計測がないと、体感の良し悪しを設計判断に戻しにくい。

## why_relevant_to_games
物理入力やスマホ連携の小型ゲームを作る時、触覚・遅延・ログを最初から設計に含める候補。ブラウザ/PC中心のプロトタイプでも、入力手触りを測る発想は転用できる。
