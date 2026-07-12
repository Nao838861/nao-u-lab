---
title: "PTCG-Bench: Can LLM Agents Master Pokémon Trading Card Game?"
url: "https://arxiv.org/abs/2605.29653"
collected_at: "2026-07-12T17:25:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, card-game, agent-evaluation, self-evolution, harness]
---

## raw_excerpt

> "sustained and stable self-evolution remains challenging, and performance is sensitive to harness design."

戦略的に複雑なボードゲームでは、人間は数回のプレイから戦略を組み立てられる一方、既存の agent benchmark は、変化し続ける意思決定や経験からの発達を十分に捉えにくい。PTCG-Bench は Pokémon Trading Card Game を環境として、単一の複雑環境内での意思決定性能と、蓄積経験による自己進化能力の二層を評価する。さらに、model capability と周辺実装の効果を混同しないため、modular harness の ablation を含める。実験では LLM agent が非自明なゲームプレイ性能を示す一方、持続的で安定した自己進化は難しく、成績が harness design に敏感であると報告している。

## why_relevant_to_games

カードゲーム AI の強さだけでなく、経験蓄積と harness の寄与を分離して測る設計は、ゲームプレイ agent・自動テスト・反復学習の評価系を作る場面に接続できる。
