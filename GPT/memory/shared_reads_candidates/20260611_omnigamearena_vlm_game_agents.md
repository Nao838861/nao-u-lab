---
title: "OmniGameArena: A Unified UE5 Benchmark for VLM Game Agents with Improvement Dynamics"
url: "https://arxiv.org/abs/2606.09826"
collected_at: "2026-06-11T16:14:28.9042554+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, vlm, benchmark, ue5, reflection]
evaluated_at: "2026-06-11T16:27:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-11T16:27:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-11T16:27:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-11"
supersedes: []
gate_reason: |-
  問題設定が single-attempt / Solo 偏重 benchmark の限界に絞られ、UE5 12 ゲーム、Solo/PvP/Coop、統一 action interface、Improvement Dynamics Curve まで手法の芯が揃っている。
  初回スコアだけでなく reflection round ごとの改善と held-out variant への転移を見るため、Nao_u_BOT の replay / seed 変種 / 反復修正評価に具体接続できる。
  4000字概要では、agent の強さではなく「改善過程を評価対象にする」設計として十分展開できる。
suggested_post_outline:
  overview_angle: "ゲーム agent benchmark を cold-start leaderboard から、反復改善と転移を測る Improvement Dynamics Curve へ拡張する話として整理する。"
  analysis_axis: "UE5 実時間環境、Solo/PvP/Coop の分布、tool-using reflector による bounded skill prompt 更新、held-out variant 転移を分けて読む。"
  application_target: "Nao_u_BOT の headless / screenshot / replay 評価で、単発クリア可否ではなく、同一 seed 反復と別 seed 変種への改善転移を測る評価設計。"
  pros_cons: "利点は改善曲線、協力/対戦、転移を同じ枠で扱える点。弱点は UE5 環境構築と reflector 依存、skill prompt 更新が本当に汎化か暗記かを追加確認する必要がある点。"
  verdict_pre: "部分採用。大規模 UE5 benchmark そのものではなく、改善曲線と held-out 変種評価を制作サイクルへ取り込む。"
---

## raw_excerpt

短い原文断片: "Improvement Dynamics Curve" / "Solo (7), PvP (3), and Coop (2)"

arXiv 2606.09826。OmniGameArena は、VLM agent をゲーム環境で評価する時に、単発の初回スコアだけでは見えない改善過程と転移を測るための benchmark。12 本の新規 Unreal Engine 5 ゲームを用意し、Solo、PvP、Coop の三種類を含める。commercial VLM、open-weight VLM、専用 game policy を同じ実時間環境と統一 action interface に接続して比較する構成になっている。

中心にあるのは Improvement Dynamics Curve で、agent が複数 round にわたり同じ task を遊び、その trajectory を tool-using reflector LLM が読み、bounded skill prompt を更新する。評価は cold-start leaderboard だけでなく、reflection round ごとの score 推移と、学習した skill が held-out task variants にどう転移するかを観測する。問題設定は、既存の game benchmark が single-agent Solo と first-attempt score に寄りすぎ、PvP/Coop、opponent modeling、role assignment、teammate failure recovery、反復改善を十分に測っていないというもの。

## why_relevant_to_games

Nao_u_BOT の headless / screenshot / replay 評価を、単発成否ではなく「反復で改善するか」「別 seed / 変種へ転移するか」に広げる候補。Coop/PvP 的な役割分担や失敗回復の評価軸にも接続できる。
