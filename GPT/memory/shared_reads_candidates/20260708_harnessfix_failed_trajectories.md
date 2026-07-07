---
title: "From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws"
url: "https://arxiv.org/abs/2606.06324"
collected_at: "2026-07-08T03:29:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, harness, debugging, evaluation, playtest, tooling]
---

## raw_excerpt
arXiv の要旨では、LLM agent は base model だけでなく、実行環境、tool interface、context、lifecycle orchestration、observability、verification、governance などを含む agent harness に依存している、と置かれている。既存の self-improving agent や harness evolution は最終 outcome から prompt や workflow を動かしがちだが、失敗 trajectory のどこに責任証拠があり、どの harness 実装機構が不安定さを作ったかを狭く診断しにくい。HarnessFix は raw execution trace と harness artifact を Harness-aware Trace Intermediate Representation にまとめ、step-level の data-flow / control-flow と artifact の対応を取り、失敗を responsible step と harness artifact に帰属させる。そこから recurring diagnosis を flaw record にし、repair operator と regression-aware validation へ接続する。

短い原文フレーズ: "trace-grounded", "diagnosis-driven"

## why_relevant_to_games
AI テストプレイヤーや自動実装 agent の失敗を、単なる「モデルが悪い」ではなく、観測・入力・検証・ログ設計のどこで壊れたかに分解する材料になる。
