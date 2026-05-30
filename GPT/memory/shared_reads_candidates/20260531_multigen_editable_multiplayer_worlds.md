---
title: "MultiGen: Level-Design for Editable Multiplayer Worlds in Diffusion Game Engines"
url: "https://arxiv.org/abs/2603.06679"
collected_at: "2026-05-31T04:44:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, world-models, level-design, multiplayer, generative-ai]
evaluated_at: "2026-05-31T04:50:25+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
stale_after: "2026-06-30"
supersedes: []
gate_reason: "Memory / Observation / Dynamics で diffusion game engine の editable multiplayer world を分解する視点は重要。ただし現メモは arXiv abstract 由来で、評価設定・実験の中身・既存手法との差分が薄く、CoopEval 水準の概要に必要な根拠が不足している。Phase 3 に回す前に本文精読で評価方法と制約を補う。"
---

## raw_excerpt
arXiv:2603.06679。Ryan Po ほか。2026-03-03 submitted、2026-03-30 revised。

著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。対象は、video world model / diffusion game engine をゲーム的な相互作用へ使う時の問題。既存の next-frame predictor 的な生成エンジンは、ユーザーが環境構造を再現可能に編集すること、複数プレイヤーが同じ世界へ影響することが弱い。MultiGen は、モデルの context window とは独立した explicit external memory を置き、ユーザー行動で持続的に更新される状態として扱う。構成は Memory / Observation / Dynamics の分解で、Memory が編集可能な環境表現、Observation が各プレイヤー視点、Dynamics がロールアウト中の変化を担う。短い原文メモ: "editable multiplayer worlds", "persistent state", "Memory, Observation, and Dynamics modules"。

## why_relevant_to_games
生成映像系ゲームを「その場の絵」ではなく、編集可能な world state と複数視点の整合性問題として読むための候補。Nao_u_BOT の自律ゲームや replay/trace 設計で、状態を明示的に外へ置く設計語彙として使える。
