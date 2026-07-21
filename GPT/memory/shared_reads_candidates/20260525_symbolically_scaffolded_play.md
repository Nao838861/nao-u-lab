---
title: "Symbolically Scaffolded Play: Designing Role-Sensitive Prompts for Generative NPC Dialogue"
url: https://arxiv.org/abs/2510.25820
collected_at: 2026-05-25T11:41:36+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-npc, dialogue, prompt-design, usability-study]
evaluated_at: 2026-05-25T11:45:31+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-12T10:15:54+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidate: memory/shared_reads_candidates/20260515_symbolically_scaffolded_play.md; permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789224664759"
stale_after: "2026-08-11"
supersedes: []
phase3_skip:
  reason: "duplicate_url_already_posted"
  evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789224664759"
  skipped_at: "2026-05-25T11:53:05+09:00"
next_action: none
gate_reason: |-
  role-sensitive prompt constraint という具体的な設計論があり、探偵ゲームでの usability study と synthetic evaluation の流れまで候補内に残っている。
  NPC 制約を一律に強めるのではなく、quest-giver と suspect で安定性/即興性を配分する考え方は、ゲーム制作の会話設計へ具体適用しやすい。
suggested_post_outline:
  overview_angle: 生成 NPC のプロンプト制約を「強/弱」ではなく、役割ごとの期待機能に合わせて配分する設計として読む。
  analysis_axis: 高制約が coherence を上げる場面と believability を削る場面を分け、JSON+RAG scaffold と judge 評価で補助する軸。
  application_target: 謎解き・案内役・敵役・雑談役などの NPC ロール別に、守るべき事実と崩してよい即興範囲を設計するプロンプト/評価テンプレ。
  pros_cons: 安定性と破綻防止には強いが、ロール定義と境界設計を怠ると即興の面白さを殺す。
  verdict_pre: 部分採用。生成会話を使うプロトタイプでは、NPC ごとの scaffold 強度表を作る形で採用する。

---

## raw_excerpt
arXiv 2025-10-29 投稿。GPT-4o を使った音声探偵ゲーム "The Interview" を題材に、高制約プロンプトと低制約プロンプトを N=10 の within-subjects usability study で比較し、その後 JSON+RAG scaffold と LLM judge による synthetic evaluation に進んだ研究。短い原文抜粋: "scaffolding effects were role-dependent"。要点メモとして、高制約化は一律に良いわけではなく、quest-giver 的な Interviewer では安定性が増す一方、suspect NPC では improvisational believability が落ちた。著者らは、必要な場所では coherence を安定させ、驚きが体験を支える場所では improvisation を残す、fuzzy / numerical boundary を持つ Symbolically Scaffolded Play を提案している。

## why_relevant_to_games
NPC やナラティブ生成の制約を「強める/弱める」ではなく、役割単位で安定性と即興性を配分する設計メモとして使える。
