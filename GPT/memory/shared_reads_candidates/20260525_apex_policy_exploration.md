---
title: "APEX: Autonomous Policy Exploration for Self-Evolving LLM Agents"
url: "https://arxiv.org/abs/2605.21240"
collected_at: "2026-05-25T09:27:51+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, evaluation, exploration, text-adventure, game-ai]
evaluated_at: "2026-05-25T09:32:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-25T09:39:41.9098595+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779669494944199"
posted:
  ts: "1779669494.944199"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779669494944199"
  char_count: 3680
  posted_at: "2026-05-25T09:39:41.9098595+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: none
gate_reason: |-
  exploration collapse という問題設定、strategy map / fork discovery / policy selection の中核、Jericho と WebArena での評価軸が揃っている。
  ゲーム制作では headless playtest agent が既知攻略に固着する問題へ直結し、探索ログを milestone DAG と未探索 fork に分ける運用へ落とせる。
  CoopEval 水準の概要は「自己進化 agent の記憶が探索を狭める逆説」を軸に十分書ける。
suggested_post_outline:
  overview_angle: "自己改善で賢くなるはずの agent が、過去の高報酬ルートに固着して未探索の攻略空間を捨てる問題として書く。"
  analysis_axis: "strategy map を明示構造にし、fork discovery で evidence-grounded な未探索方向を追加し、policy selection で探索/活用を制御する三段構え。"
  application_target: "Nao_u 側の探索型ゲーム、text adventure、headless 攻略 bot 評価で、既知ルート反復と新規ルール発見を分離する harness。"
  pros_cons: "利点は探索失敗を構造ログにできる点。弱点は strategy map 設計と evidence 判定が重く、小型ゲームでは過剰になり得る点。"
  verdict_pre: "部分採用"

---

## raw_excerpt
arXiv 2605.21240。自己進化型 LLM agent が episode 間で memory/reflection を蓄積すると、高報酬だった既知ルートに行動が集中し、未知の改善方向を探しにくくなる問題を「exploration collapse」として扱う。APEX は explicit strategy space を strategy map として保持し、milestone と prerequisite edge の DAG で探索済み/未探索の方向を管理する。Fork Discovery は evidence-grounded な未探索方向を map に追加し、Policy Selection は planning 中の exploration / exploitation を調整する。評価環境には 9 本の Jericho text-adventure games と WebArena が含まれる。短い原文メモ: "behavior concentrates around familiar high-reward routines"。

## why_relevant_to_games
自動テストプレイや headless agent が一度見つけた攻略ルートに固着する問題を、ルート map と fork discovery で扱う候補。探索型/アドベンチャー型ゲームの評価 harness に接続しやすい。
