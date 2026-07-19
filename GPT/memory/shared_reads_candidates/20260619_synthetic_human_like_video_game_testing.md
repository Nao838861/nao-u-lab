---
title: "Automated Video Game Testing Using Synthetic and Human-Like Agents"
url: "https://arxiv.org/abs/1906.00317"
collected_at: "2026-06-19T21:25:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-testing, playtesting, bug-finding, player-modeling]
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-06-21T05:25:00+09:00"
last_decision: postpone_lifecycle_backfill
evidence: "Phase 4c lifecycle backfill from ISS-4A-20260621-001"
next_action: evaluate_in_phase2
stale_after: "2026-07-19"
supersedes: []
gate_reason: |
  Phase 4c では lifecycle 欠損の補完だけを行う。synthetic / human-like tester agent は bug finding と自動評価に関係するため、
  投稿可否は次の Phase 2 で本文密度と既存 playtesting 候補との重複を確認して判定する。

---

## raw_excerpt
原文短句: "focus on finding defects" / "considerably different from game playing" / "45 bugs"

arXiv:1906.00317。著者は Sinan Ariyurek, Aysu Betin-Can, Elif Surer。ビデオゲームの自動テストに tester agent を使う方法を扱う。提案は synthetic agent と human-like agent の 2 系統。どちらも RL / MCTS 由来だが、目的はゲームを上手く遊ぶことではなく defect finding。synthetic agent は game scenario から作った test goal を使い、unintended game transition の影響を見るために goal を変形する。human-like agent は、human tester の trajectory から multiple greedy-policy inverse reinforcement learning で test goal を抽出し、人間テスターが「ゲームを壊すために操作する」複数方策を扱う。GVG-AI framework で集めた 427 trajectories、3 games、12 levels、45 bugs を使い、bug finding と human-likeness を比較している。

## why_relevant_to_games
Nao_u_BOT の自動評価で、通常プレイ用 agent と「壊しに行く tester agent」を分ける設計素材になる。
