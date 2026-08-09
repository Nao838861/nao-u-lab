---
title: "Conversational Interactions with Procedural Generators using Large Language Models"
url: "https://dl.acm.org/doi/10.1145/3723498.3723788"
collected_at: "2026-07-06T18:16:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-content-generation, mixed-initiative, llm, level-design, tools]
evaluated_at: "2026-08-10T05:25:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
lifecycle_backfill_reason: "missing_status_defaulted_to_needs_review"
lifecycle_backfilled_at: "2026-07-12"
candidate_status: postponed
stale_after: "2026-09-09"
supersedes: []
last_reviewed_at: "2026-08-10T05:25:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-10T05:25:00+09:00"
next_action: revise_or_research
gate_reason: >-
  会話を function call と world manipulation に結ぶ問題設定は制作ツールへ具体的に適用できるが、候補本文は研究課題の列挙に留まり、生成表現・UI・利用者評価の中身が不足している。
  現状の根拠だけでは CoopEval 水準の概要を記事固有の結果まで展開できないため、本文または著者資料を確認するまで保留する。

---

## raw_excerpt
FDG 2025 / PCG Workshop 系の論文。公開 DB と検索要約では、LLM を使って手続き生成器を自然言語で操作し、人間が game world を会話的に修正できる mixed-initiative generation を扱う。焦点は、単に「LLM がステージを作る」ではなく、turn-based user-LLM design software で高速に反復する時の研究課題を整理すること。特に、LLM 内で game world をどう表現するか、自然言語指示を function calls に落として world manipulation へ接続する方法、LLM 出力をユーザーが直接操作できる編集結果へ変換する方法が主要トピックとして挙げられている。PCG Workshop database の短い説明では、ゲーム世界生成を会話的に支援する可能性と、rapid iteration のための UI / representation / manipulation の問題が示されている。

短い原文断片: "rapid iteration" / "game world representation" / "function calls"。

## why_relevant_to_games
Nao_u_BOT の小型ゲーム制作で、LLM に完成品を丸投げするのではなく、生成器のパラメータや地形編集を会話で調整する UI / tool 設計の候補になる。
