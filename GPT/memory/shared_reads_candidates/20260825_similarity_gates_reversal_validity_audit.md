---
title: "Similarity Gates Approve Reversals: A Validity Audit of Embedding-Cosine Thresholds in Agent Systems"
url: "https://arxiv.org/abs/2608.10216v1"
collected_at: "2026-08-25T08:49:12+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, evaluation, semantic-similarity, regression-testing, design-intent]
evaluated_at: "2026-08-25T08:53:01.7891158+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-25T08:53:01.7891158+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-25T08:53:01.7891158+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-24"
supersedes: []
gate_reason: >-
  類似度 gate の構成概念妥当性を、反転 mutation、naive corpus、overlap-matched pair、held-out data で検証しており、
  design intent と受入条件の回帰監査へ無理なく適用できる。数値結果と失敗した代替策もあり、約4000字の批判的概要が成立する。
suggested_post_outline:
  overview_angle: "『意味が同じ』を測るはずの cosine threshold が、語彙変化量を測って反転を通す測定不整合"
  analysis_axis: "construct validity、反転/paraphrase の対照設計、overlap 条件統制、configuration 間の非一般化"
  application_target: "ゲーム仕様・design intent・player feedback・生成アセット受入条件の変更で、否定や量的条件の反転を検出する matched-pair regression corpus"
  pros_cons: "安価な類似度 gate の盲点を再現可能に監査できる一方、対象 task ごとの corpus 作成が必要で、単一 encoder や NLI への置換では一般解にならない"
  verdict_pre: "部分採用"
---

## raw_excerpt

embedding cosine similarity の固定 threshold を、deduplication、semantic cache、drift guard、answer grader に使う時の測定妥当性を監査する研究。意味が同じかを判定したい場面でも、score が主に拾うのは wording の変化量であり、単語一つの反転は高類似度、意味を保った言い換えは低類似度になり得る。監査対象の production drift guard は意味を壊す56 mutation を一件も検出せず、薬を withholding する指示を administering へ反転した例も cosine 0.9608 で承認した。5つの運用 threshold を観測し、90 configuration-threshold-task cell の balanced accuracy は最大0.700、median 0.525。naive corpus では decision AUROC が18 cell 中13 cell で0.000となり、encoder swap、overlap-conditioned gate、NLI への置換も別著者の held-out data では改善しなかった。一方、語彙 overlap を揃えた matched-pair audit では、9 configuration 中上位2つが reversal と paraphrase を AUROC 0.79--0.90 で分離し、deployment 条件に対応した測定設計の必要性を示す。

## why_relevant_to_games

player feedback、design intent、受入条件の重複・逸脱を自動判定する際、語彙類似度だけで仕様反転を見逃さない regression corpus と gate 設計に関係する。
