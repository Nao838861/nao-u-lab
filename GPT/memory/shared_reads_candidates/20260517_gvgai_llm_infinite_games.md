---
title: "GVGAI-LLM: Evaluating Large Language Model Agents with Infinite Games"
url: "https://arxiv.org/abs/2508.08501"
collected_at: "2026-05-17T01:29:32+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, benchmark, evaluation, agent, game-design]
candidate_status: posted
evaluated_at: "2026-05-17T01:32:24+09:00"
stale_after: "2026-06-16"
supersedes: []
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
last_reviewed_at: "2026-05-17T01:38:12+09:00"
last_decision: posted
gate_reason: |-
  LLM agent を固定タスクではなく、GVGAI のゲーム記述と ASCII scene で増殖可能な infinite games に当てる問題設定が明確。
  meaningful step ratio、step efficiency、overall score など、勝敗以外の失敗観測を headless/scripted player 評価へ移植できる。
  ベンチマーク設計、入力表現、評価指標、ゼロショット弱点、prompting/spatial grounding の改善幅まで概要化できる材料がある。
suggested_post_outline:
  overview_angle: "GVGAI-LLM を、LLM のゲームプレイ能力そのものよりも、変化する小型ゲーム群で空間推論・計画・行動効率を測る評価基盤として紹介する。"
  analysis_axis: "ASCII scene 表現、ゲーム記述によるタスク拡張、意味のある手と効率を分ける指標、structured prompting/spatial grounding の限界を見る。"
  application_target: "Nao_u_BOT の prototype/headless 評価で、勝敗だけでなく無意味入力率、進行効率、局面理解ミスをイベント列から測る probe に使う。"
  pros_cons: "メリットは小型ゲームの自動評価を定量化できる点。デメリットは benchmark が arcade-style に寄り、創作中ゲームの面白さ評価へ直結しない点。"
  verdict_pre: "部分採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778949410890539"
next_action: none
posted:
  ts: "1778949410.890539"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778949410890539"
  char_count: 4180
  posted_at: "2026-05-17T01:38:12+09:00"

---

## raw_excerpt

arXiv:2508.08501。短い引用として、論文は GVGAI-LLM を "video game benchmark" と呼び、LLM の reasoning/problem-solving を評価する枠組みとして説明している。要旨メモ: General Video Game AI framework 上に作られた arcade-style games 群を使い、ゲーム記述言語で新しい games/levels を増やせるため、固定ベンチへの過適合を抑えられる。各 scene は compact な ASCII characters で表され、LLM が扱いやすい。評価指標は meaningful step ratio、step efficiency、overall score などで、ゼロショット評価では空間推論と基本計画に継続的な弱点が出る。structured prompting や spatial grounding は部分改善するが、まだ未解決とされる。

## why_relevant_to_games

ゲームAI評価を「勝った/負けた」だけでなく、意味のある手を打った割合や効率で見る候補。Nao_u_BOT の headless/scripted player でも、ASCII/イベント列に落とした最小ゲーム状態から agent の失敗を測る発想に使える。
