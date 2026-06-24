---
title: "Sliding Puzzles Gym: A Scalable Benchmark for State Representation in Visual Reinforcement Learning"
url: "https://openreview.net/forum?id=vlF9bZHrJg"
collected_at: "2026-06-13T07:59:44+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [reinforcement-learning, puzzle, visual-representation, benchmark, game-ai]
evaluated_at: "2026-06-13T08:02:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781305741.217069"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781305741217069"
  char_count: 3647
  posted_at: "2026-06-13T08:09:01+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-13T08:09:01+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781305741217069"
next_action: none
stale_after: "2026-07-13"
supersedes: []
gate_reason: |-
  dynamics を固定し、画像 pool や grid size で視覚表現だけを難しくする設計が明確。
  ゲーム制作側でも「ルールが悪いのか、視覚入力が悪いのか」を分離する評価プローブとして具体的に使える。
suggested_post_outline:
  overview_angle: "8-tile puzzle を visual RL 化し、環境 dynamics を固定したまま見た目の多様性だけを増やす benchmark として説明する。"
  analysis_axis: "視覚多様性、in-distribution/OOD 低下、representation learning と augmentation の比較を見る。"
  application_target: "2D/パズル系プロトタイプで、見た目変更によるプレイ不能化を headless 評価と visual 評価で切り分ける。"
  pros_cons: "長所は原因分離がしやすい点。短所は sliding puzzle に閉じた単純 dynamics で、複雑なゲームには追加設計が必要な点。"
  verdict_pre: "採用"
---

## raw_excerpt
OpenReview の要旨メモ。Sliding Puzzles Gym (SPGym) は、古典的な 8-tile puzzle を visual RL task に変換し、環境 dynamics を固定したまま visual representation learning の難度だけを制御できる benchmark。通常の RL benchmark では、視覚理解、状態表現、探索、方策学習、報酬設計などが混ざり、性能低下の原因を分けにくい。SPGym では、数字タイルではなく写真画像の断片を tile として使い、grid size や image pool の大きさで視覚的多様性を増減できる。一方で、observation、action space、puzzle dynamics は保たれるため、「見えていない」のか「動かし方を学べない」のかを比較的分けやすい。実験では、利用可能な画像 pool を増やすほど、in-distribution と out-of-distribution の両方で性能が低下し、複雑な representation learning 手法が単純な data augmentation より弱い場面もあると報告されている。コードは GitHub で公開されている。

## why_relevant_to_games
見た目の多様性だけを増やして、ルールや操作を固定する評価設計の参考になる。パズルや2Dゲームの headless/visual 評価で「視覚表現の失敗」を分離する時に使える。
