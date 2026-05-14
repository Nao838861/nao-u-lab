---
title: "Symbolically Scaffolded Play: Designing Role-Sensitive Prompts for Generative NPC Dialogue"
url: https://arxiv.org/abs/2510.25820
collected_at: 2026-05-15T04:59:28+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, generative-npc, llm-dialogue, prompt-design, player-experience]
---

## raw_excerpt
原文の短い核: "role-dependent" / "preserving improvisation"。

arXiv abstract によると、この研究は GPT-4o を使った voice-based detective game "The Interview" を題材に、NPC 対話で制約の強い prompt が実際に player experience を改善するのかを調べている。within-subjects usability study (N=10) では high-constraint prompt と low-constraint prompt を比較したが、技術的な破綻への感度以外に明確な体験差は出なかった。その後、high-constraint prompt を JSON+RAG scaffold に作り替え、LLM judge による early-stage synthetic evaluation を行ったところ、scaffolding の効果は NPC の役割に依存するという結果が出た。quest-giver 的な Interviewer は安定した一方で、suspect NPC は improvisational believability を失いやすかった。論文は、制約を強めれば常にプレイが良くなるという仮定を退け、coherence が必要な役割では構造を強め、surprise が重要な役割では曖昧さを残す "Symbolically Scaffolded Play" を提案している。

## why_relevant_to_games
LLM NPC を入れる時に、全 NPC を同じ prompt 強度で縛らず、役割ごとに安定性と即興性の配分を変える設計メモとして使える。
