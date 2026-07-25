---
title: "InMind: Evaluating LLMs in Capturing and Applying Individual Human Reasoning Styles"
url: https://arxiv.org/abs/2508.16072
collected_at: 2026-05-16T05:45:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, social-deduction, llm-evaluation, player-modeling, reasoning-styles]
source_note: "memory/raw/web_research/results.jsonl query=LLM game design player evaluation; arXiv page checked 2026-05-16"
evaluated_at: "2026-07-25T18:50:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-25T18:50:06+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_posted_source_work
evidence: "gate_decision:postpone; evaluated_at:2026-07-25T18:50:06+09:00; duplicate of posted work: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778535749182739"
stale_after: "2026-08-24"
supersedes: []
next_action: none
gate_reason: |-
  posted-source index が arXiv:2508.16072 の実 Slack 投稿を canonical work identity 一致で示したため、Phase 3 の再投稿対象にはしない。
  候補は既投稿を置換するほどの追加評価や新しい適用分析を含まず、同一 work の重複として postponed で閉じる。

---

## raw_excerpt

arXiv abstract short quote:

> "Social deduction games (SDGs) provide a natural testbed"

抄録メモ: InMind は、同じ状況でもプレイヤーが異なる推論戦略を取りうる social deduction games を使い、LLM が個別の reasoning style を捉えて適用できるかを見る評価枠組み。structured gameplay data に round-level strategy traces と post-game reflections を足し、Observer / Participant の両モードで static alignment と dynamic adaptation を測る。Avalon をケーススタディにして 11 種の LLM を評価し、一般 LLM は語彙手がかりに寄りがちで時間的な gameplay への anchoring や戦略変化への適応が弱い、という抄録内容。EMNLP 2025 Main Conference と記載。

## why_relevant_to_games

人狼系・推理系・交渉系ゲームで、プレイヤーごとの推論スタイルを NPC/評価 agent がどこまで追跡できるかを見る材料になる。
