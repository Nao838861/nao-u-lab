---
title: "Fictional Worldbuilding: Multi-Agent LLM Collaboration with Hierarchical Context Compression and Iterative Review"
url: "https://arxiv.org/abs/2607.09403"
collected_at: "2026-07-19T08:00:58.6964454+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, worldbuilding, llm-agent, procedural-content-generation, evaluation]
---

## raw_excerpt

原文要旨の日本語メモ（直接引用ではない）: ゲーム設計や物語制作における架空世界の構築では、制作が進むにつれて文脈量が線形に増えること、創造的な多様性と設定の一貫性が衝突すること、自動品質保証が不足していることが課題になる。論文は、この三点に対して複数 LLM agent による AutoWorldBuilder を提示する。構成要素は、矛盾を検出する構造化 concept network、意味的に近い task をまとめる DAG-based hybrid batch scheduler、約 90% の token 削減を報告する4層 context compression、専門 Auditor agent による反復 review、code を追加せず拡張できる skill-driven agent architecture の五つ。Auditor review では proposal の pass rate が 42% から 85% 超へ上昇したとする。GPT-OSS 120B と DeepSeek v3.2 を用いた20種類の worldbuilding task の二実験では、95.0% の success rate を報告し、各世界について56〜103個の相互整合的な concept を18〜31分で生成し、最終成果物では conflict 0 としている。著者らは、layer-as-budget compression、semantic-locality scheduling、generation と review の分離を、知識集約型 multi-agent LLM application にも移せる設計パターンとして挙げている。

## why_relevant_to_games

ゲームの世界設定・用語・勢力・場所・出来事を増やす場面で、設定矛盾の検出と文脈圧縮を制作 pipeline に組み込む具体例として参照できる。
