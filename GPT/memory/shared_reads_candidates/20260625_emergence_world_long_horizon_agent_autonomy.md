---
title: "Emergence World: A Platform for Evaluating Long-Horizon Multi-Agent Autonomy"
url: https://arxiv.org/abs/2606.08367
collected_at: 2026-06-25T13:29:30+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [multi-agent, simulation, llm-agent, long-horizon, evaluation, game-systems]
evaluated_at: "2026-06-25T13:32:13+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-25T13:32:13+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-25T13:32:13+09:00"
next_action: keep_for_reference
stale_after: "2026-07-25"
supersedes: []
gate_reason: |-
  長期 multi-agent world、governance、collapse 観測という問題設定はゲーム制作に接続できるが、過去候補で複数回 postponed / failed 判定済み。
  今回も metrics、governance mechanism、失敗ログの具体例が不足し、4000字概要に必要な評価の中身と制作 probe への落とし込みが足りないため fail とする。
---

## raw_excerpt
Emergence World は、LLM agent 評価を短い試験型タスクではなく、長期間動く shared spatial world として扱うためのプラットフォーム。論文の問題設定は、数分から数時間の clean environment では behavioral drift、governance、異なる model family 間の cross-influence が見えにくいというもの。プラットフォームは、ライブ外部データに接続された共有世界、120以上の specialized tools、3種類の persistent memory systems、民主的な統治メカニズムを備え、異なるベンダーのモデルを同じ世界で走らせる。

例示として、15日間の cross-vendor study が報告されている。同じ役割と初期条件でも、モデル構成によって安定した deliberative governance から population collapse まで結果が分かれた、という概要。短い原文フレーズとしては "continuously running multi-agent simulation platform"、"shared spatial world"、"behavioral drift" が中心。

## why_relevant_to_games
NPC集団、街シミュレーション、AI同士の長期プレイログ評価で、単発スコアではなく時間経過・統治・崩壊パターンを観測する候補として使える。
