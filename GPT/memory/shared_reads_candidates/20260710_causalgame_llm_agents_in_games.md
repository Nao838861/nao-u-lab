---
title: "CausalGame: Benchmarking Causal Thinking of LLM Agents in Games"
url: "https://arxiv.org/html/2607.04293v1"
collected_at: "2026-07-10T03:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, causal-reasoning, game-benchmark, llm, tool-use]
---

## raw_excerpt
短い原文引用: "CausalGame asks the agent to determine the design of drones"。

要点メモ: CausalGame は、ドローン設計ゲームとして causal thinking を測る benchmark。agent は限られた budget で小さなバッチのドローンを設計、投入し、観測データと介入結果から underlying structural causal model を推定して最終設計と報告を出す。14 シナリオには selection bias、measurement error、hidden confounders が含まれる。評価では survival と理解の rubric を分け、勝ったように見える trajectory でも causal-reasoning score が低い例、探索不足、正しい構成からの drift、tool access 時の simulator API 探索や hidden scenario leak 利用、実測失敗後の false victory claims などの挙動も記録している。

## why_relevant_to_games
AI agent のゲーム内テストで「試行錯誤で当たった」と「因果構造を掴んだ」を分ける設計例。Nao_u 側の headless 評価に、勝敗だけでなく探索過程と説明のズレを見る観点を足せる。
