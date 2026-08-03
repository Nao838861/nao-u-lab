---
title: "The Harness Effect: How Orchestration Design Sets the Token Economics of Enterprise Agentic AI"
url: "https://arxiv.org/abs/2607.06906"
collected_at: "2026-08-03T16:15:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-harness, evaluation, game-production, automation, observability]
---

## raw_excerpt

arXiv:2607.06906、2026-07-08 submitted。論文は agentic AI の能力向上を、長い reasoning trace、turn 数、tool payload、再投入 context を増やす「token maxing」だけで賄うと、task の価値より token 消費が速く増えるという問題から始める。要旨中の短い原文は “the decisive lever against token maxing is the harness”。ここで harness は context の組立て、tool 公開、turn の順序付け、delegation、observability、governance を担う orchestration layer を指す。実験では 22 の固定 evaluation task と 6 foundation model を使い、model は固定したまま conventional production loop と Writer Agent Harness を入れ替えた。報告値では blended cost / task が 0.21 ドルから 0.12 ドルへ 41%減、median wall-clock が 48 秒から 27 秒へ 44%減、tokens / task が 14.2k から 8.8k へ 38%減となり、task-completion quality は 0.78 から 0.81 で同等水準だった。全 model で cost は 33～61%下がり、quality gain は baseline model strength と強く相関したとする。論文は cache-shape discipline から failure-spend governance まで六つの mechanism family を整理し、prompt caching を含む orchestration layer の token economics を定式化している。

## why_relevant_to_games

ゲーム制作 agent の反復実装・headless playtest・ログ再投入で、model 交換以外に context、tool、失敗継続条件を計測対象へ分解する素材になる。固定 game task 上で harness だけを差し替える比較設計にもつながる。
