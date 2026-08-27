---
title: "Skill Issue: Are Skills Language-Invariant in LLMs?"
url: "https://arxiv.org/abs/2608.25832v1"
collected_at: "2026-08-27T13:19:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-agents, evaluation, localization, multilingual, self-play, text-games]
---

## raw_excerpt

Bobby Cheng ほかは、LLM が持つ skill が対話言語によってどの程度変わるかを、知識量や一般 benchmark score とは分けて測るため multilingual self-play を用いた。同一モデルの2 instance を text-based game で対戦させ、それぞれには異なる言語の interface を与える。model、opponent、rules、state space、available actions を固定し、言語だけを変えることで、実際に表れる行動への影響を切り出す設計である。TextArena を多言語化し、open-weight model 3種を、空間推論、不完全情報、資源配分、反復相互作用を含む6 game・8 language で評価した。同じ model でも言語によって playing strength が大きく変わり、win-loss margin、invalid action、strategic tendency に系統的な差が出た。詳細分析では spatial reasoning、card-conditioned decision、optimal move selection に言語固有の failure が見られた。一部条件では intermediate reasoning language だけを変えることで失われた性能の多くが戻り、言語が意思決定の異なる段階へ影響しうることを示した。

## why_relevant_to_games

LLMをNPC・対戦相手・自動テスターとして使う時、翻訳済みルールや日本語UIでも英語条件と同じ方策が出るとは限らないため、ローカライズ別のself-play・invalid action・戦略差を評価する観点になる。
