---
title: "SeClaw: Spec-Driven Security Task Synthesis for Evaluating Autonomous Agents"
url: "https://arxiv.org/abs/2606.02302"
collected_at: "2026-06-12T15:44:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, security, harness, game-production, tool-use]
evaluated_at: "2026-06-12T15:49:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781247403.366579"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781247403366579"
  char_count: 4500
  posted_at: "2026-06-12T16:16:43+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-12T16:16:43+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781247403366579"
next_action: none
stale_after: "2026-07-12"
supersedes: []
gate_reason: |-
  問題設定、risk specification からの task 合成、Docker testbed、trajectory-aware assessment まで手法の骨格が明確。
  ゲーム制作 agent が files、tools、memory、Slack を横断する現行環境にそのまま評価観点を移せる。
  #shared-reads の概要では final output 評価から実行過程評価へ移す価値を具体化できる。
suggested_post_outline:
  overview_angle: "autonomous agent の安全性評価を、手作り task ではなく risk specification と実行軌跡で再現可能にする枠組みとして紹介する。"
  analysis_axis: "既存 benchmark の弱点、risk specification の分解軸、task synthesis、Docker testbed、final response と trajectory の両評価を順に見る。"
  application_target: "ゲーム制作 agent の自動改修、素材操作、ビルド実行、Slack 連携、memory 更新に対する unsafe action 検出 harness。"
  pros_cons: "メリットは agent 行動の過程を検査できる点と emerging risk を仕様から増やせる点。デメリットは security task 設計と sandbox 維持の負荷。"
  verdict_pre: "部分採用。まずは game/ 自動改修時の危険 action rubric と trajectory log の評価 probe に落とす。"
---

## raw_excerpt

短い原文断片: "specification-driven security task synthesis" / "execution-based security evaluation" / "trajectory-aware assessment"。

arXiv 要旨によると、SeClaw は tools、files、memory、external services を扱う autonomous LLM agent の安全性評価を対象にする。既存 benchmark は手作業で作った task に寄り、 emerging threat の範囲が狭く、最終回答だけを見て unsafe behavior に至る実行過程を捉えにくい、という問題設定。SeClaw は structured risk specification から security task を合成し、Docker testbed 上で agent behavior を再現可能に評価する。対象リスクは resources、user tasks、environments、intrinsic agent behaviors にまたがり、final response だけでなく trajectory 中の unsafe actions を見る。

ローカル検出元: `memory/raw/web_research/results.jsonl` fetched_at 2026-06-12T15:21:07、query `agent memory evaluation autonomous agents`。外部確認: arXiv search result 2026-06-12。

## why_relevant_to_games

ゲーム制作 agent がローカルファイル、素材、ビルドツール、Slack、記憶を横断する時の unsafe action 検出候補。自作ゲームの自動改修・テスト実行 harness に、final output だけでなく action trajectory を残す観点として使える。
