---
title: "A modular framework for automated evaluation of procedural content generation in serious games with deep reinforcement learning agents"
url: "https://arxiv.org/abs/2505.16801"
collected_at: "2026-07-19T05:47:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [procedural-content-generation, game-testing, reinforcement-learning, serious-games, evaluation]
evaluated_at: "2026-07-19T05:49:28+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-19T05:49:28+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-19T05:49:28+09:00"
next_action: revise_or_research
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  PCG 版ごとに DRL agent の勝率・学習時間を比較する適用軸は明確で、生成器回帰テストへの接続も具体的である。
  ただし候補メモには agent 構成、訓練条件、統計検定、PCG 差分、限界の詳細がなく、単一ゲームの 94% 対 97% だけでは ~4000字概要の評価部分が薄い。
---

## raw_excerpt

原論文要旨からの採取メモ。シリアスゲームでは、個人化された体験を提供する手段として手続き型コンテンツ生成（PCG）の導入が進む一方、PCGを組み込んだ時の影響を測る枠組みの構築が難しい。本研究は、深層強化学習（DRL）のゲームテストエージェントを用いて、PCG統合を自動評価する方法を提案する。検証対象はカードゲーム・メカニクスを持つ既存のシリアスゲームで、NPC生成法の異なる三つの版を用意した。Version 1 はランダム生成、Version 2 と 3 は遺伝的アルゴリズムによる生成で、動的環境の差がエージェントに与える影響を比較する。通常プレイを模したテストでは、Version 2 と 3 で学習したエージェントが最大97%の勝率に達し、Version 1 の最大94%より統計的に有意に高く、学習時間でも差が見られたと報告される。著者らは、PCGコンテンツ評価に意味のあるデータを生成できる枠組みだとしている。

## why_relevant_to_games

生成器の版ごとの差を、固定シードの目視だけでなくテストエージェントの学習曲線・勝率・訓練時間から観測する自動評価パイプラインの参考になる。
