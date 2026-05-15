---
title: "From LLM-Driven Trading Card Generation to Procedural Relatedness: A Pokemon Case Study"
url: https://arxiv.org/abs/2604.27972
collected_at: 2026-05-16T03:29:17+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, pcg, generative-ai, trading-card-game, personalization]
---

## raw_excerpt
arXiv:2604.27972。Johannes Pfau / Panagiotis Vrettis。2026-04-30 submitted。Trading Card Game は継続的な更新、バランス調整、ローテーション制約でエンゲージメントを維持するが、メタゲームが安定すると支配的戦略が固定化し、使えるカード選択肢が狭まり、体験が反復的になる、という問題設定。

論文は LLM と Image Diffusion Model を TCG カードの PCG に使い、単なる大量生成ではなく、プレイヤーとカードの固有のつながりを作る "procedural relatedness" を狙う。パイプラインは player-centric co-creation、fine-tuned embeddings、local LLMs、Diffusion Models を組み合わせ、動的でパーソナライズされたカードを生成する構成。

評価は 49 participants が 196 Pokemon card samples を生成し、visuals と mechanics の aesthetics / representativeness を評価し、定性的フィードバックも集めた。結果は満足度が高く、多くの参加者が prompt adjustments によって自分のアイデアを実現できた、という報告。

## why_relevant_to_games
カード・装備・スキルを「性能の差し替え」ではなく「プレイヤーが自分の意図を反映した関係性」として生成する候補。Nao_u 側では、メタ停滞を壊す PCG や、LLM生成物をプレイヤーが調整する UI の材料になる。
