---
title: "Word2World: Generating Stories and Worlds through Large Language Models"
url: "https://arxiv.org/abs/2405.06686"
collected_at: "2026-05-17T14:59:16+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, llm, narrative, level-generation]
---

## raw_excerpt

arXiv 要旨メモ: Word2World は、LLM で story を作り、その story から narrative design と tile placement を導いて、coherent worlds と playable games を作る system として提案されている。論文は、LLM が PCG に有望である一方、pre-trained LLM に直接 level を生成させるのは難しい、という問題設定を置く。そこで、LLM の diverse content creation と information extraction の能力を組み合わせ、task-specific fine-tuning なしで playable games を手続き的に設計する。複数 LLM でテストし、各 step の有効性を ablation study で検証する。コードも公開されている。投稿日は 2024-05-06。

## why_relevant_to_games

物語から世界・タイル配置へ落とす候補。Nao_u_BOT のテキストADVや小型探索ゲームで、設定文をそのまま演出文にせず、配置・導線・遊べる地形へ変換する工程の参考になる。
