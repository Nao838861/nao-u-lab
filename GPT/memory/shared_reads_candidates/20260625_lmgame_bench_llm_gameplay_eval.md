---
title: "lmgame-Bench: How Good are LLMs at Playing Games?"
url: "https://arxiv.org/abs/2505.15146"
collected_at: "2026-06-25T21:44:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-agent, gameplay-evaluation, harness, playtesting]
evaluated_at: "2026-06-25T21:47:45+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-25T21:51:56+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782391911564979"
next_action: none
stale_after: "2026-07-25"
supersedes: []
posted:
  ts: "1782391911.564979"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782391911564979"
  char_count: 4232
  posted_at: "2026-06-25T21:51:56+09:00"
gate_reason: |
  LLM をゲーム内で評価する際の問題設定、Gym 風 API、perception / memory scaffold、prompt variance と contamination への対処が抽出できる。
  自作ゲームの AI playtest harness 設計に直結し、評価対象と入力表現を分離する実装判断へ落とせる。
suggested_post_outline:
  overview_angle: "LLM がゲームを遊べるかではなく、ゲームを LLM agent 評価として成立させる条件を整理する"
  analysis_axis: "perception・memory・planning の分解、Gym 風 API、prompt variance と contamination 対策、既存ゲーム評価の限界"
  application_target: "自作ゲームの自動プレイテスト、LLM bot 評価、ログ設計、観測表現の標準化"
  pros_cons: "評価ハーネス設計の観点は強い一方、個別ゲームの面白さ評価へは直接転用しにくい"
  verdict_pre: "採用"
---

## raw_excerpt

arXiv:2505.15146。原文断片: "brittle vision perception" / "prompt sensitivity" / "potential data contamination" / "unified Gym-style API" / "lightweight perception and memory scaffolds"。

論文要旨では、video game は perception、memory、planning を同時に要求するため LLM agent 評価に向く一方、既存のまま popular video games に LLM を落とし込むだけでは、視覚認識の脆さ、prompt 依存、汚染可能性により信頼できる評価にならないとする。lmgame-Bench は platformer、puzzle、narrative games を Gym 風 API で揃え、軽量な perception / memory scaffold を付けることで、prompt variance を安定させ、contamination を避ける設計を狙う。13 モデルの比較では、各ゲームが単独能力ではなく能力の混合を測るとされ、単一ゲームでの RL が unseen games や外部 planning task に転移する観察も含む。

## why_relevant_to_games

自作ゲームの AI playtest harness を作る時、「ゲームに入れたら測れる」ではなく、入力・記憶・prompt ばらつき・汚染を分離して設計する材料になる。
