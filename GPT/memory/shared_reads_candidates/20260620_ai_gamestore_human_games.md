---
title: "AI Gamestore: Scalable, Open-Ended Evaluation of Machine General Intelligence with Human Games"
url: https://arxiv.org/abs/2602.17594
collected_at: 2026-06-20T06:58:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, evaluation, playtesting, human-games, vlm, benchmark]
evaluated_at: 2026-06-20T06:47:31+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-06-20T06:52:26+09:00
last_decision: postpone_duplicate_existing_post
evidence: "existing shared-reads post: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779417206845399; prior candidate posted: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779793589433579"
next_action: none
stale_after: "2026-07-20"
supersedes: []
postpone_reason: "Phase 3 duplicate guard: same arXiv 2602.17594 was already posted in #shared-reads with detailed analysis on 2026-05-22 and as a Codex candidate on 2026-05-26."
gate_reason: "AI GameStore は human games を open-ended AI evaluation に使う問題設定が強く、100 games と 7 frontier VLM の短時間評価、world-model learning・memory・planning の弱点という結果まで揃っている。Nao_u_BOT のゲーム試作でも、単なる score ではなく人間向けゲームとして成立する場面を評価対象にする軸へ接続できる。"
suggested_post_outline:
  overview_angle: "AI に都合のよい benchmark ではなく、人間が想像し遊ぶ game space を評価場にする発想。"
  analysis_axis: "Human Games の定義、LLM と human-in-the-loop による環境合成、100 game proof of concept、VLM と人間平均の比較、memory/planning failure。"
  application_target: "自作ゲームの AI playtest で、headless score だけでなく初見理解、画面からの world model、短期記憶、計画更新を測る課題設計に使う。"
  pros_cons: "メリットはゲーム制作と AI 評価の接点が直接的で投稿価値が高い点。デメリットは VLM 中心で、既存の 2D/ROM 制作 harness へ落とすには観測形式の調整が必要な点。"
  verdict_pre: "採用。Phase 3 では Alem と競合する場合、こちらは human-game benchmark 設計として別軸で投稿可能。"
---

## raw_excerpt
人間向けに設計されたゲーム群を、AI の一般知能評価の場として使う提案。通常の AI benchmark は narrow capability を静的に測りがちで、最適化により飽和しやすいという問題意識から、「人間が想像し楽しめる game の空間」を Multiverse of Human Games と見なし、同じ経験量・時間・資源条件で AI と人間の play / learn を比較する。

AI GameStore は LLM と human-in-the-loop を使い、Apple App Store や Steam などの人気ゲーム環境を標準化・コンテナ化された variant として source / adapt し、新しい representative human games を合成する platform として紹介されている。proof of concept では 100 games を生成し、7 つの frontier VLM を短い episode で評価した。結果として、最良モデルでも多くのゲームで人間平均 score の 10% 未満に留まり、world-model learning、memory、planning を要するゲームで特に苦戦したと報告している。

## why_relevant_to_games
「人間向けゲームとして成立しているか」を AI 評価に使う発想が、Nao_u_BOT のゲーム試作にも近い。headless score だけでなく、world model、memory、planning を要求する局面をどう作るかの候補になる。
