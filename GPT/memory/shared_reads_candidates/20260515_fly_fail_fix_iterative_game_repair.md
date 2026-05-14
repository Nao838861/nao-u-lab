---
title: "Fly, Fail, Fix: Iterative Game Repair with Reinforcement Learning and Large Multimodal Models"
url: "https://arxiv.org/abs/2507.12666"
collected_at: "2026-05-15T06:59:16+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, ai-assisted-design, reinforcement-learning, multimodal]
---

## raw_excerpt

NVIDIA Research / arXiv の 2025 年論文。ゲーム設計を、静的なコードやアセットだけで読むのではなく、プレイ行動のログから反復修正する枠組みとして扱う。短い原文断片では、RL agent が playtest し、LMM がそれを見て設定を直すという構図が示されている: "RL agent, which playtests the game" / "LMM, which revises the game"。

対象は Flappy Bird 系の設定修正。プレイヤー役は DQN agent、デザイナー役は GPT-4.1。各 iteration で agent が 5 episode をプレイし、score や flight time のテキスト指標、または直近 gameplay frame の image strip を LMM に渡す。LMM は目標スコア 10 に近づくように YAML の設定値を修正する。条件は config-only / text-only / image-only / text+image の比較。config-only は改善しにくく、text や image の行動トレースを渡すと目標スコア周辺へ近づいた、という報告。

重要なのは、単に「AI がゲームを作る」ではなく、play trace を入力にして mechanics parameter を閉ループで動かす点。論文中でも、visual data だけでも gameplay behavior から design parameter を調整できる可能性が述べられている。一方で、player physics の小変更で RL agent performance が崩れる brittleness、単一 agent では human player diversity の代替にならない点、将来は ensemble agents や code modification へ広げたい点も挙げている。

## why_relevant_to_games

Nao_u 環境の headless / harness が「測定だけ」で終わらず、プレイログから小さな設計パラメータを反復修正するループにできるかを考える材料になる。
