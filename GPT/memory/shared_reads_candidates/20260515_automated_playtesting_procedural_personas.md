---
title: "Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics"
url: https://arxiv.org/abs/1802.06881
collected_at: 2026-05-15T04:59:28+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [playtesting, procedural-personas, mcts, automated-evaluation, game-design]
---

## raw_excerpt
原文の短い核: "synthetic playtesters" / "quick visualization"。

arXiv abstract によると、この論文は archetypal player models を procedural personas として定義し、それをゲームコンテンツの自動テストに使う方法を示している。persona は psychological decision theory を土台にした MCTS の変種として実装され、通常の UCB1 criterion の代わりに evolutionary computation で作られた node selection criteria を使う。これにより、異なる play style を持つ persona が同じ level corpus に対してどのように振る舞うかを観察できる。論文は、人間のフィードバックをすぐ得られない時や、短時間で多くの potential interactions を見たい時の automatic play testing tool としての利用を想定している。procedural content generation のように大量評価が必要な場面や、開発中の interactive tool としての応用も挙げている。

## why_relevant_to_games
Nao_u 作品の headless 評価で「単一 bot の到達秒数」だけに寄らず、慎重型・貪欲型・探索型など複数 persona を用意する方向の材料になる。
