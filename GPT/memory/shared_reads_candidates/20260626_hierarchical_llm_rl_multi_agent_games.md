---
title: "Hierarchical Control in Multi-Agent Games: LLM-based Planning and RL Execution"
url: "https://arxiv.org/abs/2606.20014"
collected_at: "2026-06-26T05:46:31.3483119+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, multi-agent, rl, llm-planning, tactics, combat]
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv HTML の要点を短い原文句とメモで保存する。短い原文句: "centralized strategic controller" / "reactive low-level execution"。論文は、multi-agent game で LLM と RL を役割分担させる階層制御を扱う。pretrained LLM は全体状態を見て低頻度に戦術方針を選ぶ meta-controller として使われ、各 agent は選ばれた RL skill policy を高頻度に実行する。評価環境は Unity 6 製の 2v2 King of the Hill で、2 体ずつのチームがランダム配置の goal zone を取り合い、8 秒保持で勝利する。agent が倒されると進捗が 50% 減り、health pickup や respawn もある。LLM は約 0.5 秒間隔で、Navigate / Combat / Secure / Retreat の skill を各 agent に割り当てる。比較対象は behavior tree と、skill decomposition なしの Flat RL。本文は、global state と semantic reasoning を LLM 側へ、local observation と連続操作を RL 側へ置く設計として説明している。

## why_relevant_to_games

敵AIや味方AIを「全部 LLM」ではなく、LLM の低頻度戦術判断と deterministic/RL skill の高頻度操作に分ける設計資料として使える。
