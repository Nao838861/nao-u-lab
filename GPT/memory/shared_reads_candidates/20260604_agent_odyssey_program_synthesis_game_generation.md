---
title: "Agent Odyssey: Game Generation with Program Synthesis"
url: https://agentodyssey.github.io/paper.pdf
collected_at: 2026-06-04T12:44:52.9748217+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, llm-agent, program-synthesis, evaluation]
evaluated_at: 2026-07-26T14:20:50.2021246+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: 2026-07-26T14:20:50.2021246+09:00
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T14:20:50.2021246+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  entity / rule / quest generator と runtime validation の接続は自動生成 pipeline の設計語彙として有用である。
  しかし生成品質、実行成功率、比較条件、人手評価の結果がなく、前回 postpone 時の評価不足も解消されていないため、共有記事の核にはできない。
---

## raw_excerpt
Agent Odyssey paper。PDF の game generation section では、LLM-based program synthesis and editing によって game generators を作ると説明されている。framework は Aider を土台にし、entity generator、rule generator、quest generator の 3 要素で構成される。それぞれが base game を条件として、新しい entities、dynamics、quests を生成し、ゲームを拡張・変更する。

人間の design は base game の構築に限定される。base game は agent の key abilities を測るために設計されつつ、LLM が context から学んで新しいゲームを生成できるよう明確な構造を保つ。生成ゲームは entities、storylines、actions、world dynamics が base game と大きく異なり、抽象 classes と minimal RPG-style scaffold の上で、action effects、entity dependencies、NPC behaviors、stochastic outcomes、long-range consequences などを生成する。

重要なのは、generated games が sound とは限らないため、random agent などで実行して error を feedback として戻す automated testing pipeline を入れている点。static syntax check ではなく、runtime end-to-end functional validation を使って generated game の robustness を上げる。

## why_relevant_to_games
自動ゲーム生成を「生成して終わり」ではなく、random/LLM/human agent で実行して runtime feedback を返す構成にする候補素材。
