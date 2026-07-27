---
title: "Detecting Aimbot Cheaters in MOGs"
url: "https://arxiv.org/abs/2606.07650"
collected_at: "2026-06-21T08:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-security, multiplayer, anti-cheat, computer-vision, evaluation]
evaluated_at: "2026-07-27T18:53:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T18:53:09+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T18:53:09+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  adversarial patch を honeytoken にする手法と white-box / cross-model 評価は抽出できるが、制作への適用は anti-cheat と bot 検査への類推に留まる。
  一か月後の再評価でも制作サイクルへ直接移せる実装・評価材料が増えておらず、4000字級の適用分析をこじつけずに成立させられないため不採用。
---

## raw_excerpt

arXiv 検索結果から取得。2026-06-02 投稿。対象は Multiplayer Online Games における visual aimbot cheat。従来の kernel level anti-cheat は game memory へ触る cheat の検出には向くが、画面キャプチャから computer vision model で敵を検出する aimbot は商用 anti-cheat から見えにくい、という問題設定。

提案は PATCH という proactive defense。ゲーム内に adversarial patch を honeytoken として配置し、cheater の object detection model を意図的に反応させる。反応を検出に使うか、あるいは patch flooding で cheater の viewport を実質的に使いにくくする。評価は custom Unreal Engine game と Fortnite で行われ、patch size、screen resolution への scalability、visual aimbot 設定差、YOLO model 間の transferability を調べている。要旨では、white-box 条件で多くの patch size が 90% 超の detection rate、large patch では cross-model transferability が 60-90% と報告されている。

## why_relevant_to_games

対戦ゲームの不正検出だけでなく、「プレイヤーには自然に見えるが bot / exploit だけが過剰反応する観測罠」という設計発想として使える。bot policy 評価や AI playtester の anti-gaming probe にも接続できる。
