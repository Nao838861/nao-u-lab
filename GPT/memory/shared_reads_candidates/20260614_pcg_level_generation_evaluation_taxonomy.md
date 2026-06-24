---
title: "On the Evaluation of Procedural Level Generation Systems"
url: "https://arxiv.org/abs/2404.18657"
collected_at: "2026-06-14T08:23:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, level-design, evaluation, research]
evaluated_at: "2026-06-14T08:31:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781392123.393539"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781392123393539"
  char_count: 4476
  posted_at: "2026-06-14T08:08:55+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-14T08:08:55+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781392123393539"
next_action: none
stale_after: "2026-07-14"
supersedes: []
gate_reason: "PCG level generation の評価手法を taxonomy と survey で整理しており、問題設定・手法の中核・現行 practice の弱点・改善提案が抽出できる。Nao_u_BOT の生成評価が headless score に偏るリスクへの具体的な評価設計として使えるため、CoopEval 水準の概要に展開可能。"
suggested_post_outline:
  overview_angle: "procedural level generation の評価がなぜ合意困難なのかを起点に、評価 taxonomy と近年研究 survey から弱点と対策を整理する"
  analysis_axis: "評価対象、評価手法、再利用性、generalizable な比較可能性、evaluation-free system description への警告"
  application_target: "自動生成レベルやゲーム試作の評価を、単一スコアではなく多軸の evidence package に分解する Phase 3b/4a の評価設計"
  pros_cons: "メリットは生成評価の見落としを体系化できる点。デメリットは論文 taxonomy を小規模プロトタイプへ落とす際に運用負荷が増える点"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2404.18657。Oliver Withington、Michael Cook、Laurissa Tokarchuk による FDG 2024 論文。論文の問題設定は、procedural level generation の評価が「複雑で contested」であり、既存研究同士を比較できる robust / generalisable / widely accepted な評価方法への合意がまだ弱い、というもの。著者らは、新しい生成器の良し悪しを単一スコアで測る前に、どの評価アプローチがあり、研究者がそれをどう使っているかを構造化して見る必要があると置く。

本文の要旨では、まず PCG evaluation approaches の taxonomy を作り、その taxonomy を使って近年の procedural level generation 研究を survey する。結果として、現行 practice の弱点を挙げ、対策として evaluation free system descriptions の適切な利用、diverse research frameworks の開発、code と methodology の再利用促進を提案している。短い原文片: "consensus on how to evaluate novel systems is currently limited."

## why_relevant_to_games

Nao_u_BOT の自動評価が headless score や pass/fail に寄りすぎる時、PCG/level design の評価を分類し直す参照になる。生成器評価、プロトタイプ比較、評価不能な段階の記述方法を Phase 2 で検討できる。
