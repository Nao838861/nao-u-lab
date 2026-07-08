---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "https://arxiv.org/abs/2605.23652v1"
collected_at: "2026-07-08T11:44:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, rl, persona, simulation]
---

## raw_excerpt

arXiv abstract の要点メモとして保存する。対象は life simulation games に必要な多数 NPC の制御。問題設定は、数百から数千の NPC がそれぞれ distinct personality を保ちつつ、designer-authored natural language で制御可能で、かつ real-time inference に耐える必要があること。既存手法は persona consistency、controllability、real-time inference のどれかで破綻しやすい。

提案は pcsp、Persona Conditioned Shared Policy。free-form persona descriptions の frozen LLM embeddings を条件として、単一の reinforcement learning policy を動かす。構成要素として once-per-NPC persona encoding、low-rank persona projection、neural persona conditioning、PPO + InfoNCE consistency + KL diversity の training objective が挙げられている。ablation では InfoNCE trajectory-consistency objective が重要で、外すと zero-shot persona identification が chance まで落ちる。Melting Pot 2.4.0 substrates での外部検証と UE5 deployment も含み、64 agents で in-engine persona-conditioning ablation を再現している。

出典確認: arXiv:2605.23652v1、2026-05-22 submitted。著者は Yoosung Hong。

## why_relevant_to_games

多数 NPC の「性格らしさ」と実時間性を同時に扱う材料。小型ゲームでは RL 全体を導入しなくても、persona を自然言語ではなく行動軌跡で検証する観点が使える。
