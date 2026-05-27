---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "http://arxiv.org/abs/2605.23652v1"
collected_at: "2026-05-27T19:23:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc-ai, reinforcement-learning, persona, evaluation]
---

## raw_excerpt
要旨メモ: life-simulation games で多数の NPC に別々の人格を持たせる問題に対し、自然言語で書かれた persona を条件として受け取る共有 RL policy を使い、個別 NPC ごとの制御性、persona 一貫性、リアルタイム推論の両立を狙う。300 persona の life-simulation benchmark で、zero-shot persona identification、semantic-behavioral alignment、LLM-as-policy baseline との推論速度比較を報告している。

## why_relevant_to_games
大量 NPC を LLM 直呼び出しで動かすのではなく、人格を trace できる軽い policy に落とす設計候補。会話中心ではない生活シミュや群衆行動の評価軸として使えそう。
