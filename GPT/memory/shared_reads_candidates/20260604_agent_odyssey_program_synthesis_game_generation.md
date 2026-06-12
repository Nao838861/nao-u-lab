---
title: "Agent Odyssey: Game Generation with Program Synthesis"
url: https://agentodyssey.github.io/paper.pdf
collected_at: 2026-06-04T12:44:52.9748217+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, llm-agent, program-synthesis, evaluation]
evaluated_at: 2026-06-04T12:50:19.9966919+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-06-04T12:50:19.9966919+09:00
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-04T12:50:19.9966919+09:00"
next_action: revise_or_research
stale_after: "2026-07-04"
supersedes: []
gate_reason: |-
  entity / rule / quest generator と runtime validation の接続は自動ゲーム生成の素材として有望。
  ただし候補本文だけでは評価設計と実験結果の中身が薄く、CoopEval 水準の概要を書くには paper 全体の追加確認が必要。
---

## raw_excerpt
Agent Odyssey paper。PDF の game generation section では、LLM-based program synthesis and editing によって game generators を作ると説明されている。framework は Aider を土台にし、entity generator、rule generator、quest generator の 3 要素で構成される。それぞれが base game を条件として、新しい entities、dynamics、quests を生成し、ゲームを拡張・変更する。

人間の design は base game の構築に限定される。base game は agent の key abilities を測るために設計されつつ、LLM が context から学んで新しいゲームを生成できるよう明確な構造を保つ。生成ゲームは entities、storylines、actions、world dynamics が base game と大きく異なり、抽象 classes と minimal RPG-style scaffold の上で、action effects、entity dependencies、NPC behaviors、stochastic outcomes、long-range consequences などを生成する。

重要なのは、generated games が sound とは限らないため、random agent などで実行して error を feedback として戻す automated testing pipeline を入れている点。static syntax check ではなく、runtime end-to-end functional validation を使って generated game の robustness を上げる。

## why_relevant_to_games
自動ゲーム生成を「生成して終わり」ではなく、random/LLM/human agent で実行して runtime feedback を返す構成にする候補素材。
