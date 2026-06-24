---
title: "Joint Agent Memory and Exploration Learning via Novelty Signals"
url: "https://arxiv.org/abs/2606.01528"
collected_at: "2026-06-16T14:14:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, exploration, novelty, open-ended-environment, game-ai]
evaluated_at: "2026-06-16T14:18:59+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-16T14:18:59+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-16T14:18:59+09:00"
next_action: revise_or_research
stale_after: "2026-07-16"
supersedes: []
gate_reason: |-
  memory と exploration を novelty signal で同時に学習する着想はゲーム AI 評価へ有用だが、現 candidate だけでは novelty signal の定義、memory 表現、学習手順の具体が薄い。
  Phase 3 の ~4000 字概要として残すには、論文本文から設計要素と評価条件を補ってから再判定するのが妥当。
---

## raw_excerpt
arXiv 2606.01528。Shizuo Tian, Xiaohong Weng, Rui Kong, Yuxuan Chen, Guohong Liu, Yuebing Song, Jiacheng Liu, Yuchen Li, Dawei Yin, Ting Cao, Yunxin Liu, Yuanchun Li による JAMEL 論文。open-ended environment では探索が重要だが、raw interaction history を長期保持すると token cost が高く、latent memory は supervision が弱いという問題から出発している。JAMEL は agentic memory と exploration policy を novelty-driven interaction で一緒に訓練する枠組みで、memory が「既に試した行動」と「未探索の行動」を区別し、novelty-seeking interaction が memory を学習させる supervision になる、という相互依存を扱う。

raw web research では、GUI domain の code coverage のような deterministic and persistent novelty signal を annotation-free supervision として使う点が記録されている。評価では unseen environments への generalization、open-weight baselines 以上の探索、closed-source model に近い exploration depth、token consumption の削減が報告されている。短い引用語句として "memory and exploration form a mutually dependent loop" と "novelty-driven interaction"。

## why_relevant_to_games
ローグライク、探索型パズル、AI プレイヤー評価で、coverage や新規状態到達を「探索が進んだ」信号として使い、記憶と探索方針を同時に評価する視点になる。
