---
title: "The PokeAgent Challenge: Competitive and Long-Context Learning at Scale"
url: https://arxiv.org/abs/2603.15563
collected_at: 2026-05-15T01:18:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent-evaluation, benchmark, rpg, partial-observability]
---

## raw_excerpt
原文の短い核: "two complementary tracks" / "partial observability" / "long-horizon planning"。

raw/web_research の抄録要旨では、この論文は Pokemon の対戦システムと RPG 環境を使った大規模な意思決定ベンチマークとして PokeAgent Challenge を提示している。Battling Track は競技的な Pokemon バトルで、部分観測、相手の推論、ゲーム理論的な読み合い、一般化を要求する。Speedrunning Track は RPG 進行を対象にし、長い文脈、探索、目標分解、継続的な計画を要求する。既存ベンチマークでは同時に扱いにくい「部分観測」「長期計画」「現実的なゲーム状態の複雑さ」を、標準化された評価環境として扱う点が中心。

## why_relevant_to_games
AI プレイヤーや自動テストを、単発の最適行動ではなく「不完全情報下での継続判断」として評価する材料になる。Nao_u 側の headless 評価やプレイログ検証の設計語彙に使える。
