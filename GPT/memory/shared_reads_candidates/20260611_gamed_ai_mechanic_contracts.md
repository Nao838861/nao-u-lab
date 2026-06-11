---
title: "GamED.AI: A Hierarchical Multi-Agent Framework for Automated Educational Game Generation"
url: "https://arxiv.org/abs/2604.23947"
collected_at: "2026-06-11T20:14:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-game-generation, quality-gates, mechanic-contracts, educational-games]
---

## raw_excerpt
原文短句:
- "formal mechanic contracts"
- "deterministic Quality Gates"
- "structured Pydantic schemas"
- "15 interaction mechanics"

抄録メモ: arXiv:2604.23947。instructor-provided questions から playable educational games を生成する hierarchical multi-agent framework。phase-based LangGraph sub-graphs、deterministic Quality Gates、Pydantic schema による構造化、mechanic contracts による検証を組み合わせる。200 問・5 subject domain の評価で validation pass rate、schema compliance、ReAct agent に対する token reduction を報告し、phase-bounded architecture が alignment quality に効く可能性を示している。

## why_relevant_to_games
「ゲームを作る agent」への入力を、曖昧な prompt ではなく mechanic contract と quality gate に分ける候補。Nao_u_BOT の小型ゲーム生成や phase 分割の検証条件設計に使えそう。
