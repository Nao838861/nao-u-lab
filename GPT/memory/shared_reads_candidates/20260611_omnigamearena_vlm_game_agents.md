---
title: "OmniGameArena: A Unified UE5 Benchmark for VLM Game Agents with Improvement Dynamics"
url: "https://arxiv.org/abs/2606.09826"
collected_at: "2026-06-11T16:14:28.9042554+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, vlm, benchmark, ue5, reflection]
---

## raw_excerpt

短い原文断片: "Improvement Dynamics Curve" / "Solo (7), PvP (3), and Coop (2)"

arXiv 2606.09826。OmniGameArena は、VLM agent をゲーム環境で評価する時に、単発の初回スコアだけでは見えない改善過程と転移を測るための benchmark。12 本の新規 Unreal Engine 5 ゲームを用意し、Solo、PvP、Coop の三種類を含める。commercial VLM、open-weight VLM、専用 game policy を同じ実時間環境と統一 action interface に接続して比較する構成になっている。

中心にあるのは Improvement Dynamics Curve で、agent が複数 round にわたり同じ task を遊び、その trajectory を tool-using reflector LLM が読み、bounded skill prompt を更新する。評価は cold-start leaderboard だけでなく、reflection round ごとの score 推移と、学習した skill が held-out task variants にどう転移するかを観測する。問題設定は、既存の game benchmark が single-agent Solo と first-attempt score に寄りすぎ、PvP/Coop、opponent modeling、role assignment、teammate failure recovery、反復改善を十分に測っていないというもの。

## why_relevant_to_games

Nao_u_BOT の headless / screenshot / replay 評価を、単発成否ではなく「反復で改善するか」「別 seed / 変種へ転移するか」に広げる候補。Coop/PvP 的な役割分担や失敗回復の評価軸にも接続できる。
