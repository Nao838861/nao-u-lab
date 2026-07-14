---
title: "Test-Time Exploration in Unknown Environments"
url: "https://openreview.net/forum?id=EfxT5mUQgS"
collected_at: "2026-07-14T15:14:08.5447029+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, exploration, implicit-rules, agent-evaluation, playtesting]
---

## raw_excerpt

OpenReview 掲載の ICLR 2026 submission。対象は、観測から直接は分からず、環境との相互作用を通して推定する必要がある implicit rules を含む未知環境である。著者らは、既存 agent が同じ失敗を反復する問題に対し、interaction history を分析して隠れた規則の仮説を作る thinker と、その指針で行動する actor を分けた Test-Time Exploration（TTExplore）を提案する。疎な task reward だけでは thinker の訓練が不安定になるため、task decomposition と difficulty filtering を組み込んだ reinforcement learning pipeline を構成し、専用の 7B Exp-Thinker を訓練した。五つの text-based embodied tasks において、Exp-Thinker を用いた TTExplore は baseline agent の score を平均 14〜19 points 改善したと報告されている。論文の中心語は “infer these implicit rules and guide an actor” であり、単なる行動回数の増加ではなく、履歴から規則を推定して次の探索方針へ戻す構成を扱う。

## why_relevant_to_games

説明されていない mechanic や状態遷移を初見プレイから推定する playtest agent、同じ失敗を繰り返さない探索ログ、チュートリアルなしで rule discovery が成立するかの評価を設計する場面に接続できる。
