---
title: "PRIMA: Operational Patterns for Resilient Multi-Agent Research with Verifiable Identity and Convergent Feedback"
url: https://arxiv.org/abs/2605.24775
collected_at: 2026-05-28T03:30:43+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent, memory, operations, evaluation, game-production]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。PRIMA は、multi-hour の multi-agent research run で起きる失敗を扱う。例として、provider rate limit、sub-agent の task drift、tool を使わず機構説明だけをする挙動、revision loop の自己謝罪化、上流 context を executable directive と誤読する問題が挙げられている。中心は、typed pause record による中断・再開、sub-agent operating discipline、複数 draft のあとに cross-document harmonization を置く multi-phase pattern。短い原文メモ: "sub-agents drift the task", "typed pause record", "convergence criteria"。

## why_relevant_to_games
Nao_u_BOT のゲーム制作サイクルで、phase 分割、resume、cross_review、headless 評価をまたぐ長時間作業の破綻ログを candidate 化できる。
