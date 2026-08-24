---
title: "REDAgentBench: Executable Red Teaming and Faithful Measurement of LLM Agent Systems"
url: "https://arxiv.org/abs/2608.10669v1"
collected_at: "2026-08-25T08:48:47+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, evaluation, automated-testing, harness, safety]
---

## raw_excerpt

LLM agent の安全評価を単一の attack success rate に畳むと、攻撃への露出、実際の実行、観測可能な証拠、最終判定が混ざり、違反そのものと証拠の見え方を取り違えるという問題を扱う。REDAgentBench は、明示された safety constraint と agent-system vulnerability から攻撃を導出し、隔離した service sandbox で実行し、service receipt と final-state change から有害な作用を確認する executable framework。5 種の service surface に 1,661 case を収録し、6 model・3 harness の比較では macro-average ASR 65.69% を報告する一方、表示する evidence view や harness によって ASR が変わる。state-grounded cohort では、action anchor を特定できた確認済み違反のおよそ5件に1件が、agent 自身が関連 constraint や risk を述べた後に発生し、Recognition--Execution Gap と呼ばれている。training-free の policy reminder を matched replay に入れると、確認済み違反が70 percentage point 超減ったと要旨は報告する。

## why_relevant_to_games

AI playtester や自動 game agent の評価を、発言・action log・game state・判定に分解し、実際の状態変化を証拠にする headless harness 設計へ接続できる。
