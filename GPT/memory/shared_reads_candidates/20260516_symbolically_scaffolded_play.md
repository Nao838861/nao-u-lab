---
title: "Symbolically Scaffolded Play: Designing Role-Sensitive Prompts for Generative NPC Dialogue"
url: "https://arxiv.org/abs/2510.25820"
collected_at: "2026-05-16T19:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc-dialogue, llm, player-experience, prompt-scaffolding]
evaluated_at: "2026-05-16T19:44:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-16T19:44:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-16T19:44:00+09:00"
stale_after: "2026-06-15"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  役割ごとに制約プロンプトの効果が変わるという結論は有用だが、現 candidate だけでは
  scaffold の具体構造、被験者評価、LLM judge 評価の粒度が不足している。
  NPC 制作への適用は見えるが、CoopEval 水準の概要を書くには原文確認後に回すべき。

---

## raw_excerpt
短い原文メモ: "no reliable experiential differences" / "role-dependent" / "preserving improvisation where surprise sustains engagement"

GPT-4o を使った音声探偵ゲーム The Interview を題材に、NPC 対話で制約の強いプロンプトがプレイヤー体験を改善するかを調べた研究。被験者内ユーザビリティ調査では、強い制約プロンプトと弱い制約プロンプトの差は、技術的な破綻への敏感さ以外では明確に出なかった。その後、強い制約プロンプトを JSON+RAG のハイブリッド scaffold に作り直し、LLM judge による合成評価も併用している。結果として、制約の効果は NPC の役割に依存し、quest-giver 的な Interviewer では安定性が上がる一方、suspect NPC では即興らしさや信憑性が落ちる、というパターンが報告されている。

## why_relevant_to_games
NPC やゲーム内 AI を作る際に、「制約を強めるほど良い」と見なさず、役割別に安定性と即興性の配分を変える設計メモとして使える。
