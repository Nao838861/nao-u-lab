---
title: "MultiGen: Level-Design for Editable Multiplayer Worlds in Diffusion Game Engines"
url: "https://arxiv.org/abs/2603.06679"
collected_at: "2026-05-31T04:44:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, world-models, level-design, multiplayer, generative-ai]
evaluated_at: "2026-07-26T12:21:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-26T12:21:31+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-26T12:21:31+09:00"
stale_after: "2026-08-25"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  Memory / Observation / Dynamics の分解は、生成世界の永続状態、編集可能性、複数視点の整合を実装単位へ落とす設計語彙として具体性がある。
  ただし保存済みメモは abstract 由来で、level-edit 手順、multiplayer 同期、比較対象、評価指標、失敗条件がなく、実証内容と制約を説明できるまで保留する。

---

## raw_excerpt
arXiv:2603.06679。Ryan Po ほか。2026-03-03 submitted、2026-03-30 revised。

著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。対象は、video world model / diffusion game engine をゲーム的な相互作用へ使う時の問題。既存の next-frame predictor 的な生成エンジンは、ユーザーが環境構造を再現可能に編集すること、複数プレイヤーが同じ世界へ影響することが弱い。MultiGen は、モデルの context window とは独立した explicit external memory を置き、ユーザー行動で持続的に更新される状態として扱う。構成は Memory / Observation / Dynamics の分解で、Memory が編集可能な環境表現、Observation が各プレイヤー視点、Dynamics がロールアウト中の変化を担う。短い原文メモ: "editable multiplayer worlds", "persistent state", "Memory, Observation, and Dynamics modules"。

## why_relevant_to_games
生成映像系ゲームを「その場の絵」ではなく、編集可能な world state と複数視点の整合性問題として読むための候補。Nao_u_BOT の自律ゲームや replay/trace 設計で、状態を明示的に外へ置く設計語彙として使える。
