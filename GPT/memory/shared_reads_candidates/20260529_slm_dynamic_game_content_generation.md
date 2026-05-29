---
title: "High-quality generation of dynamic game content via small language models: A proof of concept"
url: "https://arxiv.org/abs/2601.23206"
collected_at: "2026-05-29T10:13:42+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, narrative, small-language-models, offline-games]
---

## raw_excerpt

Copyright-safe excerpt notes from the abstract/search record:

- Short quoted phrase: "aggressive fine-tuning"
- Short quoted phrase: "narrower scope and higher specialization"
- Short quoted phrase: "retry-until-success strategy"

この proof of concept は、ゲーム内の dynamic content generation を巨大クラウド LLM ではなく small language model で行う方向を扱う。高品質化の鍵として、タスクを narrow context / constrained structure / specific training corpus に強く絞り、synthetic data を DAG-based approach で game world に grounded する。検証例は reputation を巡る rhetorical battle の minimal RPG loop で、LLM-as-a-judge による品質評価と latency を見ている。

## why_relevant_to_games

ローカル・オフライン・低遅延のゲーム内生成を考える時、LLM に広く任せるのではなく、狭い構造と retry を組み合わせる候補として参照できる。
