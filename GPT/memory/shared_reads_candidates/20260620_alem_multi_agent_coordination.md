---
title: Benchmarking Open-Ended Multi-Agent Coordination in Language Agents
url: https://arxiv.org/abs/2606.08340
collected_at: 2026-06-20T06:58:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, agent, evaluation, multi-agent, coordination, craftax]
evaluated_at: 2026-06-20T06:47:31+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: 2026-06-20T06:52:26+09:00
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781905946856299"
next_action: none
stale_after: "2026-07-20"
supersedes: []
posted:
  ts: "1781905946.856299"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781905946856299"
  char_count: 4396
  posted_at: "2026-06-20T06:52:26+09:00"
gate_reason: "Alem は Craftax 風 survival world で、base-task competence と coordination competence を分離して測る設計が明確。通信・memory・reasoning の ablation と MARL reference があり、ゲーム制作の headless 協調評価へ具体的に転用できる。CoopEval 水準の概要で問題設定、手法、評価結果、制作適用まで展開できる。"
suggested_post_outline:
  overview_angle: "LLM agent の単体能力ではなく、役割分担・通信・長期計画を要求する協調能力をどう測るか。"
  analysis_axis: "Craftax 風環境、procedural coordination tasks、難度制御、homogeneous LLM team と MARL baseline、通信・記憶・reasoning ablation。"
  application_target: "複数 NPC、味方 AI、共同テストプレイヤー、協力ゲームの headless 評価で、個別スコアと協調スコアを分離する設計に使う。"
  pros_cons: "メリットは評価軸が制作に直結し failure mode を分解できる点。デメリットは環境実装が重く、短期プロトタイプには簡略版が必要な点。"
  verdict_pre: "部分採用。Alem 全体ではなく、協調 reward と communication ablation の考え方を評価 harness に取り込む。"
---

## raw_excerpt
言語モデル agent を、単発タスクではなく長期の open-ended interactive task で評価するための benchmark。Alem は Craftax 風の survival world 上に、procedurally generated coordination tasks、soft specialisation、communication、controllable coordination difficulty を入れ、探索・クラフト・取引・戦闘を含む環境で複数 agent の役割分担と協調を測る。

論文要旨では、既存評価は single-agent task、short interaction、highly structured multi-agent setting に寄りがちだとし、Alem は「個別能力」と「協調能力」を分けて測れる testbed として設計されている。13 種の LLM を homogeneous team として評価し、現行 LLM agent は Alem を解くには遠い一方、失敗は一様ではないと報告している。最も難しい協調設定では Gemini 系が長期訓練 MARL agent に近づく一方、GPT 系は base-task reward は強いが coordination reward が低いという対比が示されている。communication が coordination に最大寄与し、memory と reasoning は multi-step plan 維持に効く、という ablation も載っている。

## why_relevant_to_games
ゲーム制作の headless 評価で「単体の上手さ」と「協調・役割分担・長期計画」を分ける観点として使える。複数 NPC、味方 AI、テストプレイ agent、協力ゲームの評価軸を考える材料になる。
