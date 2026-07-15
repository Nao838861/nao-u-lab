---
title: On the Evaluation of Procedural Level Generation Systems
url: https://arxiv.org/abs/2404.18657
collected_at: 2026-07-15T15:00:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-content-generation, level-design, evaluation, survey]
evaluated_at: 2026-07-15T14:46:09+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-07-15T14:46:09+09:00
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-15T14:46:09+09:00"
next_action: revise_or_research
stale_after: "2026-08-14"
supersedes: []
gate_reason: >-
  PCG 評価法を taxonomy と実態調査で整理する問題設定は重要で、生成レベルの自動評価設計へ直接適用できる。
  ただし現候補は分類軸、調査対象、評価手法の分布、具体的な弱点と根拠が不足し、CoopEval 水準の約4000字概要を検証可能な密度で構成できない。
---

## raw_excerpt

手続き型コンテンツ生成（PCG）によるゲームレベルの評価は複雑で、研究上も見解が分かれている。新しいPCGシステムを過去研究と比較するには、堅牢で一般化可能かつ広く受け入れられた評価手法が望ましいものの、現状では合意が限られている。著者らは、手続き型レベル生成システムをどのように評価できるか、また研究者が実際にそれらの技法をどう使っているかを構造的に分析する必要があると論じる。研究ではまずPCG評価手法の新しいタクソノミーを構築し、その枠組みを通して近年の研究を調査した。調査結果は現行実務の複数の弱点を示し、適切な場合には評価を伴わないシステム記述を認めること、多様な研究フレームワークの開発を促すこと、コードと方法論の再利用を進めることによって、その弱点を大幅に緩和できる可能性を示している。

## why_relevant_to_games

自動生成レベルや生成メカニクスを試作した際、playability・多様性・比較可能性を何で測るかを設計する場面に効く。既存のheadless評価や複数bot policyを、PCG研究の評価分類と照合する入口になる。
