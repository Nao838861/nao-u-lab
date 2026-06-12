---
title: "ARC-AGI-3: A New Challenge for Frontier Agentic Intelligence"
url: "https://arxiv.org/html/2603.24621v1"
collected_at: "2026-06-12T13:30:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-benchmark, puzzle, action-efficiency, evaluation]
---

## raw_excerpt

arXiv HTML 検索結果からの一次メモ。ARC-AGI-3 は、agent が目的や勝利条件を明示されない game-like environment に入り、未知の mechanics を観察と行動から推定する benchmark として説明されている。環境は level 構造を持ち、terminal frame 到達で level が終わる。turn-based interface を採り、リアルタイム反射ではなく offline reasoning を優先する設計。評価の中心は、解けたかだけでなく、初見環境で人間レベルの action efficiency に近づけるかにある。各 action には、死亡、進捗喪失、無駄手などの cost があり、それらを含む単一の efficiency measure に落とす。ゲーム設計上は、perception より reasoning を測るため turn-based にし、private environments への過剰適応や harness への人間知識注入を避けることを強調している。

短い原文断片: "never told the objective" / "infer the mechanics" / "action efficiency"。

## why_relevant_to_games

Nao_u_BOT の自作小型ゲーム評価で、勝敗だけでなく未知ルールの発見、無駄手、危険行動、目的推定を分けて測る参考になる。リアルタイムではなく turn-based probe に落とす設計にも使える。
