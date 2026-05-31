---
title: "EvoTest: Evolutionary Test-Time Learning for Self-Improving Agentic Systems"
url: "https://www.microsoft.com/en-us/research/publication/evotest-evolutionary-test-time-learning-for-self-improving-agentic-systems/?lang=zh-cn"
collected_at: "2026-05-27T00:23:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent-evaluation, playtesting, test-time-learning, interactive-fiction]
evaluated_at: "2026-05-27T00:28:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T00:54:13+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779809653165429"
posted:
  ts: "1779809653.165429"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779809653165429"
  char_count: 3810
  posted_at: "2026-05-27T00:54:13+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: none
gate_reason: >-
  J-TTL の問題設定、EvoTest の Actor/Evolver 構成、episode 間で system configuration を更新する中核、
  baseline 比較と Detective/Library の結論まで抽出できる。headless playtest を単発評価から反復学習評価へ拡張する具体性があり、4000字概要に耐える。
suggested_post_outline:
  overview_angle: "同じゲームを繰り返し遊ばせ、プレイログから agentic system 自体を進化させる評価・改善ループとして書く。"
  analysis_axis: "J-TTL benchmark、EvoTest の gradient-free 更新、reflection/memory/RL baseline との違い、勝てたゲームと限界を軸にする。"
  application_target: "Nao_u 系 headless harness の複数 episode 化、ログから次回 policy/rubric/tool-use を変える評価サイクル。"
  pros_cons: "メリットは評価と改善が同じ loop に乗る点。デメリットは transcript 解析品質への依存、ゲーム側が探索学習に向く設計を要する点。"
  verdict_pre: "部分採用。すぐ実装するなら headless run の反復ログ比較と config 差分記録から始める。"

---

## raw_excerpt
Microsoft Research の ICLR 2026 採択論文紹介。現在の AI agent は未知環境で複雑な skill をその場で学ぶ能力が弱い、という問題設定から、Jericho Test-Time Learning (J-TTL) benchmark を導入している。J-TTL は同じ interactive fiction game を agent が複数 episode 連続でプレイし、episode ごとに成績改善できるかを見る評価設定。既存の reflection、memory、reinforcement learning などの適応手法はこの設定で苦戦する、と説明されている。提案手法 EvoTest は fine-tuning や gradient を使わず、各 episode 後に agentic system 全体を進化的に更新する枠組みで、Actor Agent がゲームをプレイし、Evolver Agent が transcript を分析して次回 run の configuration を提案する。configuration には prompt の書き換え、有効だった state-action choice の memory 記録、hyperparameter 調整、tool-use routine の学習が含まれる。J-TTL では reflection や memory-only baseline、online fine-tuning より安定して性能を上げ、Detective と Library の 2 ゲームを勝てた唯一の方法だったとされる。

## why_relevant_to_games
ヘッドレスプレイ評価を「1回の合否」ではなく、同じゲームを繰り返し遊ぶ agent が何を学習し次回に反映できたかで見る入口になる。Nao_u 系ゲームの headless harness と、プレイログから設計を変える cycle の外部参照候補。
