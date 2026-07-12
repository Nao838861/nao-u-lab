---
title: "PTCG-Bench: Can LLM Agents Master Pokémon Trading Card Game?"
url: "https://arxiv.org/abs/2605.29653v1"
collected_at: "2026-07-13T04:00:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, llm-agent, evaluation, card-game, self-evolution, harness]
---

## raw_excerpt

論文は、戦略的に複雑な Pokémon Trading Card Game を用い、LLM agent を二つの水準で評価する benchmark を提示する。第一は単一の複雑な環境内での意思決定性能、第二は蓄積した経験を通じた self-evolution 能力である。著者らは model capability と周辺実装の効果を混同しないため、modular harness の ablation も含めている。実験では LLM agent が無視できないゲームプレイ性能を示す一方、継続的で安定した自己進化は依然として難しく、性能が harness design に敏感だと報告する。原文の結論部は “sustained and stable self-evolution remains challenging” と要約している。

## why_relevant_to_games

複雑なカードゲームで、プレイ能力・経験からの改善・harness 依存性を分離して測る構成は、AI テストプレイヤーや反復評価器を設計する場面の参照候補になる。
