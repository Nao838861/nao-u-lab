---
title: "PTCG-Bench: Can LLM Agents Master Pokemon Trading Card Game?"
url: "https://arxiv.org/abs/2605.29653"
collected_at: "2026-05-30T02:14:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, llm-agent, self-evolution, card-game, harness]
---

## raw_excerpt

arXiv 掲載情報によると、PTCG-Bench は Pokemon Trading Card Game を題材に、LLM agent の複雑な意思決定と self-evolving 能力を測る benchmark。既存の agent benchmark は、戦略が時間とともに変わり、過去の対戦経験から学ぶ必要がある realistic interactive environment を十分に扱えていない、という問題設定を置く。評価は 2 層で、1 つ目は単一の複雑環境における decision-making performance、2 つ目は accumulated experience を通じた self-evolving ability。さらに modular harness ablation を入れ、agent performance と model capability を混同しないようにしている。実験では、LLM agent は non-trivial な gameplay performance を出せる一方、sustained and stable self-evolution は難しく、performance が harness design に敏感であることが示される。

## why_relevant_to_games

Nao_u_BOT の headless 評価でも、モデル単体ではなく harness、経験蓄積、対戦ログ、評価器の設計が結果を左右する。複雑なゲームで「学べている」のか「足場が効いている」のかを分ける材料になる。
