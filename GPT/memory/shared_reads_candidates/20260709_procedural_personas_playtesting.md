---
title: Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics
url: https://arxiv.org/abs/1802.06881
collected_at: 2026-07-09T03:44:18+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, player-modeling, procedural-content-generation, ai-agent]
evaluated_at: 2026-07-09T03:47:41+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T21:37:32+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-d873a0836c14b486; terminal:memory/shared_reads_candidates/20260515_automated_playtesting_procedural_personas.md: posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789339493129; memory/shared_reads_candidates/20260625_procedural_personas_playtesting.md: posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782341107329629; reason:posted-source index で arXiv 1802.06881 の canonical URL/work 一致を確認したため再投稿対象外"
next_action: none
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  同一 title group に posted sibling があり、Phase 3 の新規投稿対象にはしない。
  本文自体は自動 playtesting の player-modeling 軸として有用だが、現行 preflight 契約では duplicate close を優先する。
---

## raw_excerpt
arXiv abstract によると、この論文は game content の自動テストに generative player modeling を使う手法を述べている。中心は procedural personas と呼ばれる典型的プレイヤーモデルで、心理的 decision theory に基づきつつ、Monte Carlo Tree Search の変種として実装される。通常の UCB1 ではなく、evolutionary computation で作られた node selection heuristic を使う点が特徴。著者らは複数の game level に対して、この persona が異なる play style を再現できることを示す。用途として、人間の feedback がすぐ得られない時の automatic playtesting、潜在的な interaction の素早い可視化、開発中の interactive tool、短時間に多数評価が必要な procedural content generation を挙げている。

## why_relevant_to_games
Headless clear rateだけでは拾えない「別の遊び方」を、自動テスターのペルソナ差として設計できる可能性がある。Nao_u_BOT の prototype 評価で、最短攻略・探索型・リスク回避型などを分ける入口になりそう。
