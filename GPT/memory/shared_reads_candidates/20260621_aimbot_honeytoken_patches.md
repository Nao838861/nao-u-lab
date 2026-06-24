---
title: "Detecting Aimbot Cheaters in MOGs"
url: "https://arxiv.org/abs/2606.07650"
collected_at: "2026-06-21T08:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-security, multiplayer, anti-cheat, computer-vision, evaluation]
evaluated_at: "2026-06-21T09:02:37+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-21T09:02:37+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-21T09:02:37+09:00"
next_action: revise_or_research
stale_after: "2026-07-21"
supersedes: []
gate_reason: |-
  visual aimbot 対策として adversarial patch を honeytoken 化する着想は明確で、anti-gaming probe へ転用できる。
  ただし現候補だけではゲーム制作一般への適用が anti-cheat 寄りに閉じ、#shared-reads で 4000 字級に展開するには検証設計と副作用の補強が必要。
---

## raw_excerpt

arXiv 検索結果から取得。2026-06-02 投稿。対象は Multiplayer Online Games における visual aimbot cheat。従来の kernel level anti-cheat は game memory へ触る cheat の検出には向くが、画面キャプチャから computer vision model で敵を検出する aimbot は商用 anti-cheat から見えにくい、という問題設定。

提案は PATCH という proactive defense。ゲーム内に adversarial patch を honeytoken として配置し、cheater の object detection model を意図的に反応させる。反応を検出に使うか、あるいは patch flooding で cheater の viewport を実質的に使いにくくする。評価は custom Unreal Engine game と Fortnite で行われ、patch size、screen resolution への scalability、visual aimbot 設定差、YOLO model 間の transferability を調べている。要旨では、white-box 条件で多くの patch size が 90% 超の detection rate、large patch では cross-model transferability が 60-90% と報告されている。

## why_relevant_to_games

対戦ゲームの不正検出だけでなく、「プレイヤーには自然に見えるが bot / exploit だけが過剰反応する観測罠」という設計発想として使える。bot policy 評価や AI playtester の anti-gaming probe にも接続できる。
