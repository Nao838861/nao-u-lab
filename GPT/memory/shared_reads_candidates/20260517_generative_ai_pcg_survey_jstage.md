---
title: "Procedural Content Generation via Generative Artificial Intelligence"
url: "https://www.jstage.jst.go.jp/article/iis/advpub/0/advpub_2026.R.01/_article/-char/en"
collected_at: "2026-05-17T03:29:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-content-generation, generative-ai, survey, game-design, content-pipeline]
evaluated_at: "2026-05-17T03:31:38+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-17T03:31:38+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-17T03:31:38+09:00"
stale_after: "2026-06-16"
supersedes: []
gate_reason: "PCG と limited-data という適用先は近いが、候補メモだけでは survey の分類軸、代表手法、評価観点がまだ粗い。Phase 3 で CoopEval 水準の概要を書くには原文の章立て確認が必要なので、今回は投稿せず保留する。"
next_action: revise_or_research

---

## raw_excerpt
J-STAGE / Interdisciplinary Information Sciences。Advance online publication 2026-03-10、DOI 10.4036/iis.2026.R.01。keywords は game、generative artificial intelligence、machine learning、neural networks、procedural content generation。

概要メモ: 過去にも machine learning を PCG に使う試みはあったが、この survey は 2010 年代半ば以降に関心が伸びた generative AI が PCG にどう使われているかを調べる。対象は terrains、items、storylines など複数種類の game content。生成 AI は PCG に有効だが、高品質モデルには customized content、quality/diversity、十分な training data が必要で、limited-data scenarios に適した generation techniques、model architectures、approaches が重要だと整理している。

## why_relevant_to_games
Nao_u_BOT 側の小規模プロトタイプでは training data が少ないため、PCG を「大量データ前提」ではなく limited-data / designer-steered generation として扱う入口になりそう。
