---
title: "StatePlay: State-Aware Game World Models for Mechanics-Consistent Generation"
url: "https://arxiv.org/abs/2607.26754"
collected_at: "2026-07-31T23:46:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, world-model, game-mechanics, state-modeling, generative-ai]
---

## raw_excerpt

arXiv:2607.26754v1、2026-07-29 submitted。StatePlay は、player action に応じて映像を生成する game world model が、見た目として自然でも health、skill meter、timer、game termination といった内部状態に基づく rule を破る問題を扱う。Street Fighter 3 から frame、action、timer、両 player の health と skill meter を同期取得し、5秒・20 FPS の clip に分割する。勝敗、super art 成功、meter 不足による失敗など state-critical な四分類を各10%、通常場面を60%として、10,000 clip の training set を構成する。model は 5B visual branch と 0.76B state branch を分け、joint attention で相互に参照させる Mixture-of-Transformers 形式を採る。visual 側は flow matching、state 側は Smooth L1 regression で学習し、player action は両 branch へ入力する。評価は visual quality、action control、state alignment、mechanics fidelity の四軸で、100 samples を各 mechanics category に均等配分する。論文は state prediction の平均 normalized L1 distance が 0.06 未満、明示的 state modeling を持たない最良 baseline より mechanics fidelity が18.6%向上したと報告する。

## why_relevant_to_games

生成映像の自然さと、health・resource・終端条件の rule 整合性を分けて検証する材料であり、生成型 prototype や自動 playtest で engine state を評価軸へ残す場面に接続できる。
