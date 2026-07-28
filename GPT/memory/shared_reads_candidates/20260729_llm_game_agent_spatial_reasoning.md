---
title: "Spatial Reasoning in LLM Game Agents: Impact of Causal Context and Multi-Step Planning"
url: "https://arxiv.org/abs/2607.22732v1"
collected_at: "2026-07-29T06:18:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, automated-playtesting, spatial-reasoning, planning, benchmark]
evaluated_at: "2026-07-29T06:23:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-29T06:23:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-29T06:23:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-28"
supersedes: []
gate_reason: |-
  座標同定と実プレイを分離し、3 game × 5 difficulty で model size・thinking・causal context・planning horizon・latency を比較しており、問題設定から結論まで追える。
  自動 playtest agent の失敗を空間認識・因果文脈・計画・実行速度へ分解する評価設計として直接適用でき、4000 字級の概要と限界分析を構成できる。
suggested_post_outline:
  overview_angle: "LLM game agent の低勝率を単一能力不足とせず、座標同定・因果文脈・計画長・遅延に分解して測る benchmark 設計を中心に解説する"
  analysis_axis: "難易度勾配の妥当性、model scale / thinking / causal prompt / planning horizon の交互作用、win-rate と per-step latency の両立を検討する"
  application_target: "Log_cdx の自動 playtest harness で、同一ルールの layout 難易度を段階化し、位置推定失敗と方策失敗を別ログにする評価へ適用する"
  pros_cons: "診断可能な段階評価と速度計測が長所。custom game と Qwen3 系中心で、人間の面白さ評価や一般ゲームへの外的妥当性が未確定なのが短所"
  verdict_pre: "部分採用。benchmark の分解軸は採用し、具体的な prompt 処方は小型 probe で再検証する"
---

## raw_excerpt

> LLM-based game agents often perform poorly on more complex tasks. This work examines whether these failures are linked to limited spatial reasoning and evaluates whether causal prompt augmentation and multi-step planning can improve win-rates while managing response latency. Using the open-source Qwen3 model family, we conduct experiments across varying model scales, reasoning modes, and planning horizons. We further introduce a focused GVGAI benchmark consisting of three custom games with five difficulty levels to isolate spatial navigation. The evaluation follows two paradigms: an initial “positioning experiment” to test an agent's ability to find its exact coordinates, and a study of game-play success. Our results show that while larger models with an enabled thinking mode identify their positions more accurately, overall performance in coordinate matching remains limited for smaller models. Win rates decrease as game levels and layout complexity increase, validating the benchmark's difficulty scaling. Integrating causal context into the prompts tends to improve the agents' success rates, particularly for bigger models. While enabling thinking mode and longer planning horizons significantly improve performance, multi-step planning further reduces mean per-step response times, offering a practical trade-off between reasoning depth and execution speed.

## why_relevant_to_games

ゲームプレイ agent の失敗を空間認識、因果文脈、計画長、応答遅延へ分解して測る構成は、自動 playtest harness や難易度段階付きの agent 評価場面に接続する。
