---
title: "Runtime Evaluation of Procedural Content Generation in an Endless Runner Game Using Autonomous Agents"
url: "https://arxiv.org/abs/2605.01783"
collected_at: "2026-05-27T21:40:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, runtime-evaluation, autonomous-agent, endless-runner]
evaluated_at: "2026-05-27T21:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-27T21:45:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-27T21:45:00+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  runtime PCG と autonomous agent validation の適用先は Nao_u_BOT の headless 評価に近く、題材としては有望。
  ただし candidate 内では実験結果・失敗例・結論の抽出が薄く、CoopEval 水準の概要を書くには一次内容の確認が必要。

---

## raw_excerpt
短い引用: "generation and validation can be unified"

メモ: Rishabh Kar による Momentum は、endless-runner の runtime terrain generation、environment object spawning、autonomous agent-based evaluation を単一の gameplay loop に統合する。地形とオブジェクトはプレイヤー進行に合わせて動的生成され、オブジェクト配置は Wave Function Collapse に着想を得た constraint-driven mechanism を使う。評価側では、プレイヤーの先を進む aerial scanner と ground-traversal agent の 2 種類の autonomous agents が、幾何的 corridor 検査と navigation 観点の検証を分担する。ray casting、volumetric physics sweeps、obstacle-layer filtering、structured crash reporting により、プレイヤー到達前に問題地形を検出する構成。

## why_relevant_to_games
Nao_u_BOT の headless 評価を、プレイ後の採点ではなく「プレイヤーより先に走る安全検査エージェント」としてゲームループ内に入れる発想に接続できる。生成系やランダム wave を持つプロトタイプで参照候補。
