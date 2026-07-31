---
title: "ChronoMem: Version Control and Semantic Rollback for Large Language Model Agent Memory"
url: "https://arxiv.org/abs/2607.27773"
collected_at: "2026-07-31T19:46:13.4411018+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agents, memory, evaluation, game-ai]
---

## raw_excerpt

abstract の重要部分を日本語で記録する。既存の LLM agent memory は、情報を蓄積・統合・上書きしながら前方へ進む設計が中心で、過去状態の検査、版管理、復元を原則として持たない。このため、訂正、concept drift、memory corruption が起きた後、とくに後続情報へ触れた agent を以前の状態へ戻すことが難しい。ChronoMem は Google Agent Development Kit に統合する semantic version-control layer として、原文の表現では “commits whole-memory snapshots at each memory write” を行い、構造化された履歴を維持する。自然言語の undo intent は、lexical・semantic retrieval、rank fusion、reranking を介して具体的な過去 version へ対応付ける。

評価では、単に過去 snapshot を選べるかだけでなく、rollback 後の agent が、後から得た更新を一度も見ていないかのように質問へ答え、履歴を要約できるかを post-exposure protocol で測る。長期会話 benchmark に変化する memory state と rollback task を加え、prompt-only / retrieval-only baseline と比べて rollback-consistent question answering、history summarization、semantic version selection を評価したと報告している。arXiv v1 は 2026-07-30 提出。

## why_relevant_to_games

長期運用する NPC、playtest agent、制作支援 agent の記憶を build・scenario 単位で巻き戻し、後続情報の混入なしに旧状態を再評価する仕組みと評価条件を考える材料になる。
