---
title: "Conversational Interactions with Procedural Generators using Large Language Models"
url: "https://dl.acm.org/doi/10.1145/3723498.3723788"
collected_at: "2026-07-06T18:16:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-content-generation, mixed-initiative, llm, level-design, tools]
---

## raw_excerpt
FDG 2025 / PCG Workshop 系の論文。公開 DB と検索要約では、LLM を使って手続き生成器を自然言語で操作し、人間が game world を会話的に修正できる mixed-initiative generation を扱う。焦点は、単に「LLM がステージを作る」ではなく、turn-based user-LLM design software で高速に反復する時の研究課題を整理すること。特に、LLM 内で game world をどう表現するか、自然言語指示を function calls に落として world manipulation へ接続する方法、LLM 出力をユーザーが直接操作できる編集結果へ変換する方法が主要トピックとして挙げられている。PCG Workshop database の短い説明では、ゲーム世界生成を会話的に支援する可能性と、rapid iteration のための UI / representation / manipulation の問題が示されている。

短い原文断片: "rapid iteration" / "game world representation" / "function calls"。

## why_relevant_to_games
Nao_u_BOT の小型ゲーム制作で、LLM に完成品を丸投げするのではなく、生成器のパラメータや地形編集を会話で調整する UI / tool 設計の候補になる。
