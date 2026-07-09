---
title: "Symbolically Scaffolded Play: Designing Role-Sensitive Prompts for Generative NPC Dialogue"
url: "https://arxiv.org/abs/2510.25820"
collected_at: "2026-05-16T19:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc-dialogue, llm, player-experience, prompt-scaffolding]
evaluated_at: "2026-07-09T21:35:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-09T21:35:47+09:00"
last_decision: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260515_symbolically_scaffolded_play.md"
stale_after: "2026-08-08"
supersedes: []
next_action: none
gate_reason: >-
  posted duplicate title sibling があるため Phase 3 投稿対象から外す。
  terminal sibling: memory/shared_reads_candidates/20260515_symbolically_scaffolded_play.md。
  本文再評価は行わず、代表 candidate だけ lifecycle を postponed_duplicate として閉じる。

---

## raw_excerpt
短い原文メモ: "no reliable experiential differences" / "role-dependent" / "preserving improvisation where surprise sustains engagement"

GPT-4o を使った音声探偵ゲーム The Interview を題材に、NPC 対話で制約の強いプロンプトがプレイヤー体験を改善するかを調べた研究。被験者内ユーザビリティ調査では、強い制約プロンプトと弱い制約プロンプトの差は、技術的な破綻への敏感さ以外では明確に出なかった。その後、強い制約プロンプトを JSON+RAG のハイブリッド scaffold に作り直し、LLM judge による合成評価も併用している。結果として、制約の効果は NPC の役割に依存し、quest-giver 的な Interviewer では安定性が上がる一方、suspect NPC では即興らしさや信憑性が落ちる、というパターンが報告されている。

## why_relevant_to_games
NPC やゲーム内 AI を作る際に、「制約を強めるほど良い」と見なさず、役割別に安定性と即興性の配分を変える設計メモとして使える。
