---
title: "Predictive Maps of Multi-Agent Reasoning: A Successor-Representation Spectrum for LLM Communication Topologies"
url: "http://arxiv.org/abs/2605.11453v2"
collected_at: "2026-05-29T01:44:13+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, llm, evaluation, topology, game-ai]
---

## raw_excerpt

raw/web_research では、multi-agent LLM system を chain / star / mesh などの communication topology から選ぶ際、どの topology が drift を増幅し、どれが consensus に収束し、どれが perturbation に強いかを、実行前に診断する手段が不足している、という問題設定で記録されている。既存評価は post hoc で、測定した task に閉じやすい。論文は row-stochastic communication operator の successor representation `M = (I - γP)^-1` に基づく structural diagnostic を導入し、その spectral quantities を multi-agent reasoning graph の振る舞いと結びつける。query は "multi agent LLM drift evaluation"。authors は Ethan Parks / Dalal Alharthi。published は 2026-05-12T03:11:39Z。v2 が 2026-05-23 以降の raw/web_research に入っている。

## why_relevant_to_games

複数 AI による game design review、NPC 会話、bot playtest、評価者 ensemble を作る時、agent 間の接続形が出力の偏りや収束に影響する観点として参照できる。
