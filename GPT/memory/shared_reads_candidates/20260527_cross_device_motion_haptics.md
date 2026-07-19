---
title: Cross-Device Motion Interaction via Apple's Native System Frameworks
url: https://arxiv.org/abs/2508.01110
collected_at: 2026-05-27T08:44:32+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-feel, controls, haptics, motion-input, prototyping, mobile-hci]
evaluated_at: 2026-05-27T08:48:27+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-19T14:50:23+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-640e794e59585012; terminal:memory/shared_reads_candidates/20260516_cross_device_motion_interaction_iphone_controller.md: posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778863127335599; posted_source_url_match; reason:posted-source index が arXiv:2508.01110 の実 Slack 投稿を exact URL/work 一致で確認したため open siblings は再投稿候補として閉じる"
stale_after: "2026-06-26"
supersedes: []
next_action: none
gate_reason: >
  CoreMotion / MultipeerConnectivity / CoreHaptics、70ms 前後の遅延、公開ログ付きという実装要素は具体的だが、現行制作のブラウザゲームへ直結するには距離がある。
  game feel の測定軸としては有用でも、単体で CoopEval 水準の4,000字概要にするにはゲーム設計上の含意が薄く、別の入力遅延・触覚記事と束ねる方がよい。

---

## raw_excerpt
arXiv:2508.01110。Ezequiel Santos による、iPhone を motion controller + real-time tactile feedback デバイスとして使う offline pipeline。論文ページの abstract では、CoreMotion で inertial sensing、MultipeerConnectivity で peer-to-peer data transmission、CoreHaptics で即時 tactile confirmation を統合するとされている。

数値メモ: transmission は 10 Hz、built-in logger は clock synchronization なしで end-to-end latency を記録。5 GHz Wi-Fi 条件で mean delay 70.4 ms、95th percentile below 74 ms。KeepCalm という real-time demonstrator game を public event で 21 participants に展開し、stable connections、zero packet loss、iPhone 13 mini で negligible power impact という結果。Swift 500 lines 未満、cloud infrastructure なし、source code / latency logs / provisioning scripts は MIT license で公開とされる。

## why_relevant_to_games
「操作感」を画面内パラメータだけでなく、入力遅延・触覚・ログ可能性まで含む prototyping surface として見る材料。Nao_u_BOT の現行ブラウザゲームに直接入れる話ではないが、game feel を測る際の latency/haptic confirmation の軸として使える。
