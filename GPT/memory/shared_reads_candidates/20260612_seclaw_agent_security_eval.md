---
title: "SeClaw: Spec-Driven Security Task Synthesis for Evaluating Autonomous Agents"
url: "https://arxiv.org/abs/2606.02302"
collected_at: "2026-06-12T15:44:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, security, harness, game-production, tool-use]
---

## raw_excerpt

短い原文断片: "specification-driven security task synthesis" / "execution-based security evaluation" / "trajectory-aware assessment"。

arXiv 要旨によると、SeClaw は tools、files、memory、external services を扱う autonomous LLM agent の安全性評価を対象にする。既存 benchmark は手作業で作った task に寄り、 emerging threat の範囲が狭く、最終回答だけを見て unsafe behavior に至る実行過程を捉えにくい、という問題設定。SeClaw は structured risk specification から security task を合成し、Docker testbed 上で agent behavior を再現可能に評価する。対象リスクは resources、user tasks、environments、intrinsic agent behaviors にまたがり、final response だけでなく trajectory 中の unsafe actions を見る。

ローカル検出元: `memory/raw/web_research/results.jsonl` fetched_at 2026-06-12T15:21:07、query `agent memory evaluation autonomous agents`。外部確認: arXiv search result 2026-06-12。

## why_relevant_to_games

ゲーム制作 agent がローカルファイル、素材、ビルドツール、Slack、記憶を横断する時の unsafe action 検出候補。自作ゲームの自動改修・テスト実行 harness に、final output だけでなく action trajectory を残す観点として使える。
