---
title: "SNAP: A Plan-Driven Framework for Controllable Interactive Narrative Generation"
url: "https://arxiv.org/abs/2601.11529"
collected_at: "2026-06-28T22:36:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, interactive-narrative, llm, planning, browser-games]
evaluated_at: "2026-06-28T22:33:12+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-28T22:33:12+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-28T22:33:12+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-28"
supersedes: []
gate_reason: |-
  Cell / Plan による narrative drift 抑制という中核が明確で、問題設定、手法、評価、結論を概要化できる。
  NPC 会話、クエスト進行、イベント分岐を小さな制御単位に分ける実装判断へ直結し、Phase 3 の ~4000 字投稿に耐える。
suggested_post_outline:
  overview_angle: "自由入力を許す interactive narrative で、LLM の一貫性崩壊を Cell / Plan 分割で制御する設計として書く。"
  analysis_axis: "narrative unit の粒度、Plan に含める時空間・行動・plot 情報、automated / human evaluation の両面を整理する。"
  application_target: "Nao_u_BOT の NPC 会話、クエストログ、イベント進行を drift しにくい小単位計画へ分ける設計メモに効く。"
  pros_cons: "長所は制御単位が明確なこと。短所は Plan 設計コストと、長期構造の生成品質が実装依存になりやすいこと。"
  verdict_pre: "部分採用"
---

## raw_excerpt

短い原文引用: "spatiotemporal distortions"

arXiv:2601.11529。2025-11-18 submitted。Geonwoo Bang、DongMyung Kim、Hayoung Oh による、web-based interactive storytelling / browser games / online education での LLM conversational agent の一貫性維持を扱う論文。問題設定は、ユーザー入力が変化すると、LLM agent がシナリオ内の時間・場所・人物行動の整合を崩しやすいこと。SNAP は narrative を Cell に分割し、各 Cell に明示的な Plan を持たせる。Plan は spatiotemporal setting、character actions、plot developments を指定し、各 Cell の context を閉じることで narrative drift を抑える。評価は automated evaluation と human evaluation の両方で、variant user inputs 下でも scenario consistency と narrative controllability が改善したと説明されている。

## why_relevant_to_games

自由入力を許す物語ゲームや NPC 会話で、LLM の自由生成を Cell / Plan に閉じ込める候補。クエスト進行や会話イベントを小さな制御単位に分ける設計メモとして使える。
