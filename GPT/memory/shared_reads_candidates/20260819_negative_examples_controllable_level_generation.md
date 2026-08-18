---
title: "Controllable Game Level Generation: Assessing the Effect of Negative Examples in GAN Models"
url: "https://arxiv.org/abs/2410.23108"
collected_at: "2026-08-19T01:15:30+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [procedural-content-generation, level-generation, controllability, playability, machine-learning]
---

## raw_excerpt

Mahsa Bazzaz と Seth Cooper は、生成器へ望ましい level だけを示すのではなく、避けるべき level も負例として与えると、playability や feature 数をどこまで制御できるかを調べた。対象は 2D tile-based の Mario segment と独自の Cave map で、constraint-based generator の Sturgeon を使い、start から end へ到達可能な playable / 到達不能な unplayable level を作る。さらに Mario では pipe 数、Cave では treasure 数を 1・2・3 の class に分けた。比較するのは、望ましい例だけで class ごとに学習する vanilla GAN、条件 label を generator と discriminator に与える CGAN、正例へ近づけ負例を避ける loss を持つ Rumi-GAN である。

playability だけを目標にした実験では、Mario の playable 率は vanilla 67.8%、Rumi 72.0%、CGAN 75.4%、Cave は順に 87.0%、89.6%、66.6% だった。playability と pipe / treasure 数の両方を同時に満たす実験では成功率が下がり、Mario の playable-correct 平均は 24.0%、18.8%、25.0%、Cave は 13.6%、13.1%、12.8% となった。論文は、負例が単一の playability 制約には役立つ場合がある一方、複数制約をまとめた負例では「どの制約に違反したか」を model が区別できず、feature 数の controllability には明確な改善が出なかったと記録する。code、training data、trained model、generated artifact も公開されている。

## why_relevant_to_games

procedural level generator の学習データを「良い例」だけでなく、unplayable・feature 数違反など失敗型別にどう構成するかを考える場面に効く。生成 level の評価を playability と design parameter の一致へ分ける実験設計として参照できる。
