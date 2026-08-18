---
title: "Controllable Game Level Generation: Assessing the Effect of Negative Examples in GAN Models"
url: "https://arxiv.org/abs/2410.23108"
collected_at: "2026-08-19T01:15:30+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [procedural-content-generation, level-generation, controllability, playability, machine-learning]
evaluated_at: "2026-08-19T01:18:45+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-19T01:18:45+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-19T01:18:45+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-18"
supersedes: []
gate_reason: >-
  正例・負例の構成、3 モデルの比較条件、Mario/Cave での定量結果、単一制約と複合制約で負例の効果が変わる理由まで抽出できる。
  PCG の失敗データを違反型別に設計し、playability と design parameter 一致を分離評価する具体的な制作判断へ接続でき、約4000字の概要へ展開できる。
suggested_post_outline:
  overview_angle: "負例を足せば制御性が上がる、ではなく、負例が表す制約違反をモデルが識別できる粒度が成否を分けるという軸で、データ生成・3モデル比較・数値結果を説明する"
  analysis_axis: "単一制約では Rumi-GAN の負例回避が一部有効だが、playability と feature 数を束ねた複合負例では違反原因が曖昧になり、制御性改善へ結びつかなかった点を分析する"
  application_target: "Log_cdx の手続き生成レベル試作で、unplayable・到達可能だが配置数違反・複数違反を別ラベル化し、playability と設計パラメータ適合率を独立した評価表へ分ける"
  pros_cons: "利点は失敗例を訓練資源に変え、生成器の評価設計まで具体化できること。欠点は対象ゲームと制約が限定的で、複合負例の原因分解なしでは制御性が改善せず、成功率も全体に低いこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

Mahsa Bazzaz と Seth Cooper は、生成器へ望ましい level だけを示すのではなく、避けるべき level も負例として与えると、playability や feature 数をどこまで制御できるかを調べた。対象は 2D tile-based の Mario segment と独自の Cave map で、constraint-based generator の Sturgeon を使い、start から end へ到達可能な playable / 到達不能な unplayable level を作る。さらに Mario では pipe 数、Cave では treasure 数を 1・2・3 の class に分けた。比較するのは、望ましい例だけで class ごとに学習する vanilla GAN、条件 label を generator と discriminator に与える CGAN、正例へ近づけ負例を避ける loss を持つ Rumi-GAN である。

playability だけを目標にした実験では、Mario の playable 率は vanilla 67.8%、Rumi 72.0%、CGAN 75.4%、Cave は順に 87.0%、89.6%、66.6% だった。playability と pipe / treasure 数の両方を同時に満たす実験では成功率が下がり、Mario の playable-correct 平均は 24.0%、18.8%、25.0%、Cave は 13.6%、13.1%、12.8% となった。論文は、負例が単一の playability 制約には役立つ場合がある一方、複数制約をまとめた負例では「どの制約に違反したか」を model が区別できず、feature 数の controllability には明確な改善が出なかったと記録する。code、training data、trained model、generated artifact も公開されている。

## why_relevant_to_games

procedural level generator の学習データを「良い例」だけでなく、unplayable・feature 数違反など失敗型別にどう構成するかを考える場面に効く。生成 level の評価を playability と design parameter の一致へ分ける実験設計として参照できる。
