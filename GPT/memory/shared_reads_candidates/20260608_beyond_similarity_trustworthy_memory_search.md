---
title: "Beyond Similarity: Trustworthy Memory Search for Personal AI Agents"
url: "http://arxiv.org/abs/2606.06054v1"
collected_at: "2026-06-08T20:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, evaluation, trust-boundary, headless-eval]
evaluated_at: "2026-07-28T21:36:03+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-28T21:36:03+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-28T21:36:03+09:00"
next_action: keep_for_reference
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  類似度 recall と trust boundary のズレは制作記憶へ適用できるが、候補本文は脅威名と方向性の要約に留まる。
  stale 再評価でも framework、評価設定、比較軸、結果がなく、約4000字の概要を一次資料に基づいて構成できない。
---

## raw_excerpt
arXiv / results.jsonl の要旨メモ。Personal AI agents increasingly rely on long-term memory to provide persistent personalization across sessions. ただし既存の memory pipeline は semantic similarity に寄りがちで、現在 query に近い memory を取得して context に注入する。この論文は、semantic に近い memory が contextually appropriate とは限らないことを trustworthiness gap として扱い、cross-domain leakage、sycophancy、tool-call drift、memory-induced jailbreaks などの脅威を挙げる。主題は memory search を personal AI agents における trust boundary として見ること。representative agentic memory frameworks を評価し、類似度だけではなく文脈適合性・権限境界・意図との整合を扱う必要がある、という方向の研究として記録する。

## why_relevant_to_games
ヘッドレス評価や制作ログ recall で「近いから入れる」記憶が判断を汚す問題に直結する。ゲーム制作サイクルで、過去作品・評価軸・Nao_u 指摘をどこまで注入するかの Phase 2 素材。
