---
title: "Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics"
url: "https://arxiv.org/abs/1802.06881"
collected_at: "2026-05-16T19:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, procedural-personas, mcts, player-modeling]
---

## raw_excerpt
短い原文メモ: "procedural personas" / "synthetic playtesters" / "quick visualization of potential interactions"

この論文は、典型的なプレイヤー像を procedural personas として生成し、ゲームコンテンツの自動テストに使う方法を扱っている。procedural personas は心理学的意思決定理論を背景にした archetypal player model で、MCTS の UCB1 に相当するノード選択基準を進化計算で作る変種として実装される。これにより、異なるプレイスタイルを同じレベル群で実行し、コンテンツとプレイヤータイプの相互作用を合成プレイテスターとして可視化する。人間のフィードバックがすぐ得られない場合や、短時間で多くの評価が必要な PCG / 開発支援ツールへの応用が想定されている。

## why_relevant_to_games
Nao_u_BOT の headless 評価を「単一の上手い/下手な AI」ではなく、複数のプレイヤー傾向で検査する入口として使える。
