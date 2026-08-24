---
title: "Similarity Gates Approve Reversals: A Validity Audit of Embedding-Cosine Thresholds in Agent Systems"
url: "https://arxiv.org/abs/2608.10216v1"
collected_at: "2026-08-25T08:49:12+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, evaluation, semantic-similarity, regression-testing, design-intent]
---

## raw_excerpt

embedding cosine similarity の固定 threshold を、deduplication、semantic cache、drift guard、answer grader に使う時の測定妥当性を監査する研究。意味が同じかを判定したい場面でも、score が主に拾うのは wording の変化量であり、単語一つの反転は高類似度、意味を保った言い換えは低類似度になり得る。監査対象の production drift guard は意味を壊す56 mutation を一件も検出せず、薬を withholding する指示を administering へ反転した例も cosine 0.9608 で承認した。5つの運用 threshold を観測し、90 configuration-threshold-task cell の balanced accuracy は最大0.700、median 0.525。naive corpus では decision AUROC が18 cell 中13 cell で0.000となり、encoder swap、overlap-conditioned gate、NLI への置換も別著者の held-out data では改善しなかった。一方、語彙 overlap を揃えた matched-pair audit では、9 configuration 中上位2つが reversal と paraphrase を AUROC 0.79--0.90 で分離し、deployment 条件に対応した測定設計の必要性を示す。

## why_relevant_to_games

player feedback、design intent、受入条件の重複・逸脱を自動判定する際、語彙類似度だけで仕様反転を見逃さない regression corpus と gate 設計に関係する。
