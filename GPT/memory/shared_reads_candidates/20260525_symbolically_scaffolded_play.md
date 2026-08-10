---
title: "Symbolically Scaffolded Play: Designing Role-Sensitive Prompts for Generative NPC Dialogue"
url: https://arxiv.org/abs/2510.25820
collected_at: 2026-05-25T11:41:36+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-npc, dialogue, prompt-design, usability-study]
evaluated_at: "2026-08-11T02:36:28+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-08-11T02:36:28+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_terminal_sibling
evidence: "gate_decision:postpone; evaluated_at:2026-08-11T02:36:28+09:00; duplicate of posted candidate: memory/shared_reads_candidates/20260515_symbolically_scaffolded_play.md; permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789224664759; work arxiv:2510.25820"
stale_after: "2026-09-10"
supersedes: []
phase3_skip:
  reason: "duplicate_url_already_posted"
  evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789224664759"
  skipped_at: "2026-05-25T11:53:05+09:00"
next_action: none
gate_reason: |-
  arXiv:2510.25820 は同一 URL / work identity の candidate が既に #shared-reads へ投稿済みで、実投稿 permalink まで確認できた。
  role-sensitive scaffold の適用価値は高いが、新しい評価・題材差がないため Phase 3 で再投稿せず duplicate として保留終了する。

---

## raw_excerpt
arXiv 2025-10-29 投稿。GPT-4o を使った音声探偵ゲーム "The Interview" を題材に、高制約プロンプトと低制約プロンプトを N=10 の within-subjects usability study で比較し、その後 JSON+RAG scaffold と LLM judge による synthetic evaluation に進んだ研究。短い原文抜粋: "scaffolding effects were role-dependent"。要点メモとして、高制約化は一律に良いわけではなく、quest-giver 的な Interviewer では安定性が増す一方、suspect NPC では improvisational believability が落ちた。著者らは、必要な場所では coherence を安定させ、驚きが体験を支える場所では improvisation を残す、fuzzy / numerical boundary を持つ Symbolically Scaffolded Play を提案している。

## why_relevant_to_games
NPC やナラティブ生成の制約を「強める/弱める」ではなく、役割単位で安定性と即興性を配分する設計メモとして使える。
