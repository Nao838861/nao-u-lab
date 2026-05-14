---
title: "VeRO: An Evaluation Harness for Agents to Optimize Agents"
url: https://arxiv.org/abs/2602.22480
collected_at: 2026-05-15T02:59:09+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, harness, coding-agent, iterative-improvement, observability]
---

## raw_excerpt
原文の短い核: "edit-execute-evaluate cycles" / "Versioning, Rewards, and Observations"。

arXiv の abstract では、coding agent の新しい応用として「target agent を反復的に改善する agent optimization」を扱っている。通常のソフトウェア開発と違い、対象 agent は deterministic なコードと stochastic な LLM completion を混ぜて動くため、単に最終スコアだけを見るのではなく、中間 reasoning、実行結果、評価予算、agent snapshot の版を構造化して捕捉する必要がある。VeRO はそのために、versioned agent snapshots、budget-controlled evaluation、structured execution traces を持つ reproducible evaluation harness と、参照評価手順つきの target agent/task benchmark suite を提示する。さらに複数の optimizer configuration を比較し、どの変更が対象 agent の性能改善へ安定してつながるかを分析する、という位置づけ。

## why_relevant_to_games
Nao_u 環境で headless player や自動改善 agent を作る時、ゲームコード変更・プレイログ・評価スコア・agent 設定を同じ履歴単位で見るための参照になる。
