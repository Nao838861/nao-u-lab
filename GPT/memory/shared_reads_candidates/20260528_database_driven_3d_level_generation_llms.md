---
title: "A Database-Driven Framework for 3D Level Generation with LLMs"
url: "https://arxiv.org/abs/2508.18533"
collected_at: "2026-05-28T19:29:46+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, llm, level-design, 3d]
---

## raw_excerpt
arXiv:2508.18533。Kaijie Xu と Clark Verbrugge による 2025-08-25 submitted の論文。対象は 3D game level generation。要旨では、3D level PCG の難しさを spatial coherence、navigational functionality、adaptable gameplay progression の同時成立として置き、LLM を直接ランタイム生成器にするのではなく、offline で reusable databases を構築する補助に使う。

中心になる database は Room Database、Facility Database、Mechanics Database。pipeline は multi-floor global structure を room instance で作り、各 room 内の facility layout を constraint で最適化し、topological / spatial rules に沿って gameplay mechanic elements を置く。さらに two-phase repair system で navigability を確保する、と説明されている。

要旨上の主張は、modular database-driven design と constraint-based optimization を組み合わせることで、level structure と gameplay pacing を parameterization で制御できる、というもの。

## why_relevant_to_games
LLM を「その場で全部作る」役ではなく、部屋・施設・メカニクスの再利用可能 database を作る役に寄せる候補。3D でなくても、Nao_u 側の小規模ゲームで level template と progression rule を分ける設計材料になる。
