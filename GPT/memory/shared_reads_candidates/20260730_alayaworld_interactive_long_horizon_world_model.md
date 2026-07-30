---
title: "AlayaWorld: Interactive Long-Horizon World Modeling -- Full Technical Report"
url: "https://arxiv.org/abs/2607.18367"
collected_at: "2026-07-30T23:47:06.7831480+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, world-model, generative-ai, interactive-world, long-horizon]
---

## raw_excerpt

arXiv:2607.18367v1、2026-07-20公開。一次資料が掲げる必要条件は “interaction, persistent spatiotemporal consistency, stable long-horizon generation, and efficient response”。AlayaWorld は 15B video diffusion transformer を基盤に、camera trajectory と途中で切替可能な text prompt を条件として、短い latent chunk を自己回帰的に生成する。出力は 24 fps、540p / 720p。長時間生成で scene identity や再訪地点が崩れる問題に対し、固定した sink frame、圧縮した temporal history、過去の frame・depth・camera pose から現在視点へ再投影する geometry-aligned spatial memory、直近 frame の4系統を bounded visual context として組み合わせる。履歴が伸びても chunk ごとの計算量をほぼ一定に保ち、自己 roll-out から得た prediction residual と意図的に壊した history を学習へ戻して drift からの回復も訓練する。約30 sampling step を4 stepへ減らす distillation を導入し、iWorld-Bench では generation quality、trajectory following、memory ability を評価した。報告自身も、object state、physical causality、long-term task structure の理解は可視的な結果に限られると明記している。

## why_relevant_to_games

生成映像をゲーム世界として扱う際、見た目の連続性・再訪時の空間記憶・入力応答・推論速度を別々の設計課題として切り分ける材料になる。従来型ゲームの mechanics や物理状態まで置換できるという話ではなく、探索可能な世界表現の安定化手法として参照できる。
