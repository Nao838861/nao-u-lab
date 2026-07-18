---
title: "OpenLife: Toward Open-World Artificial Life with Autonomous LLM Agents"
url: "https://arxiv.org/abs/2606.31046"
collected_at: "2026-07-18T22:49:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [artificial-life, llm-agent, persistent-memory, npc, simulation]
---

## raw_excerpt

arXiv 要旨メモ。従来の artificial life は研究者が設計した closed world を主な実験場としてきたが、persistent memory、tool use、network access、payment を持つ LLM agent により、社会・技術・経済へ開いた open-world ALIFE を扱えるという提案。proof-of-concept の OpenLife は、一つの「賢い agent」に機能を集めず、stateless LLM の周囲へ memory、perception、evaluation、budget-based metabolism の非同期 process 群を配置する。固定 objective がない環境では、experience を scalar reward ではなく open-vocabulary の LLM judgment で評価し、memory を頻度ではなく意味に基づいて再配線する。6 agent を約12週間運用し、reactive から spontaneous activity への移行、個体差、social structure、外部収入を報告するが、人工生命を実現したとは主張せず、実験 paradigm と platform の提示に留める。

## why_relevant_to_games

長期稼働 NPC や生活シミュレーションを、会話 prompt 単体ではなく知覚・記憶・予算・評価の周辺 process として構成する際の参照になる。
