---
title: "ShadowDancer: Teaching Video World Models Any Action by Learning Unified Dynamics Representations from a Video and Its Shadow"
url: "https://arxiv.org/abs/2607.28362"
collected_at: "2026-08-03T12:05:30+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, world-model, action-control, video-generation, evaluation]
---

## raw_excerpt

2026年7月30日提出の論文。interactive video world model に、任意の action を frame 単位で再現させるための表現学習を扱う。従来の action interface は、自然言語などで緩く指定すると動きの細部を model が補完してしまい、構造化信号で厳密に指定すると特定の動作 family に閉じ、信号の取得も難しい。demonstration video は動きを frame ごとに示せる一方、背景・人物・物体など一つの appearance と結び付いているため、別 scene へ動作だけを移す時に崩れやすい。

ShadowDancer は、同じ dynamics を保ったまま appearance を独立に再 sampling した二本の video を “shadow pair” として構成する Shadow Library と、一方の shadow から他方を予測する cross-shadow prediction を組み合わせる。pair 間で変わる appearance は予測に不要な情報として捨て、pair 間で保存される時間的 dynamics を action 表現として残す設計である。その表現で block-causal world model を駆動し、action label、motion estimator、追加 fine-tuning なしに、demonstration clip を別環境で再利用できる action asset にする。論文 abstract は、複数の dynamics family における action transfer と長期 rollout を既存 latent-action / interactive world model と比較し、blinded comparison の平均 win rate 86% と報告している。

## why_relevant_to_games

gameplay video から見た目と操作結果の dynamics を分け、別 level・character・skin へ action を移す発想は、world-model 型の自動プレイ、操作再現、prototype 動作検証を考える場面の外部資料になる。
