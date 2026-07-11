---
title: "OmniGameArena: A Unified UE5 Benchmark for VLM Game Agents with Improvement Dynamics"
url: https://arxiv.org/abs/2606.09826
collected_at: 2026-07-12T02:05:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, vlm-agent, playtesting, evaluation, unreal-engine, reflection]
evaluated_at: "2026-07-12T02:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-12T02:10:00+09:00"
last_decision: postponed_duplicate
evidence: "duplicate of posted candidate: memory/shared_reads_candidates/20260611_omnigamearena_vlm_game_agents.md; permalink: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781162534005769"
next_action: none
stale_after: "2026-08-11"
supersedes: []
gate_reason: >-
  同一 title / URL の candidate が 2026-06-11 に #shared-reads へ投稿済みで、terminal sibling の path と permalink を確認できた。
  内容はゲーム AI の反復改善評価に有用だが、Phase 3 で再投稿する対象ではないため duplicate として postponed に閉じる。
---

## raw_excerpt

ゲーム環境で VLM agent を評価する従来 benchmark は、agent と game の組ごとに初回試行の単一 score だけを報告し、Solo play に偏り、commercial VLM・open-weight VLM・game 専用 policy を同じ手順で比較しにくい、と著者らは問題を置く。OmniGameArena は、新規制作した Unreal Engine 5 ゲーム 12 本（Solo 7、PvP 3、Coop 2）と統一 action interface を用意する。さらに Improvement Dynamics Curve（IDC）という agentic-reflection harness を導入し、tool を使う reflector LLM が、上限を設けた skill prompt を複数 round にわたり自律的に更新する。これにより cold-start leaderboard の値だけでなく、reflection round を重ねた際の score 推移と、学習した skill が held-out task variant でどう振る舞うかを観測する。論文は 12 種の VLM agent の cold-start 結果と、上位 4 agent の IDC 結果を報告する。原文の核となる短句は “single first-attempt score”、 “Improvement Dynamics Curve”、 “held-out task variants”。

## why_relevant_to_games

ゲーム AI の playtest を一回の到達 score で終えず、反省による改善曲線と未見 variant への移行を分けて測る評価設計として、headless bot / AI tester の比較場面に接続しうる。
