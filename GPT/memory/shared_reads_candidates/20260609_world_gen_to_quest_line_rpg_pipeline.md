---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: "https://arxiv.org/abs/2604.25482"
collected_at: "2026-06-09T17:24:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, narrative, rpg, pcg, llm, structured-generation]
evaluated_at: "2026-06-09T17:30:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-09T17:30:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-09T17:30:00+09:00"
next_action: keep_for_reference
stale_after: "2026-07-09"
supersedes: []
gate_reason: >-
  dependency-aware RPG generation pipeline としての要素は明確だが、同一論文の
  `20260515_world_gen_quest_line_dependency_pipeline.md` が既に posted。
  新規性ではなく重複候補なので、Phase 3 投稿対象から外す。
---

## raw_excerpt
arXiv 2604.25482。一次情報メモ。論文は、LLM による RPG world / NPC / player character / campaign quest / quest expansion の生成を、単発プロンプトではなく依存関係を明示した多段 pipeline として扱う。各段階は前段の structured JSON output を入力にし、schema と explicit data flow によって narrative drift、hallucination、structural inconsistency を抑えるという立て付け。

評価は複数の independent runs に対する human-centered qualitative analysis。観点は structural completeness、internal consistency、narrative coherence、diversity、actionability。高レベル campaign planning と detailed quest expansion を分離することで、全体構造と局所的な storytelling の両方が改善する、という報告になっている。

## why_relevant_to_games
テキストADVやRPG生成で「世界観だけあるがプレイ可能な局面に落ちない」問題に対し、依存関係付き中間表現を挟む収集候補として有用。
