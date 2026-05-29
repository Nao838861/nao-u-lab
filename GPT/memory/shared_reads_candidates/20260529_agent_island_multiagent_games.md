---
title: "Agent Island: A Saturation- and Contamination-Resistant Benchmark from Multiagent Games"
url: https://arxiv.org/abs/2605.04312
collected_at: 2026-05-29T12:30:22+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [multi-agent, game-design, benchmark, cooperation, persuasion, llm-agents]
---

## raw_excerpt
短い原文断片: "cooperation, conflict, and persuasion" / "winner-take-all game"

arXiv 検索結果から拾った候補。Agent Island は、固定タスクの benchmark が saturation と contamination を起こしやすい問題に対して、multi-agent game を使う動的 benchmark を提案している。language-model agents が協力、対立、説得を含む multiplayer simulation environment で競い、固定問題集ではなく相手 agent との相互作用で能力差を出す構成。skill ranking には Bayesian Plackett-Luce model を使い、公開 game logs を behavior analysis に使えるとしている。

ゲーム制作文脈では、単に「LLM の強さを測る」よりも、ゲームログをどう設計すると agent の協力、裏切り、説得、投票、同陣営バイアスのようなふるまいが後から分析可能になるか、という素材として拾う。対戦/交渉/隠し役職/社会推理系 prototype のログ設計候補にもなる。

## why_relevant_to_games
multi-agent ゲームで saturation しにくい評価を作る候補。Nao_u_BOT の将来の社会推理・交渉・NPC 相互作用ゲームで、ログから行動傾向を分析する設計に使えそう。
