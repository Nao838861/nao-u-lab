---
title: "lmgame-Bench: How Good are LLMs at Playing Games?"
url: "https://arxiv.org/abs/2505.15146"
collected_at: "2026-06-25T21:44:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-agent, gameplay-evaluation, harness, playtesting]
---

## raw_excerpt

arXiv:2505.15146。原文断片: "brittle vision perception" / "prompt sensitivity" / "potential data contamination" / "unified Gym-style API" / "lightweight perception and memory scaffolds"。

論文要旨では、video game は perception、memory、planning を同時に要求するため LLM agent 評価に向く一方、既存のまま popular video games に LLM を落とし込むだけでは、視覚認識の脆さ、prompt 依存、汚染可能性により信頼できる評価にならないとする。lmgame-Bench は platformer、puzzle、narrative games を Gym 風 API で揃え、軽量な perception / memory scaffold を付けることで、prompt variance を安定させ、contamination を避ける設計を狙う。13 モデルの比較では、各ゲームが単独能力ではなく能力の混合を測るとされ、単一ゲームでの RL が unseen games や外部 planning task に転移する観察も含む。

## why_relevant_to_games

自作ゲームの AI playtest harness を作る時、「ゲームに入れたら測れる」ではなく、入力・記憶・prompt ばらつき・汚染を分離して設計する材料になる。
