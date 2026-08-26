---
title: "Scaling Creative Writing Beyond Story-Centric Data with Attribute-Guided Genre Expansion"
url: "https://arxiv.org/abs/2608.13947v1"
collected_at: "2026-08-26T20:19:31+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm, creative-tools, dataset, evaluation]
evaluated_at: "2026-08-26T20:22:59+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-26T20:22:59+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-26T20:22:59+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-25"
supersedes: []
gate_reason: >-
  問題設定、attribute-guided expansion の中核、13ジャンル・5万例の構築、OOD／held-out genre 評価と
  genre-count ablation、結論まで抽出できる。ゲーム企画文、ルール仕様、キャラクター設計を成果物固有の
  属性で分離して生成・評価する運用へ具体化でき、限界も含めて約4000字の分析を構成できる。
suggested_post_outline:
  overview_angle: "story の量的拡張では得にくい形式遵守を、題材 seed と成果物形式の属性を分離して獲得する手法として説明する"
  analysis_axis: "genre attributes による制御、合成データの quality filtering、OOD／held-out genre と genre-count ablation が何を切り分けたか"
  application_target: "Log_cdx のゲーム企画・ルール仕様・キャラクター設計生成を、成果物別属性表と形式別評価セットに分ける小規模 probe"
  pros_cons: "少数の人手属性から形式別データを拡張できる一方、強い LLM による合成と自動 filtering の偏り、game design 固有評価の詳細不足が残る"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv 要旨からの採取メモ（日本語パラフレーズ）: 高品質な LLM 向け creative-writing data は story 中心に偏っており、異なる創作形式が要求する構造・機能・書式上の慣習へ従う能力を育てにくい。本研究は、題材の広がりと genre-form の制御を分離する attribute-guided genre expansion を提案する。人間が書いた story prompt を多様な創作 seed として使い、手作業で整理した genre attributes を組み合わせ、各形式に沿う query-response pair を強い LLM で生成して quality filtering する。この方法で story、rap、lyrics、scripts、game design、character design など13ジャンル、5万例の Multi-Genre Collection を構築した。out-of-distribution writing benchmark と、学習時に保持しておいた genre を使う診断では、この data で fine-tune した model が base model、writing-specialized baseline、既存 writing corpus で学習した model を上回ったと報告する。genre-count ablation では、story data の量だけを増やすより、明示的な attributes で複数 genre へ制御付き展開することが、未知形式を含む創作能力の頑健さに寄与したとされる。CIKM 2026 採択論文で、公開日は 2026-08-14。

## why_relevant_to_games

LLM に game design 文書や character design を作らせる際、物語 prompt の流用ではなく、成果物ごとの構造属性を明示して訓練・評価する方法の候補になる。企画、ルール仕様、キャラクター設計など形式別の生成品質を分けて検証する場面に関係する。
