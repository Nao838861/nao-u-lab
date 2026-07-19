---
title: "Application of machine learning to monster level prediction in tabletop RPG game design"
url: "https://arxiv.org/abs/2607.09196"
collected_at: "2026-07-19T17:01:45+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, balance, ttrpg, machine-learning, explainability]
---

## raw_excerpt

arXiv の要旨では、Pathfinder Second Edition の公開データから、TTRPG のモンスターが持つ多数の数値属性を入力し、その強さを表す順序尺度の level を予測する問題を扱う。著者らは、通常の回帰と丸め処理、表形式データ向けの ordinal regression、ordinal-aware loss を使う neural network を比較する。制作現場で過去データから将来のモンスターを調整する状況に近づけるため、無作為分割だけでなく chronological protocol と expanding-window protocol を採用し、複数の指標で評価する。要旨上では tree-based ensemble が線形モデルと neural approach を上回り、ordinal ranking と level 予測で高い精度を示したとされる。feature importance と error distribution を使った説明では、モデルがゲームルールに由来する、人間の設計直感と整合した属性パターンを捉えていると報告される。論文は、予測器をデザイナー判断の代替ではなく、モンスター調整を補助する computer-aided tool と位置づけている。

## why_relevant_to_games

敵の強さを単一スコアで決めず、既存データから順序尺度を予測し、誤差と寄与属性を設計者へ返すバランス支援の事例として参照できる。時系列分割は、後発コンテンツへの汎化を検証する際にも使える。
