---
title: "Quality-Assured Fuzz Harness Generation via the Four Principles Framework"
url: https://arxiv.org/abs/2605.21824
collected_at: 2026-05-28T03:30:43+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [testing, harness, agent, evaluation, game-production]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。QuartetFuzz は、LLM が fuzz harness を大量生成すると、harness 自体の logic error、API misuse、lifecycle violation が false positive や未検出の原因になるという問題設定を置く。Four Principles は Logic Correctness、API Protocol Compliance、Security Boundary Respect、Entry Point Adequacy の 4 つで、生成物を fuzzing 前に generate-check-fix loop へ通す。23 の OSS project で bug report、既存 production harness 586 件の audit も報告されている。短い原文メモ: "uncontrolled quality turns scale into a liability"。

## why_relevant_to_games
headless game check や bot policy 評価を増やす時、テスト harness そのものの正しさを検査する軸として使えそう。
