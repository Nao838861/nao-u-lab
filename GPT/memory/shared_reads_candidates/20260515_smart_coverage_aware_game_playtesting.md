---
title: "Synergizing Code Coverage and Gameplay Intent: Coverage-Aware Game Playtesting with LLM-Guided Reinforcement Learning"
url: "https://arxiv.org/abs/2512.12706"
collected_at: "2026-05-15T06:59:16+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [automated-playtesting, game-qa, code-coverage, reinforcement-learning, llm]
evaluated_at: "2026-05-15T07:02:42+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T07:07:16.378854+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778796437903149"
posted:
  ts: "1778796437.903149"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778796437903149"
  char_count: 3958
  posted_at: "2026-05-15T07:07:16.378854+09:00"
next_action: none
gate_reason: >-
  code coverage と gameplay intent の分断という問題設定、AST diff から reward を作る中核、Overcooked/Minecraft 評価指標が揃っている。
  Nao_u 環境の「今回触った分岐をプレイが踏んだか」問題に直結し、実装可能な harness probe へ落とせる。
suggested_post_outline:
  overview_angle: "ゲーム更新後の playtest を、体験側の意図とコード差分の網羅を同時に満たす探索問題として書く"
  analysis_axis: "AST diff から functional intent を抽出し、coverage と task completion を hybrid reward にして RL agent を誘導する構造"
  application_target: "小改造ごとの headless 評価で、スコアや生存時間に加えて変更分岐・イベント発火・衝突条件を踏んだかを測る仕組み"
  pros_cons: "diff 起点でテスト対象を絞れる利点がある一方、RL 環境整備と reward 設計の重さ、コードと体験意図の対応付けが弱点"
  verdict_pre: "採用"

---

## raw_excerpt

arXiv 2025-12-14 投稿。Games as a Service 的な頻繁な content update で QA 圧力が高まる中、既存の automated testing は code-centric coverage と player-centric gameplay validation が分断されがち、という問題設定。短い原文断片では、code-centric methods は "without understanding gameplay context"、player-centric agents は "fail to cover specific underlying code changes" とされている。

提案は SMART: Structural Mapping for Augmented Reinforcement Testing。LLM が AST differences を読み、変更されたコード差分から functional intent を抽出する。その intent と構造的 coverage を hybrid reward に組み込み、RL agent が gameplay goals を満たしながら modified code branches を探索する。評価は Overcooked と Minecraft。arXiv abstract では、modified code の branch coverage が 94% 超、task completion rate が 98% とされている。

候補としての焦点は、headless playtest を「人間らしいプレイ」か「コード網羅」かの二択にしない設計。ゲーム制作中の自動評価では、楽しい/自然という体験側の signal と、今回の diff が実際に踏まれたかという構造側の signal が別々にズレることがある。この論文は、LLM に差分意図を読ませて reward を作り、RL に実行させる組み合わせとして拾える。

## why_relevant_to_games

Nao_u 環境の headless 評価で、スコアや生存時間だけでなく「今回触った分岐を踏んだか」を見る仕組みを作る時の材料になる。
