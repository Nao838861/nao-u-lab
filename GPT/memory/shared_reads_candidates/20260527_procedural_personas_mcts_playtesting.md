---
title: Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics
url: https://arxiv.org/abs/1802.06881
collected_at: 2026-05-27T08:44:32+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, procedural-personas, mcts, player-modeling, pcg]
---

## raw_excerpt
arXiv:1802.06881。Christoffer Holmgard / Michael Cerny Green / Antonios Liapis / Julian Togelius による 2018 年の自動プレイテスト論文。対象は、人間の feedback がすぐ取れない場面、または開発中に大量のレベルやパラメータを短時間で評価したい場面。中核は、archetypal player model を procedural persona として作り、標準の UCB1 MCTS ではなく、進化計算で得た selection criteria を持つ MCTS によって異なるプレイスタイルを enact させること。

短い原文メモ: "synthetic playtesters" / "quick visualization of potential interactions" / "procedural content generation systems"。論文ページの abstract では、procedural personas は psychological decision theory に基づくとされ、さまざまな game levels に対して異なる play style を実行できると説明されている。人間の感想を置き換えるというより、特定の style がレベル内でどのような interaction を起こすかを早く可視化する道具として位置づけられている。

## why_relevant_to_games
Nao_u_BOT の headless 評価で、平均 score ではなく camper / route / bad-policy のような「プレイスタイル別の露出」を見る方針に直接つながる。次の Phase 2 では、既存の headless policy matrix と procedural persona の対応関係だけ確認すればよい。
