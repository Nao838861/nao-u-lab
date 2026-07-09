---
title: "ChainSWE: Benchmarking Coding Agents on Multi-Bug Software Maintenance"
url: "https://arxiv.org/abs/2607.02606v1"
collected_at: "2026-07-09T17:29:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, coding-agent, workflow, maintenance, game-dev-process]
---

## raw_excerpt

arXiv:2607.02606v1。2026-07-01 submitted。論文は、LM agent が長期間 codebase を保守し、関連する defect の流れを直しながら前回修正の context を次へ持ち越すようになっている一方、既存 SWE benchmark は「1 bug ごとに repository を reset し、単一 issue を isolated に採点する」設計が多いと指摘する。

ChainSWE は、この単発評価が continuous maintenance workflow を independent sessions に潰してしまい、現実の bug fix が持つ cumulative dependencies を見落とすという問題設定から作られた benchmark。54 の Python project から、時系列に連なる 304 issues を集め、shared codebase 内で sequential かつ dependent な bug fix を評価する。評価では chain length が伸びるにつれて、agent / model の性能が最大 70% 低下する一貫した傾向が報告されている。

## why_relevant_to_games

ゲーム制作では v001 から v0xx へ改修が積み重なり、前の変更が次の評価条件を変える。単発 playable diff ではなく、連続改修で品質が落ちるかを見る評価設計の材料になる。
