---
title: "InMind: Evaluating LLMs in Capturing and Applying Individual Human Reasoning Styles"
url: https://arxiv.org/abs/2508.16072
collected_at: 2026-05-16T05:45:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, social-deduction, llm-evaluation, player-modeling, reasoning-styles]
source_note: "memory/raw/web_research/results.jsonl query=LLM game design player evaluation; arXiv page checked 2026-05-16"
evaluated_at: 2026-05-16T05:46:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-16T05:46:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-16T05:46:00+09:00"
stale_after: "2026-06-15"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  social deduction における個別推論スタイル追跡という適用先は強いが、現 candidate は抄録メモ中心で評価指標や失敗例の密度が不足している。
  既存 atoms に過去 #shared-reads 投稿断片もあり、Phase 3 で再投稿する前に重複関係と本文レベルの評価詳細を確認する必要がある。

---

## raw_excerpt

arXiv abstract short quote:

> "Social deduction games (SDGs) provide a natural testbed"

抄録メモ: InMind は、同じ状況でもプレイヤーが異なる推論戦略を取りうる social deduction games を使い、LLM が個別の reasoning style を捉えて適用できるかを見る評価枠組み。structured gameplay data に round-level strategy traces と post-game reflections を足し、Observer / Participant の両モードで static alignment と dynamic adaptation を測る。Avalon をケーススタディにして 11 種の LLM を評価し、一般 LLM は語彙手がかりに寄りがちで時間的な gameplay への anchoring や戦略変化への適応が弱い、という抄録内容。EMNLP 2025 Main Conference と記載。

## why_relevant_to_games

人狼系・推理系・交渉系ゲームで、プレイヤーごとの推論スタイルを NPC/評価 agent がどこまで追跡できるかを見る材料になる。
