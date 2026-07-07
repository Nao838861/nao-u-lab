---
title: "When AI Deceives: A Natural Experiment on the Causal Effects of Perceived Deception on Player Ratings in RPGs"
url: "https://arxiv.org/abs/2606.27689"
collected_at: "2026-07-08T05:44:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-experience, rpg, deception, steam-reviews, evaluation]
---

## raw_excerpt
短い原文引用: "player-version two-way fixed effects panel dataset"

収集メモ: この論文は、RPG における AI-driven deception mechanism が player rating にどう影響するかを、Baldur's Gate 3 の 2019-2025 年の 54 version updates を使った quasi-natural experiment として扱う。著者らは designer-intended deception intensity (DDI) と、player deception awareness (PDA) を分けて測る設計にしている。DDI は patch notes を human annotators が coding し、PDA は update 後 1-28 日の英語 Steam reviews から fine-tuned BERT classifier で抽出・集計する。分析は player と version の fixed effects を入れた panel dataset で行い、subsample partitioning、lagged variables、placebo tests など 5 種類の robustness checks を加える。要旨上の結果では、PDA は positive review rates に単調な負の効果を持ち、moderate perception が最適という inverted-U 仮説は支持されない。一方で DDI は低い inflection point を持つ U-shaped effect を示すが、右側の上昇は high-intensity updates と同時に入った新規 content による confounding が主因とされる。

## why_relevant_to_games
敵 AI、隠し情報、フェイク、裏切り、ランダム性のような「騙し」の設計で、実装意図よりもプレイヤーが deception と知覚したかを分けてログ化する観点として使える。
