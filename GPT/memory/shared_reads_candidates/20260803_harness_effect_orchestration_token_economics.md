---
title: "The Harness Effect: How Orchestration Design Sets the Token Economics of Enterprise Agentic AI"
url: "https://arxiv.org/abs/2607.06906"
collected_at: "2026-08-03T16:15:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-harness, evaluation, game-production, automation, observability]
evaluated_at: "2026-08-03T16:18:44+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-03T16:25:15+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785741899888319"
next_action: none
stale_after: "2026-09-02"
supersedes: []
posted:
  ts: "1785741899.888319"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785741899888319"
  char_count: 4459
  posted_at: "2026-08-03T16:25:15+09:00"
gate_reason: >-
  token maxing という問題設定、model を固定した harness 差し替え、22 task・6 model の比較、
  cost・wall-clock・token・quality の結論まで抽出できる。固定 game task 上で context、tool、
  cache、失敗継続条件だけを変える比較へ具体適用でき、限界も含め約4000字の概要を構成できる。
suggested_post_outline:
  overview_angle: "model 能力と orchestration 能力を分離し、harness が品質を保ったまま token economics を変える仕組みと実測を整理する"
  analysis_axis: "固定 model の対照比較としての強みと、22 task の代表性・quality 指標・開発元による評価という外的妥当性の限界を分けて検討する"
  application_target: "Log_cdx の反復実装と headless playtest で固定 game task を用意し、context 編成、tool 公開、cache shape、失敗打切りだけを差し替えて tokens/task・wall-clock・成功率を測る"
  pros_cons: "利点は model 交換以外の改善レバーを計測可能にすること。欠点は enterprise task の改善率をゲーム制作へ数値のまま外挿できず、品質差の統計的確度も確認が必要なこと"
  verdict_pre: "部分採用 — harness 単位の A/B 比較と failure-spend 計測を採り、報告された削減率は仮説として再検証する"
---

## raw_excerpt

arXiv:2607.06906、2026-07-08 submitted。論文は agentic AI の能力向上を、長い reasoning trace、turn 数、tool payload、再投入 context を増やす「token maxing」だけで賄うと、task の価値より token 消費が速く増えるという問題から始める。要旨中の短い原文は “the decisive lever against token maxing is the harness”。ここで harness は context の組立て、tool 公開、turn の順序付け、delegation、observability、governance を担う orchestration layer を指す。実験では 22 の固定 evaluation task と 6 foundation model を使い、model は固定したまま conventional production loop と Writer Agent Harness を入れ替えた。報告値では blended cost / task が 0.21 ドルから 0.12 ドルへ 41%減、median wall-clock が 48 秒から 27 秒へ 44%減、tokens / task が 14.2k から 8.8k へ 38%減となり、task-completion quality は 0.78 から 0.81 で同等水準だった。全 model で cost は 33～61%下がり、quality gain は baseline model strength と強く相関したとする。論文は cache-shape discipline から failure-spend governance まで六つの mechanism family を整理し、prompt caching を含む orchestration layer の token economics を定式化している。

## why_relevant_to_games

ゲーム制作 agent の反復実装・headless playtest・ログ再投入で、model 交換以外に context、tool、失敗継続条件を計測対象へ分解する素材になる。固定 game task 上で harness だけを差し替える比較設計にもつながる。
