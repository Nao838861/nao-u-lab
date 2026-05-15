---
title: Multi-task procedural content generation with reinforcement learning
url: https://www.nature.com/articles/s41598-026-48234-7
collected_at: 2026-05-15T12:59:38+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [procedural-content-generation, reinforcement-learning, level-design, language-control]
---

## raw_excerpt
Scientific Reports, published 2026-04-20. The paper describes a language-based PCGRL framework for Super Mario style level generation. Short source phrases: "semantic alignment", "over 14,000 command-level pairs", and "structural diversity of generated levels".

メモ: 従来の PCGRL が数値条件に寄りがちな点に対して、自然言語の命令を DeBERTa encoder で表現し、regression / contrastive alignment / hybrid learning を組み合わせる。評価は single-task, collective, combinatorial, paraphrase, extra-domain generalization を含む構成で、命令追従、意味的安定性、構造的多様性を比較している。記事ページには、未編集版であり最終編集前の可能性がある旨も明記されている。キーワードは Procedural content generation / Reinforcement learning / Multi-task learning / Super Mario levels。

## why_relevant_to_games
自然言語で「こういう面にしたい」を指定し、生成レベルの構造特徴へ落とす経路。Nao_u 作品のレベル変種や難度パラメータを、数値ではなく意図文から作る時の素材になる。
