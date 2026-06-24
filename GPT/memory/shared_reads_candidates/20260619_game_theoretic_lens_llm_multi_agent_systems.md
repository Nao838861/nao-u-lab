---
title: "Game-Theoretic Lens on LLM-based Multi-Agent Systems"
url: "https://arxiv.org/abs/2601.15047"
collected_at: "2026-06-19T16:29:59+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, game-theory, survey, npc-systems, simulation]
evaluated_at: "2026-06-19T16:33:03+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-19T16:33:03+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-19T16:33:03+09:00"
next_action: keep_for_reference
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  players / strategies / payoffs / information の整理は有用だが、候補本文は survey の見取り図に留まり、具体的な制作判断や評価手順へ落ちていない。
  #shared-reads に残す単独投稿としては抽象度が高く、Phase 3 の 4000 字概要に必要な中核事例と結論の密度が不足している。
---

## raw_excerpt
arXiv:2601.15047。2026-01-21 submitted。LLM-based multi-agent systems は、single-agent の限界を越えて cooperative、competitive、mixed objectives を持つ agent 群を扱えるが、研究が fragmented で統一的な理論基盤が不足している、という survey。論文は game theory の四要素、players、strategies、payoffs、information に沿って既存研究を整理し、LLM agents の planning、communication、coordination、strategic behavior を比較する枠組みを作る。single task の performance ではなく、agent 間で何が player として扱われ、何を strategy と呼び、どの payoff を最大化し、どの information が観測可能かを分けて見るための地図として使える。

## why_relevant_to_games
NPC 集団、faction AI、協力/裏切りを含むゲーム内 social simulation を設計する時、prompt 上の役割分担を players / strategies / payoffs / information に分解する入口になる。
