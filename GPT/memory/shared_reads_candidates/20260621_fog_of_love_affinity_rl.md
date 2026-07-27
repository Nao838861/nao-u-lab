---
title: "Fog of Love: Engineering Virtuous Agent Behavior with Affinity-based Reinforcement Learning in a Game Environment"
url: "https://arxiv.org/abs/2606.04750"
collected_at: "2026-06-21T00:44:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, reinforcement-learning, board-game, npc-behavior, evaluation]
evaluated_at: "2026-07-27T18:53:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T18:53:09+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T18:53:09+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  競争と協調を同時に扱う affinity regularization は、NPC の価値観と行動理由を設計する用途へ具体的に接続できる。
  ただし candidate は要旨中心で、定式化、baseline、ablation、結果量がなく4000字級の評価説明はまだ書けない。本文の実験表まで補って再判定する。
---

## raw_excerpt

arXiv:2606.04750。2026-06-03 submitted。対象は Ajay Vishwanath / Christian Omlin による、ロールプレイングボードゲーム Fog of Love をもとにした multi-agent reinforcement learning 環境。原文の短い核は "affinity-based reinforcement learning" と "two-player multi-agent environment based on the role-playing board game known as Fog of Love"。論文は、virtue / affinity のような行動傾向を reward function だけに押し込むのではなく、policy regularization を通じて agent の選択を誘導する手法として扱っている。

ゲーム環境では、2 体の agent が自分の個別 virtue を満たすために競争しつつ、relationship を成立させるために協力も必要になる。単純な grid world ではなく、競争目的と協調目的が同時に走る場面で、multi-agent deep deterministic policy gradient だけではうまく compete / cooperate できない問題を置いている。localized affinities を入れることで、competitive objective と cooperative objective の両方で overall score が改善し、行動の teleology が human-level interpretable になる、という主張が要旨にある。

## why_relevant_to_games

NPC や AI teammate を「勝つ/負ける」だけでなく、関係性・価値観・協調/競争の混在で評価する設計素材。対人風ゲームや物語付きボードゲームの agent 行動ログを、何を望んで行動したかまで読める形にする候補。
