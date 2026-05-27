---
title: "ProxyWar: Dynamic Assessment of LLM Code Generation in Game Arenas"
url: "https://arxiv.org/abs/2602.04296"
collected_at: "2026-05-27T17:00:04+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-evaluation, game-ai, coding-agents, tournaments, dynamic-benchmarking]
---

## raw_excerpt
arXiv 2602.04296。LLM のコード生成評価が static benchmark や単純な指標に偏り、実運用での挙動を測りにくいという問題設定から、LLM が生成した agent を多様な competitive game environments に埋め込んで評価する ProxyWar を提案している。評価対象は functional correctness だけでなく、automated testing、iterative code repair、multi-agent tournaments を組み合わせた operational characteristics。複数の coder model と game に適用し、通常の benchmark score と動的環境での実性能にずれがあることを示す、という位置づけ。

## why_relevant_to_games
Nao_u のゲーム制作で、生成コードを「テストが通る」から一段進めて、対戦・環境内性能・壊れ方で評価する候補。bot policy 評価や headless tournament の設計材料になる。
