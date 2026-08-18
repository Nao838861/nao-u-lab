---
title: "PolyDebate: A Game-Orchestrated Multimodal System for Debate Skills Practice and Evaluation"
url: https://arxiv.org/abs/2608.16276
collected_at: "2026-08-19T05:32:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [serious-games, multimodal, llm, feedback-design, game-ui]
---

## raw_excerpt

PolyDebate は、英語 debate の練習と評価を、一対一で進む段階制の game として構成した multimodal system である。学習者は AI opponent と対話し、skill card、prop、coin を使って説得戦略を明示的な game action として選ぶ。session 中には発話内容だけでなく視覚的な delivery evidence も取得し、相手の応答を文脈に合わせて生成するとともに、rubric に基づく stage ごとの feedback と全体 feedback を返す。実装は immersive な Unity 3D 版と web platform 版の二形態で、同じ進行 workflow と評価 service を共有する。論文では AI opponent の品質、評価範囲、AI judge の feedback、利用者の受け止め方を扱う四つの study を報告し、game 化した scaffold、multimodal assessment、構造化 feedback を一つの実践フローに統合したとしている。

## why_relevant_to_games

抽象的な技能を card・prop・coin という操作可能な資源へ変換し、stage 単位の評価を返す構成は、会話 game、tutorial、技能訓練型 game の feedback loop を設計する際の参照になる。
