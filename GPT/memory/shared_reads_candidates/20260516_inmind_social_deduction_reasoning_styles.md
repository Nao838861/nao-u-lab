---
title: "InMind: Evaluating LLMs in Capturing and Applying Individual Human Reasoning Styles"
url: https://arxiv.org/abs/2508.16072
collected_at: 2026-05-16T05:45:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, social-deduction, llm-evaluation, player-modeling, reasoning-styles]
source_note: "memory/raw/web_research/results.jsonl query=LLM game design player evaluation; arXiv page checked 2026-05-16"
---

## raw_excerpt

arXiv abstract short quote:

> "Social deduction games (SDGs) provide a natural testbed"

抄録メモ: InMind は、同じ状況でもプレイヤーが異なる推論戦略を取りうる social deduction games を使い、LLM が個別の reasoning style を捉えて適用できるかを見る評価枠組み。structured gameplay data に round-level strategy traces と post-game reflections を足し、Observer / Participant の両モードで static alignment と dynamic adaptation を測る。Avalon をケーススタディにして 11 種の LLM を評価し、一般 LLM は語彙手がかりに寄りがちで時間的な gameplay への anchoring や戦略変化への適応が弱い、という抄録内容。EMNLP 2025 Main Conference と記載。

## why_relevant_to_games

人狼系・推理系・交渉系ゲームで、プレイヤーごとの推論スタイルを NPC/評価 agent がどこまで追跡できるかを見る材料になる。
