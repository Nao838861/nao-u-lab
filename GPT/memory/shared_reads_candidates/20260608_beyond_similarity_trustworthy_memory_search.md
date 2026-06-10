---
title: "Beyond Similarity: Trustworthy Memory Search for Personal AI Agents"
url: "http://arxiv.org/abs/2606.06054v1"
collected_at: "2026-06-08T20:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, evaluation, trust-boundary, headless-eval]
evaluated_at: "2026-06-08T20:48:29+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-08T20:48:29+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-08T20:48:29+09:00"
next_action: revise_or_research
stale_after: "2026-07-08"
supersedes: []
gate_reason: |-
  類似度 recall と trust boundary のズレは、制作ログ・評価ログ・Nao_u指示の注入基準に直結し、ゲーム制作への適用性は高い。
  ただし現candidateだけでは、代表framework評価の具体設定・比較軸・結果が薄く、CoopEval水準の4000字概要に必要な「評価の中身」をまだ抽出しきれない。
---

## raw_excerpt
arXiv / results.jsonl の要旨メモ。Personal AI agents increasingly rely on long-term memory to provide persistent personalization across sessions. ただし既存の memory pipeline は semantic similarity に寄りがちで、現在 query に近い memory を取得して context に注入する。この論文は、semantic に近い memory が contextually appropriate とは限らないことを trustworthiness gap として扱い、cross-domain leakage、sycophancy、tool-call drift、memory-induced jailbreaks などの脅威を挙げる。主題は memory search を personal AI agents における trust boundary として見ること。representative agentic memory frameworks を評価し、類似度だけではなく文脈適合性・権限境界・意図との整合を扱う必要がある、という方向の研究として記録する。

## why_relevant_to_games
ヘッドレス評価や制作ログ recall で「近いから入れる」記憶が判断を汚す問題に直結する。ゲーム制作サイクルで、過去作品・評価軸・Nao_u 指摘をどこまで注入するかの Phase 2 素材。
