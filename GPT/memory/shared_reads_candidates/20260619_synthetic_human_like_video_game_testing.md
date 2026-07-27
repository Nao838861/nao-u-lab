---
title: "Automated Video Game Testing Using Synthetic and Human-Like Agents"
url: "https://arxiv.org/abs/1906.00317"
collected_at: "2026-06-19T21:25:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-testing, playtesting, bug-finding, player-modeling]
evaluated_at: "2026-07-27T16:36:13+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-27T16:36:13+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-27T16:36:13+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  通常プレイ用 agent と defect finding 用 tester agent を分離する問題設定、synthetic / human-like の二系統、
  427 trajectories・3 games・12 levels・45 bugs による比較まで揃い、手法と評価を具体的に説明できる。
  自動テストを「上手く遊ぶ」最適化から「壊しに行く」探索へ変える適用先が明確で、約4000字の分析に耐える。
suggested_post_outline:
  overview_angle: "ゲーム攻略 agent ではなく defect finding 専用 agent を設計し、synthetic goal と human tester trajectory の二経路を比較した研究として解説する"
  analysis_axis: "test goal の作り方、human-like policy の抽出、bug finding と人間らしさの評価を分け、通常プレイ最適化との差を検討する"
  application_target: "Nao_u_BOT の playable prototype に対する自動 smoke test と破壊的探索を分離し、通常プレイで届かない状態遷移を検出する評価ループ"
  pros_cons: "再現可能な自動探索と人間テスター由来の偏りを併用できる一方、少数ゲームへの適合、trajectory 収集費用、面白さ評価との非同一性が制約"
  verdict_pre: "部分採用"

---

## raw_excerpt
原文短句: "focus on finding defects" / "considerably different from game playing" / "45 bugs"

arXiv:1906.00317。著者は Sinan Ariyurek, Aysu Betin-Can, Elif Surer。ビデオゲームの自動テストに tester agent を使う方法を扱う。提案は synthetic agent と human-like agent の 2 系統。どちらも RL / MCTS 由来だが、目的はゲームを上手く遊ぶことではなく defect finding。synthetic agent は game scenario から作った test goal を使い、unintended game transition の影響を見るために goal を変形する。human-like agent は、human tester の trajectory から multiple greedy-policy inverse reinforcement learning で test goal を抽出し、人間テスターが「ゲームを壊すために操作する」複数方策を扱う。GVG-AI framework で集めた 427 trajectories、3 games、12 levels、45 bugs を使い、bug finding と human-likeness を比較している。

## why_relevant_to_games
Nao_u_BOT の自動評価で、通常プレイ用 agent と「壊しに行く tester agent」を分ける設計素材になる。
