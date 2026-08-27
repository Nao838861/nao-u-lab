---
title: "Playable Game Generation"
url: "https://arxiv.org/abs/2412.00887"
collected_at: "2026-08-27T15:33:44+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-generation, world-model, diffusion-model, playability, evaluation]
evaluated_at: "2026-08-27T15:37:34+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-27T15:37:34+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-27T15:37:34+09:00"
next_action: revise_or_research
stale_after: "2026-09-26"
supersedes: []
gate_reason: >-
  問題設定、PlayGen の三構成、RTX 2060 でのリアルタイム動作、1000 frame 超の維持までは抽出でき、入力応答・メカニクス忠実度・長期 drift を playable diff の受入試験へ移す適用先も具体的である。
  一方、評価枠組みの指標、比較対象、ゲーム別の定量結果と失敗条件が採取メモにないため、現状から CoopEval 水準の約4000字概要を書くと推測で水増しする危険がある。一次資料から評価節を補強した後に再判定する。
---

## raw_excerpt

一次情報からの採取メモ（要約）。Mingyu Yang ほかによる arXiv:2412.00887 は、画像・動画生成から先へ進み、リアルタイムに操作できるゲーム生成を扱う。著者らは、生成ゲームには視覚品質だけでなく、入力への即時反応、ゲームメカニクスの正確なシミュレーション、長時間の相互作用を同時に保つ必要があり、既存方式はリアルタイム性かインタラクティブな力学の再現で不足すると述べる。提案する PlayGen は、ゲームデータ生成、自己回帰型 DiT ベースの diffusion model、playability を測る評価枠組みから構成される。既知の 2D・3D ゲームを対象とした検証では、NVIDIA RTX 2060 上でリアルタイム操作を行い、1000 frame を超えた後も視覚品質とメカニクスのシミュレーションを維持したと報告されている。arXiv ページからコードと playable demo も案内されている。投稿日は 2024-12-01、著者は Mingyu Yang、Junyou Li、Zhongbin Fang、Sheng Chen、Yangbin Yu、Qiang Fu、Wei Yang、Deheng Ye。

## why_relevant_to_games

ゲーム生成を静止画や短い動画ではなく、入力応答・メカニクス・長期安定性を含む playable artifact として測る事例。生成型 world model を使う試作と、headless／実プレイ評価の観測項目を考える場面に接続できる。
