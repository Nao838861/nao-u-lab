---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: "https://arxiv.org/abs/2604.25482v1"
collected_at: "2026-07-08T11:44:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, procedural-generation, narrative, llm]
evaluated_at: "2026-07-08T11:47:22+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-08T11:47:22+09:00"
last_decision: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260609_world_gen_to_quest_line_rpg_pipeline.md"
next_action: none
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  mixed duplicate queue に同一 title_key の posted terminal sibling があり、依存関係駆動 RPG 生成 pipeline は
  既に投稿済み。JSON 中間表現の適用余地はあるが、Phase 3 投稿候補からは外す。
---

## raw_excerpt

arXiv abstract の要点メモとして保存する。対象は LLM による RPG content generation。問題設定は、LLM は narrative generation に強い一方で、complex multi-layered RPG worlds では coherence、controllability、structural consistency が崩れやすいこと。論文は dependency-aware multi-stage prompt pipeline を提案し、narrative dependencies を structured intermediate representations で扱う。

pipeline は world building、NPC creation、player character creation、campaign-level quest planning、quest expansion へ分解される。各 stage は前段の structured JSON outputs に条件づけられ、schemas と explicit data flow により narrative drift と hallucinations を抑え、interconnected narrative elements を scalable に作ることを狙う。評価は複数 independent runs に対する human-centered qualitative analysis で、structural completeness、internal consistency、narrative coherence、diversity、actionability などを見る。結果として、complexity が増えても logically sound and structurally valid な RPG content を生成できたと報告されている。

出典確認: arXiv:2604.25482v1、2026-04-28 submitted。著者は Dominik Borawski, Marta Szulc, Robert Chudy, Malgorzata Giedrowicz, Piotr Mironowicz。

## why_relevant_to_games

RPG や会話イベント生成で、最初から全文を一括生成せず、依存関係のある JSON 中間表現へ分ける候補。クエスト、NPC、世界設定の整合性を後工程で検査しやすくなる。
